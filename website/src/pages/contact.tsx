import Layout from '../components/layout/Layout';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await axios.post(`${apiUrl}/public/contact`, formData);

      toast.success('Your message has been sent successfully!');
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Contact error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Contact Us - Paylor">
      <Toaster position="top-right" />
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-background transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-main mb-6">
                Get in touch
              </h1>
              <p className="text-xl text-muted mb-12">
                Have a question about our pricing, API, or just want to verify something? We're here to help.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-border">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-main mb-1">Email Us</h3>
                    <p className="text-muted mb-2">Our friendly team is here to help.</p>
                    <a href="mailto:hello@paylor.com" className="text-primary hover:text-main transition-colors">hello@paylor.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-border">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-main mb-1">Call Us</h3>
                    <p className="text-muted mb-2">Mon-Fri from 8am to 5pm.</p>
                    <a href="tel:+254765344101" className="text-primary hover:text-main transition-colors">+254 765 344 101</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-border">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-main mb-1">Visit Us</h3>
                    <p className="text-muted mb-2">Come say hello at our office HQ.</p>
                    <p className="text-main">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="first-name" className="text-sm font-medium text-muted">First name</label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-muted/50"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last-name" className="text-sm font-medium text-muted">Last name</label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-muted/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-muted">Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-muted/50"
                    placeholder="you@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-muted">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-muted/50"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      Sending...
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
