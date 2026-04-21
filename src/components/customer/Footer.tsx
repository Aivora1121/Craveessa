import { Cake, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-[#2C1810] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">Crave<span className="text-amber-400">essa</span></span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Crafting moments of pure joy through exquisite cakes and pastries. Every creation is a labor of love.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/craveessa/"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber-500 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-amber-400 mb-4 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', path: '/' },
                { label: 'Our Cakes', path: '/catalog' },
                { label: 'Birthday Cakes', path: '/catalog?category=birthday' },
                { label: 'Wedding Cakes', path: '/catalog?category=wedding' },
                { label: 'Custom Orders', path: '/catalog?category=custom' },
                { label: 'Contact Us', path: '/contact' },
              ].map(link => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-white/60 hover:text-amber-400 text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-400 mb-4 text-sm tracking-wider uppercase">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                <span>Shop no 8, Madhuram Apartments, Sinhgad Rd, Sitabag Colony, Dattawadi, Pune, Maharashtra 411009</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>hello@craveessa.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-400 mb-4 text-sm tracking-wider uppercase">Hours</h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex justify-between"><span>Monday - Friday</span><span>4pm - 10pm</span></li>
              <li className="flex justify-between"><span>Saturday</span><span>12pm - 10pm</span></li>
              <li className="flex justify-between"><span>Sunday</span><span>12pm - 10pm</span></li>
            </ul>
            <div className="mt-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-300">Custom orders require 48 hrs advance notice. Wedding cakes need 2 weeks.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-xs">&copy; 2026 Craveessa. All rights reserved.</p>
          <p className="text-white/40 text-xs">Made with love in Pune</p>
        </div>
      </div>
    </footer>
  );
}
