import { ShoppingCart, Star, Tag } from 'lucide-react';
import { Cake } from '../../lib/types';
import { useRouter } from '../../context/RouterContext';

interface CakeCardProps {
  cake: Cake;
  onAddToCart?: (cake: Cake) => void;
}

export default function CakeCard({ cake, onAddToCart }: CakeCardProps) {
  const { navigate } = useRouter();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 border border-stone-100">
      <div
        className="relative overflow-hidden cursor-pointer aspect-[4/3]"
        onClick={() => navigate(`/cake/${cake.slug}`)}
      >
        <img
          src={cake.image_url}
          alt={cake.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {cake.is_featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3 fill-white" />
            Featured
          </div>
        )}

        {!cake.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}

        {cake.tags?.includes('bestseller') && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Bestseller
          </div>
        )}
      </div>

      <div className="p-4">
        {cake.categories && (
          <div className="flex items-center gap-1 mb-2">
            <Tag className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-amber-600 font-medium">{cake.categories.name}</span>
          </div>
        )}

        <button
          onClick={() => navigate(`/cake/${cake.slug}`)}
          className="text-left w-full"
        >
          <h3 className="font-serif text-[#2C1810] font-semibold text-lg leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-1">
            {cake.name}
          </h3>
        </button>

        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">
          {cake.description}
        </p>

        {cake.flavors && cake.flavors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {cake.flavors.slice(0, 3).map(flavor => (
              <span key={flavor} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                {flavor}
              </span>
            ))}
            {cake.flavors.length > 3 && (
              <span className="text-xs text-stone-400">+{cake.flavors.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">Starting from</span>
            <p className="text-[#2C1810] font-bold text-lg">
              ₹{cake.price.toLocaleString('en-IN')}
            </p>
          </div>

          {cake.is_available ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) {
                  onAddToCart(cake);
                } else {
                  navigate(`/cake/${cake.slug}`);
                }
              }}
              className="flex items-center gap-2 bg-[#2C1810] hover:bg-amber-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
              Order Now
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 bg-stone-200 text-stone-400 text-sm font-medium px-4 py-2.5 rounded-xl cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
