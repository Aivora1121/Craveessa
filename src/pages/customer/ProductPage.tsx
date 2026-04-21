import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Star, Check, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Cake } from '../../lib/types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../context/RouterContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

interface ProductPageProps {
  slug: string;
}

export default function ProductPage({ slug }: ProductPageProps) {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<{ weight: string; price: number } | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [relatedCakes, setRelatedCakes] = useState<Cake[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('cakes')
        .select('*, categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        const c = data as Cake;
        setCake(c);
        if (c.weight_options?.length > 0) setSelectedWeight(c.weight_options[0]);
        if (c.flavors?.length > 0) setSelectedFlavor(c.flavors[0]);

        const { data: related } = await supabase
          .from('cakes')
          .select('*, categories(*)')
          .eq('category_id', c.category_id)
          .neq('id', c.id)
          .eq('is_available', true)
          .limit(4);
        if (related) setRelatedCakes(related as Cake[]);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleAddToCart = () => {
    if (!cake || !selectedWeight) return;
    addItem(cake, quantity, selectedWeight.weight, selectedWeight.price, selectedFlavor, customization);
    showToast(`${cake.name} added to cart!`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500 text-lg">Cake not found</p>
        <button onClick={() => navigate('/catalog')} className="text-amber-600 font-medium hover:underline">Back to catalog</button>
      </div>
    );
  }

  const allImages = [cake.image_url, ...(cake.images?.filter(img => img !== cake.image_url) || [])].filter(Boolean);
  const currentPrice = selectedWeight ? selectedWeight.price * quantity : cake.price * quantity;

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/catalog')}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-[#2C1810] mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-stone-100 mb-4 shadow-lg">
              <img
                src={allImages[activeImage]}
                alt={cake.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-amber-500' : 'border-transparent hover:border-amber-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {cake.categories && (
              <span className="text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-100 inline-block mb-4">
                {cake.categories.name}
              </span>
            )}

            <h1 className="font-serif text-[#2C1810] text-3xl sm:text-4xl font-bold mb-3">{cake.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-stone-500 text-sm">(128 reviews)</span>
              {cake.is_featured && (
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2">Featured</span>
              )}
            </div>

            <p className="text-stone-600 leading-relaxed mb-8">{cake.description}</p>

            {cake.weight_options && cake.weight_options.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-[#2C1810] mb-3">Select Size & Weight</p>
                <div className="flex flex-wrap gap-3">
                  {cake.weight_options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedWeight(opt)}
                      className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all min-w-[80px] ${
                        selectedWeight?.weight === opt.weight
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-stone-200 text-stone-600 hover:border-amber-300'
                      }`}
                    >
                      <span className="text-xs font-medium">{opt.weight}</span>
                      <span className="font-bold text-sm mt-0.5">₹{opt.price.toLocaleString('en-IN')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {cake.flavors && cake.flavors.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-[#2C1810] mb-3">Select Flavor</p>
                <div className="flex flex-wrap gap-2">
                  {cake.flavors.map(flavor => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedFlavor === flavor
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-stone-200 text-stone-600 hover:border-amber-300'
                      }`}
                    >
                      {selectedFlavor === flavor && <Check className="w-3.5 h-3.5" />}
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="font-semibold text-[#2C1810] mb-2">Customization (Optional)</p>
              <textarea
                value={customization}
                onChange={e => setCustomization(e.target.value)}
                placeholder="E.g., Write 'Happy Birthday John!' on the cake, add rainbow sprinkles..."
                rows={3}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm"
              />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-stone-50 text-stone-600 font-semibold transition-colors"
                >
                  -
                </button>
                <span className="px-5 py-3 font-semibold text-[#2C1810] min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-3 hover:bg-stone-50 text-stone-600 font-semibold transition-colors"
                >
                  +
                </button>
              </div>
              <div>
                <p className="text-xs text-stone-400">Total</p>
                <p className="font-bold text-2xl text-[#2C1810]">₹{currentPrice.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!cake.is_available}
                className="flex-1 flex items-center justify-center gap-3 bg-[#2C1810] hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                disabled={!cake.is_available}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-md shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-6 p-4 bg-white rounded-xl border border-stone-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Fresh Baked', sub: 'Made to order' },
                  { label: 'Free Delivery', sub: 'Above ₹1,499' },
                  { label: 'Easy Returns', sub: 'Quality guarantee' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="font-semibold text-[#2C1810] text-sm">{item.label}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {relatedCakes.length > 0 && (
          <div>
            <h2 className="font-serif text-[#2C1810] text-3xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCakes.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/cake/${c.slug}`)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-stone-100"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-[#2C1810] font-semibold mb-1 line-clamp-1">{c.name}</h3>
                    <p className="font-bold text-amber-700">₹{c.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
