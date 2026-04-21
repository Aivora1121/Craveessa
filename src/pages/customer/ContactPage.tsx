import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    showToast('Message sent! We\'ll get back to you within 24 hours.', 'success');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setSending(false);
  };

  const contactInfo = [
    { icon: MapPin, title: 'Visit Our Bakery', details: ['Shop no 8, Madhuram Apartments, Sinhgad Rd, Sitabag Colony, Dattawadi, Pune, Maharashtra 411009'] },
    { icon: Phone, title: 'Call Us', details: ['+91 98765 43210', '+91 22 1234 5678'] },
    { icon: Mail, title: 'Email Us', details: ['hello@craveessa.com', 'orders@craveessa.com'] },
    { icon: Clock, title: 'Opening Hours', details: ['Mon-Fri: 4pm – 10pm', 'Sat: 12pm – 10pm  |  Sun: 12pm – 10pm'] },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-20">
      <div className="bg-[#2C1810] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">Have questions about custom orders, delivery, or just want to say hello?</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-[#2C1810] mb-2">{info.title}</h3>
              {info.details.map((d, j) => (
                <p key={j} className="text-stone-500 text-sm">{d}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.6!2d72.8356!3d19.0598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8c1b6e2b7c7%3A0x1234567890abcdef!2sBandra+West%2C+Mumbai!5e0!3m2!1sen!2sin!4v1609459200000!5m2!1sen!2sin"
              width="100%"
              height="400"
              className="w-full"
              loading="lazy"
              title="Craveessa Location"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="p-5">
              <p className="font-semibold text-[#2C1810]">Craveessa</p>
              <p className="text-stone-500 text-sm mt-1">Dattawadi, Sinhgad Road, Pune</p>
              <div className="flex gap-3 mt-4">
                {[
                  { icon: Instagram, label: '@craveessa' },
                  { icon: Facebook, label: 'Craveessa' },
                  { icon: MessageCircle, label: 'WhatsApp Us' },
                ].map((s, i) => (
                  <a key={i} href="#" className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-600 transition-colors">
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <h2 className="font-serif text-2xl font-bold text-[#2C1810] mb-2">Send Us a Message</h2>
            <p className="text-stone-500 text-sm mb-6">We respond within 24 hours, often much sooner!</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Priya Sharma" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 placeholder-stone-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 placeholder-stone-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="priya@example.com" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 placeholder-stone-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 text-sm bg-white">
                  <option value="">Select a topic</option>
                  <option value="custom-order">Custom Cake Order</option>
                  <option value="wedding">Wedding Cake Inquiry</option>
                  <option value="delivery">Delivery Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Message *</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us about your dream cake or ask us anything..." className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 placeholder-stone-400 resize-none text-sm" />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-3 bg-[#2C1810] hover:bg-amber-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {sending ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
