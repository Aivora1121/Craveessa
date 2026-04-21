import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, ToggleLeft, ToggleRight, Search, X, AlertCircle, Star, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Cake, Category, WeightOption } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function AdminCakesPage() {
  const { showToast } = useToast();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = async () => {
    const [cakesRes, catsRes] = await Promise.all([
      supabase.from('cakes').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ]);
    if (cakesRes.data) setCakes(cakesRes.data as Cake[]);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleAvailability = async (cake: Cake) => {
    const { error } = await supabase.from('cakes').update({ is_available: !cake.is_available }).eq('id', cake.id);
    if (!error) {
      setCakes(prev => prev.map(c => c.id === cake.id ? { ...c, is_available: !c.is_available } : c));
      showToast(`${cake.name} marked as ${!cake.is_available ? 'available' : 'unavailable'}`, 'success');
    }
  };

  const toggleFeatured = async (cake: Cake) => {
    const { error } = await supabase.from('cakes').update({ is_featured: !cake.is_featured }).eq('id', cake.id);
    if (!error) {
      setCakes(prev => prev.map(c => c.id === cake.id ? { ...c, is_featured: !c.is_featured } : c));
      showToast(`${cake.name} ${!cake.is_featured ? 'added to' : 'removed from'} featured`, 'info');
    }
  };

  const deleteCake = async (cake: Cake) => {
    if (!confirm(`Delete "${cake.name}"? This action cannot be undone.`)) return;
    setDeleting(cake.id);
    const { error } = await supabase.from('cakes').delete().eq('id', cake.id);
    if (!error) {
      setCakes(prev => prev.filter(c => c.id !== cake.id));
      showToast(`${cake.name} deleted`, 'success');
    } else {
      showToast('Failed to delete cake', 'error');
    }
    setDeleting(null);
  };

  const filtered = cakes.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1810]">Manage Cakes</h1>
          <p className="text-stone-500 text-sm mt-1">{cakes.length} products in catalog</p>
        </div>
        <button
          onClick={() => { setEditingCake(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-[#2C1810] hover:bg-amber-700 text-white font-semibold px-5 py-3 rounded-xl transition-all hover:scale-105 shadow-md"
        >
          <Plus className="w-5 h-5" /> Add New Cake
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search cakes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  {['Product', 'Category', 'Price', 'Status', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-stone-400 px-5 py-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-stone-400">No cakes found</td>
                  </tr>
                ) : filtered.map(cake => (
                  <tr key={cake.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={cake.image_url} alt={cake.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[#2C1810] text-sm line-clamp-1">{cake.name}</p>
                          <p className="text-xs text-stone-400 line-clamp-1">{cake.description.slice(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                        {cake.categories?.name || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#2C1810] text-sm">₹{cake.price.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleAvailability(cake)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                          cake.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {cake.is_available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {cake.is_available ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleFeatured(cake)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          cake.is_featured ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-stone-300 hover:text-amber-400 hover:bg-amber-50'
                        }`}
                        title={cake.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`w-4 h-4 ${cake.is_featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingCake(cake); setShowForm(true); }}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCake(cake)}
                          disabled={deleting === cake.id}
                          className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === cake.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <CakeFormModal
          cake={editingCake}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadData(); }}
        />
      )}
    </div>
  );
}

interface CakeFormModalProps {
  cake: Cake | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function CakeFormModal({ cake, categories, onClose, onSaved }: CakeFormModalProps) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: cake?.name || '',
    slug: cake?.slug || '',
    description: cake?.description || '',
    price: cake?.price?.toString() || '',
    category_id: cake?.category_id || '',
    image_url: cake?.image_url || '',
    is_available: cake?.is_available ?? true,
    is_featured: cake?.is_featured ?? false,
    flavorsText: cake?.flavors?.join(', ') || '',
    tagsText: cake?.tags?.join(', ') || '',
    weightOptionsText: cake?.weight_options?.map(w => `${w.weight}:${w.price}`).join(', ') || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(f => ({ ...f, [name]: val }));
    if (name === 'name' && !cake) {
      setForm(f => ({ ...f, name: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price required';
    if (!form.category_id) e.category_id = 'Category required';
    if (!form.image_url.trim()) e.image_url = 'Image URL required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const parseWeightOptions = (text: string): WeightOption[] => {
    return text.split(',').map(s => s.trim()).filter(Boolean).map(s => {
      const [weight, price] = s.split(':');
      return { weight: weight?.trim() || s, price: Number(price) || 0 };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cake-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('cake-images').getPublicUrl(filePath);
      
      setForm(f => ({ ...f, image_url: data.publicUrl }));
      showToast('Image uploaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error uploading image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category_id: form.category_id,
      image_url: form.image_url.trim(),
      is_available: form.is_available,
      is_featured: form.is_featured,
      flavors: form.flavorsText.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tagsText.split(',').map(s => s.trim()).filter(Boolean),
      weight_options: parseWeightOptions(form.weightOptionsText),
      updated_at: new Date().toISOString(),
    };

    const { error } = cake
      ? await supabase.from('cakes').update(payload).eq('id', cake.id)
      : await supabase.from('cakes').insert(payload);

    if (error) {
      showToast(error.message || 'Failed to save cake', 'error');
    } else {
      showToast(cake ? 'Cake updated!' : 'New cake added!', 'success');
      onSaved();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="font-serif text-xl font-bold text-[#2C1810]">{cake ? 'Edit Cake' : 'Add New Cake'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Cake Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Classic Red Velvet" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.name ? 'border-red-300 bg-red-50' : 'border-stone-200'}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="classic-red-velvet" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.slug ? 'border-red-300 bg-red-50' : 'border-stone-200'}`} />
              {errors.slug && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Category *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white ${errors.category_id ? 'border-red-300 bg-red-50' : 'border-stone-200'}`}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Base Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="1299" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.price ? 'border-red-300 bg-red-50' : 'border-stone-200'}`} />
              {errors.price && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Image URL *</label>
              <div className="flex gap-2">
                <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://images.pexels.com/..." className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.image_url ? 'border-red-300 bg-red-50' : 'border-stone-200'}`} />
                <label className="flex items-center justify-center px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl cursor-pointer transition-colors whitespace-nowrap min-w-[120px]">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? <LoadingSpinner size="sm" /> : <><Upload className="w-4 h-4 mr-2" /> <span className="text-sm font-medium text-stone-600">Upload</span></>}
                </label>
              </div>
              {errors.image_url && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.image_url}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Rich description of the cake..." className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Weight Options (weight:price, comma separated)</label>
              <input name="weightOptionsText" value={form.weightOptionsText} onChange={handleChange} placeholder="500g:1299, 1kg:2199, 1.5kg:2999" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <p className="text-xs text-stone-400 mt-1">Format: weight:price (e.g., 500g:1299)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Flavors (comma separated)</label>
              <input name="flavorsText" value={form.flavorsText} onChange={handleChange} placeholder="Vanilla, Chocolate, Strawberry" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Tags (comma separated)</label>
              <input name="tagsText" value={form.tagsText} onChange={handleChange} placeholder="bestseller, popular" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} className="w-4 h-4 rounded text-amber-500 accent-amber-500" />
                <span className="text-sm font-medium text-stone-600">Available for Purchase</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 rounded text-amber-500 accent-amber-500" />
                <span className="text-sm font-medium text-stone-600">Featured on Homepage</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-stone-100">
          <button onClick={onClose} className="flex-1 border border-stone-200 text-stone-600 font-medium py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#2C1810] hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : cake ? 'Update Cake' : 'Add Cake'}
          </button>
        </div>
      </div>
    </div>
  );
}
