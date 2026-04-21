import { useState, useEffect } from 'react';
import { ChevronLeft, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../context/RouterContext';
import { supabase } from '../../lib/supabase';
import { CheckoutForm, RazorpayOptions } from '../../lib/types';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function generateOrderNumber() {
  return 'BP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: '', email: '', phone: '', address: '',
    city: '', pincode: '', deliveryDate: '', specialInstructions: '',
  });
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  const deliveryFee = subtotal >= 1499 ? 0 : 99;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items]);

  const validate = (): boolean => {
    const e: Partial<CheckoutForm> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const createOrder = async (): Promise<string | null> => {
    const orderNumber = generateOrderNumber();
    const deliveryAddress = `${form.address}, ${form.city} - ${form.pincode}`;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        delivery_address: deliveryAddress,
        delivery_date: form.deliveryDate || null,
        special_instructions: form.specialInstructions,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error || !order) { showToast('Failed to create order. Please try again.', 'error'); return null; }

    const orderItems = items.map(item => ({
      order_id: order.id,
      cake_id: item.cake.id,
      cake_name: item.cake.name,
      cake_image: item.cake.image_url,
      quantity: item.quantity,
      unit_price: item.price,
      weight: item.weight,
      flavor: item.flavor,
      customization: item.customization,
      subtotal: item.price * item.quantity,
    }));

    await supabase.from('order_items').insert(orderItems);
    return order.id;
  };

  const handlePayment = async () => {
    if (!validate()) { showToast('Please fix the form errors', 'error'); return; }
    setProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { showToast('Payment service unavailable. Please try again.', 'error'); setProcessing(false); return; }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const rzpRes = await fetch(`${supabaseUrl}/functions/v1/razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ amount: total, currency: 'INR', receipt: `order_${Date.now()}` }),
      });

      const rzpData = await rzpRes.json();

      if (rzpData.error) {
        showToast(rzpData.error, 'error');
        setProcessing(false);
        return;
      }

      const orderId = await createOrder();
      if (!orderId) { setProcessing(false); return; }

      const options: RazorpayOptions = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Craveessa',
        description: `Order - ${items.length} item${items.length > 1 ? 's' : ''}`,
        order_id: rzpData.orderId,
        handler: async (response) => {
          await supabase.from('orders').update({
            payment_status: 'paid',
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            status: 'confirmed',
          }).eq('id', orderId);

          clearCart();
          navigate(`/order-confirmation?orderId=${orderId}`);
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#D97706' },
        modal: {
          ondismiss: async () => {
            await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', orderId);
            showToast('Payment cancelled', 'warning');
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setProcessing(false);
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
      setProcessing(false);
    }
  };

  const inputClass = (field: keyof CheckoutForm) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-stone-700 placeholder-stone-400 text-sm transition-colors ${
      errors[field]
        ? 'border-red-300 focus:ring-red-300 bg-red-50'
        : 'border-stone-200 focus:ring-amber-400 bg-white'
    }`;

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-[#2C1810] mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Cart
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C1810] mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="font-semibold text-[#2C1810] text-lg mb-5">Contact & Delivery Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" className={inputClass('name')} />
                  {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com" className={inputClass('email')} />
                  {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} className={inputClass('phone')} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="House/Flat no., Street name, Area" className={inputClass('address')} />
                  {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className={inputClass('city')} />
                  {errors.city && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" maxLength={6} className={inputClass('pincode')} />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pincode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Preferred Delivery Date</label>
                  <input name="deliveryDate" type="date" value={form.deliveryDate} onChange={handleChange} min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} className={inputClass('deliveryDate')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Special Instructions</label>
                  <textarea name="specialInstructions" value={form.specialInstructions} onChange={handleChange} placeholder="Any delivery instructions or special notes..." rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 placeholder-stone-400 resize-none text-sm bg-white" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Secure Payment via Razorpay</p>
                <p className="text-amber-700 text-xs mt-1">Your payment is processed securely. We accept UPI, Cards, Net Banking, and Wallets. Card details are never stored on our servers.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-24">
              <h2 className="font-semibold text-[#2C1810] text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={`${item.cake.id}-${item.weight}`} className="flex gap-3">
                    <img src={item.cake.image_url} alt={item.cake.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2C1810] line-clamp-1">{item.cake.name}</p>
                      <p className="text-xs text-stone-400">{item.weight} · {item.flavor}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-stone-400">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-[#2C1810]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Delivery</span>
                  {deliveryFee === 0 ? <span className="text-green-600 font-medium">Free</span> : <span>₹{deliveryFee}</span>}
                </div>
                <div className="flex justify-between font-bold text-[#2C1810] text-lg pt-2 border-t border-stone-100">
                  <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {processing ? (
                  <><LoadingSpinner size="sm" /> Processing...</>
                ) : (
                  <><CreditCard className="w-5 h-5" /> Pay ₹{total.toLocaleString('en-IN')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
