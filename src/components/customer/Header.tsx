import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Cake } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRouter } from '../../context/RouterContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Our Cakes', path: '/catalog' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const { navigate, path } = useRouter();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMenuOpen(false), [path]);

  const isHome = path === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-[#2C1810] shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center group-hover:bg-amber-400 transition-colors">
            <Cake className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-serif text-xl font-bold tracking-wide">
            Crave<span className="text-amber-400">essa</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-sm font-medium tracking-wide transition-colors ${
                path === link.path
                  ? 'text-amber-400'
                  : 'text-white/80 hover:text-amber-400'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-amber-500 transition-all duration-300 group"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 group-hover:bg-white text-white group-hover:text-amber-600 text-xs font-bold rounded-full flex items-center justify-center transition-colors">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          <button
            className="md:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#2C1810] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  path === link.path
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-white/80 hover:text-amber-400 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
