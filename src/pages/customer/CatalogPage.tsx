import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Cake, Category } from '../../lib/types';
import CakeCard from '../../components/customer/CakeCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useRouter } from '../../context/RouterContext';

export default function CatalogPage() {
  const { navigate } = useRouter();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const urlCategory = searchParams.get('category');

  useEffect(() => {
    if (urlCategory) setActiveCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [cakesRes, catsRes] = await Promise.all([
        supabase.from('cakes').select('*, categories(*)').eq('is_available', true),
        supabase.from('categories').select('*'),
      ]);
      if (cakesRes.data) setCakes(cakesRes.data as Cake[]);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = cakes
    .filter(cake => {
      const matchCat = activeCategory === 'all' || cake.categories?.slug === activeCategory;
      const matchSearch = !search || cake.name.toLowerCase().includes(search.toLowerCase()) || cake.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-20">
      <div className="bg-[#2C1810] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Our Cake Collection</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">Handcrafted with premium ingredients for every celebration</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search cakes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 placeholder-stone-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(o => !o)}
            className="sm:hidden flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-3 rounded-xl font-medium"
          >
            <SlidersHorizontal className="w-5 h-5" /> Filters
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-[#2C1810] text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            All Cakes
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#2C1810] text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-stone-400 text-lg mb-4">No cakes found matching your criteria</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="text-amber-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-stone-500 text-sm mb-6">{filtered.length} cake{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(cake => (
                <CakeCard key={cake.id} cake={cake} onAddToCart={() => navigate(`/cake/${cake.slug}`)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
