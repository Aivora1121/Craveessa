import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Clock, ArrowRight, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../lib/types';
import { useRouter } from '../../context/RouterContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Being Prepared', icon: Clock },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderConfirmationPage() {
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');

  useEffect(() => {
    if (!orderId) { navigate('/'); return; }
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle();
      if (data) setOrder(data as Order);
      setLoading(false);
    };
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500">Order not found</p>
        <button onClick={() => navigate('/')} className="text-amber-600 hover:underline font-medium">Return Home</button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C1810] mb-2">Order Confirmed!</h1>
          <p className="text-stone-500 text-lg">Thank you, {order.customer_name.split(' ')[0]}! Your order has been received.</p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-2.5 rounded-full mt-4">
            <Package className="w-4 h-4" />
            <span className="font-semibold text-sm">Order #{order.order_number}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100 mb-6">
          <h2 className="font-semibold text-[#2C1810] mb-6">Order Status</h2>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-100" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-amber-400 transition-all duration-1000"
              style={{ width: currentStepIndex > 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : '0%' }}
            />
            <div className="relative flex justify-between">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentStepIndex;
                const active = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                      done ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-stone-100 text-stone-400'
                    } ${active ? 'ring-4 ring-amber-100 scale-110' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-xs text-center leading-tight ${done ? 'text-amber-700 font-semibold' : 'text-stone-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-semibold text-[#2C1810] mb-4">Delivery Details</h3>
            <div className="space-y-2 text-sm text-stone-600">
              <p><span className="font-medium text-stone-800">Name:</span> {order.customer_name}</p>
              <p><span className="font-medium text-stone-800">Email:</span> {order.customer_email}</p>
              <p><span className="font-medium text-stone-800">Phone:</span> {order.customer_phone}</p>
              <p><span className="font-medium text-stone-800">Address:</span> {order.delivery_address}</p>
              {order.delivery_date && (
                <p><span className="font-medium text-stone-800">Delivery Date:</span> {new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-semibold text-[#2C1810] mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee}`}</span></div>
              <div className="flex justify-between font-bold text-[#2C1810] text-base border-t border-stone-100 pt-2 mt-2">
                <span>Total Paid</span><span>₹{order.total_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${order.payment_status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
                Payment {order.payment_status === 'paid' ? 'Successful' : order.payment_status}
              </div>
            </div>
          </div>
        </div>

        {order.order_items && order.order_items.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8">
            <h3 className="font-semibold text-[#2C1810] mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {order.order_items.map(item => (
                <div key={item.id} className="flex gap-4 py-3 border-b border-stone-50 last:border-0">
                  <img src={item.cake_image} alt={item.cake_name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-[#2C1810]">{item.cake_name}</p>
                    <p className="text-xs text-stone-400">{item.weight} · {item.flavor}</p>
                    {item.customization && <p className="text-xs text-amber-700 mt-0.5 line-clamp-1">Note: {item.customization}</p>}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-stone-400">Qty: {item.quantity}</span>
                      <span className="font-semibold text-[#2C1810] text-sm">₹{item.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-[#2C1810] hover:bg-amber-700 text-white font-semibold py-4 rounded-xl transition-all"
          >
            <Home className="w-5 h-5" /> Return Home
          </button>
          <button
            onClick={() => navigate('/catalog')}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-4 rounded-xl transition-all"
          >
            Order More Cakes <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
