import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRouter } from '../../context/RouterContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { navigate } = useRouter();

  const deliveryFee = subtotal >= 1499 ? 0 : 99;
  const total = subtotal + deliveryFee;

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] pt-20 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-amber-300" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C1810] mb-3">Your cart is empty</h2>
          <p className="text-stone-500 mb-8">Looks like you haven't added any cakes yet. Browse our delicious collection!</p>
          <button
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-2 bg-[#2C1810] text-white font-semibold px-8 py-4 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Browse Cakes <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/catalog')}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-[#2C1810] mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Continue Shopping
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C1810] mb-10">
          Your Cart <span className="text-stone-400 text-2xl font-normal">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={`${item.cake.id}-${item.weight}`} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex gap-5">
                <div
                  className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/cake/${item.cake.slug}`)}
                >
                  <img src={item.cake.image_url} alt={item.cake.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <button
                      onClick={() => navigate(`/cake/${item.cake.slug}`)}
                      className="text-left"
                    >
                      <h3 className="font-serif font-semibold text-[#2C1810] hover:text-amber-700 transition-colors line-clamp-2">{item.cake.name}</h3>
                    </button>
                    <button
                      onClick={() => removeItem(item.cake.id, item.weight)}
                      className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-stone-500">
                    {item.weight && <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">{item.weight}</span>}
                    {item.flavor && <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">{item.flavor}</span>}
                  </div>

                  {item.customization && (
                    <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mt-2 line-clamp-2 border border-amber-100">
                      Note: {item.customization}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cake.id, item.weight, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-stone-50 text-stone-500 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-semibold text-[#2C1810] min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cake.id, item.weight, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-stone-50 text-stone-500 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-[#2C1810] text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-[#2C1810] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Delivery</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                    Add ₹{(1499 - subtotal).toLocaleString('en-IN')} more for free delivery
                  </p>
                )}
                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-[#2C1810] text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-3 bg-[#2C1810] hover:bg-amber-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-md"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-5 flex flex-col gap-2">
                {['Secure SSL Checkout', 'Easy Refund Policy', 'Fresh Baked Guarantee'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-stone-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
