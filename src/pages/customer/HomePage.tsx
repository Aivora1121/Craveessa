import { useState, useEffect } from 'react';
import { ChevronRight, Award, Clock, Heart, Truck, Star, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Cake, Category } from '../../lib/types';
import CakeCard from '../../components/customer/CakeCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useRouter } from '../../context/RouterContext';

export default function HomePage() {
  const { navigate } = useRouter();
  const [featuredCakes, setFeaturedCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cakesRes, catsRes] = await Promise.all([
        supabase.from('cakes').select('*, categories(*)').eq('is_featured', true).eq('is_available', true).limit(4),
        supabase.from('categories').select('*').limit(6),
      ]);
      if (cakesRes.data) setFeaturedCakes(cakesRes.data as Cake[]);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-[#FFF8F0]">
      <HeroSection navigate={navigate} />
      <FeaturesSection />
      <CategoriesSection categories={categories} navigate={navigate} />
      <FeaturedSection cakes={featuredCakes} loading={loading} navigate={navigate} />
      <OffersSection navigate={navigate} />
      <TestimonialsSection />
    </div>
  );
}

function HeroSection({ navigate }: { navigate: (p: string) => void }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg"
          alt="Hero cake"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C1810]/90 via-[#2C1810]/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            Pune's Most Loved Cake Boutique
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            Crafted with
            <span className="block text-amber-400">Love &amp; Artistry</span>
          </h1>
          <p className="text-white/75 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
            From birthday celebrations to dream weddings, our master bakers handcraft every cake with premium ingredients and pure passion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/catalog')}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/30"
            >
              Explore Our Cakes
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/catalog?category=custom')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
            >
              Custom Orders
            </button>
          </div>

          <div className="flex items-center gap-6 mt-10">
            <div className="flex -space-x-2">
              {['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=60', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=60', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=60'].map((src, i) => (
                <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-white/60 text-xs mt-0.5">1,200+ happy customers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Award, title: 'Premium Quality', desc: 'Only the finest Belgian chocolate, Madagascan vanilla, and seasonal fruits' },
    { icon: Heart, title: 'Made with Love', desc: 'Each cake is handcrafted by our expert pastry chefs with 10+ years experience' },
    { icon: Clock, title: 'Fresh Daily', desc: 'All cakes are baked fresh to order — never frozen, never compromised' },
    { icon: Truck, title: 'Door Delivery', desc: 'Careful, temperature-controlled delivery across Mumbai and suburbs' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="text-center group">
              <div className="w-14 h-14 bg-amber-50 group-hover:bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <f.icon className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-serif text-[#2C1810] font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({ categories, navigate }: { categories: Category[]; navigate: (p: string) => void }) {
  return (
    <section className="py-20 bg-[#FFF8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-amber-600 font-medium text-sm tracking-wider uppercase mb-3">Browse By Category</p>
          <h2 className="font-serif text-[#2C1810] text-4xl sm:text-5xl font-bold">Every Occasion, Perfected</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/catalog?category=${cat.slug}`)}
              className="group text-center"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative shadow-md group-hover:shadow-xl transition-shadow">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-white text-xs font-semibold">{cat.name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ cakes, loading, navigate }: { cakes: Cake[]; loading: boolean; navigate: (p: string) => void }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-amber-600 font-medium text-sm tracking-wider uppercase mb-3">Our Signature Collection</p>
            <h2 className="font-serif text-[#2C1810] text-4xl sm:text-5xl font-bold">Featured Cakes</h2>
          </div>
          <button
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-2 text-[#2C1810] hover:text-amber-600 font-semibold transition-colors"
          >
            View All Cakes <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cakes.map(cake => (
              <CakeCard key={cake.id} cake={cake} onAddToCart={() => navigate(`/cake/${cake.slug}`)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OffersSection({ navigate }: { navigate: (p: string) => void }) {
  return (
    <section className="py-20 bg-[#2C1810]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative rounded-3xl overflow-hidden group cursor-pointer" onClick={() => navigate('/catalog?category=wedding')}>
            <img src="https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg" alt="Wedding" className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-amber-400 text-sm font-medium tracking-wider uppercase mb-2 block">Premium Collection</span>
              <h3 className="font-serif text-white text-3xl font-bold mb-3">Dream Wedding Cakes</h3>
              <p className="text-white/70 text-sm mb-4">Bespoke multi-tiered masterpieces for your special day</p>
              <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm hover:gap-3 transition-all">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="relative rounded-3xl overflow-hidden bg-amber-500 p-8 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-white/80 text-sm font-medium mb-1 block">Limited Time Offer</span>
                <h3 className="font-serif text-white text-2xl font-bold">Free Delivery</h3>
                <p className="text-white/80 text-sm mt-1">On all orders above ₹1,499</p>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="self-start inline-flex items-center gap-2 bg-white text-amber-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-50 transition-colors mt-4"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-3xl overflow-hidden group cursor-pointer flex-1" onClick={() => navigate('/catalog?category=custom')}>
              <img src="https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg" alt="Custom" className="w-full h-full object-cover min-h-[160px] group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-8">
                <span className="text-amber-400 text-sm font-medium tracking-wider uppercase mb-2">Your Vision</span>
                <h3 className="font-serif text-white text-2xl font-bold mb-2">Custom Cake Studio</h3>
                <p className="text-white/70 text-sm">Fully personalized cakes for any occasion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const reviews = [
    { name: 'Priya Sharma', text: 'The red velvet cake was absolutely divine. Our entire office couldn\'t stop raving about it!', rating: 5, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=60' },
    { name: 'Rahul Mehta', text: 'Ordered a custom wedding cake and it exceeded all expectations. Truly a work of art.', rating: 5, avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=60' },
    { name: 'Anjali Patel', text: 'The rainbow birthday cake made my daughter cry happy tears. Will order again and again!', rating: 5, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=60' },
  ];

  return (
    <section className="py-20 bg-[#FFF8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-amber-600 font-medium text-sm tracking-wider uppercase mb-3">What Our Customers Say</p>
          <h2 className="font-serif text-[#2C1810] text-4xl sm:text-5xl font-bold">Stories of Sweetness</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 italic">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-[#2C1810] text-sm">{r.name}</p>
                  <p className="text-stone-400 text-xs">Verified Customer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
