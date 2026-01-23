import Layout from '../components/layout/Layout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <Layout title="Contact Us - Paylor">
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0F1A]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Get in touch
              </h1>
              <p className="text-xl text-gray-400 mb-12">
                Have a question about our pricing, API, or just want to verify something? We're here to help.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Email Us</h3>
                    <p className="text-gray-400 mb-2">Our friendly team is here to help.</p>
                    <a href="mailto:hello@paylor.com" className="text-primary hover:text-white transition-colors">hello@paylor.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Call Us</h3>
                    <p className="text-gray-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                    <a href="tel:+254765344101" className="text-primary hover:text-white transition-colors">+254 765 344 101</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Visit Us</h3>
                    <p className="text-gray-400 mb-2">Come say hello at our office HQ.</p>
                    <p className="text-white">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-white/10">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="first-name" className="text-sm font-medium text-gray-300">First name</label>
                    <input type="text" id="first-name" className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last-name" className="text-sm font-medium text-gray-300">Last name</label>
                    <input type="text" id="last-name" className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                  <input type="email" id="email" className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600" placeholder="you@company.com" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
                  <textarea id="message" rows={4} className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600" placeholder="How can we help you?" />
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-primary/25">
                  Send Message
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
