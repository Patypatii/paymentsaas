import Layout from '../components/layout/Layout';
import Hero from '../components/hero/Hero';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Shield, CheckCircle, Smartphone, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Automated Processes',
      description: 'Transform Your Payments with Seamless Automation! Ditch the tedious manual tasks and embrace tools that integrate effortlessly into your systems, streamlining your workflow for a hassle-free, stress-free experience.',
      image: '/feature-automation.png',
      align: 'right'
    },
    {
      title: 'Real-time Tracking',
      description: 'Take Charge with a Centralized Dashboard! Access all your payments at a glance, track statuses in real time, and uncover insights that empower smarter, confident business decisions—all with ease.',
      image: '/feature-analytics.png',
      align: 'left'
    },
    {
      title: 'Instant Notifications',
      description: 'Stay Connected with Real-Time Payment Alerts on WhatsApp! Get instant notifications wherever you are and manage your business effortlessly on the go. Confidence and control are just a message away.',
      image: '/feature-whatsapp.png',
      align: 'right'
    }
  ];

  const businessTypes = [
    'Online Hustles', 'Restaurants', 'Bars', 'Retailers',
    'Supermarkets', 'Developers', 'Boutiques', 'Saccos', 'Communities'
  ];

  return (
    <Layout>
      <Hero />

      {/* Solutions Section */}
      <section id="services" className="py-24 relative z-10 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Why Paylor</span>
            <h2 className="text-3xl md:text-5xl font-bold text-main mt-4 mb-6">
              Run your business bila hustle!
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              From online stores to physical shops, websites, or developer APIs, Paylor empowers you with world-class, user-friendly payment automation solutions tailored to your needs.
            </p>
          </div>

          <div className="space-y-32">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-16 ${feature.align === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, x: feature.align === 'left' ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="flex-1 space-y-8"
                >
                  <h3 className="text-3xl md:text-4xl font-bold text-main leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <Link href="#services" className="flex items-center gap-4 text-primary font-medium group cursor-pointer">
                    <span>Learn more</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="flex-1 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl transform rotate-12" />
                  <div className="relative rounded-2xl border border-border bg-surface backdrop-blur-sm overflow-hidden shadow-2xl glass-card">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                    />
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="py-24 bg-background relative border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
                <Code className="h-4 w-4" />
                Developer First
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-main mb-6">
                Secure Developer APIs
              </h2>
              <p className="text-muted text-lg mb-8 leading-relaxed">
                With secure and easy-to-integrate APIs, Pay Hero allows businesses to connect their existing systems, enabling them to manage payments directly from their applications. The APIs offer high security and flexibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-main bg-surface border border-border rounded-lg hover:bg-surface/80 transition-all"
                >
                  Read Documentation
                </Link>
                <Link
                  href={process.env.NEXT_PUBLIC_REGISTER_URL || "/register"}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/25"
                >
                  Get API Keys
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative rounded-lg bg-[#0F1623] ring-1 ring-border p-6 font-mono text-sm leading-6 text-gray-400 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/5">
                  <span className="text-green-400">POST</span>
                  <span className="text-gray-500">/api/v1/payments/initiate</span>
                </div>
                <div className="space-y-2">
                  <div><span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> axois.post(<span className="text-green-300">"..."</span>, {'{'}</div>
                  <div className="pl-4">amount: <span className="text-orange-300">1500</span>,</div>
                  <div className="pl-4">phone: <span className="text-green-300">"254712345678"</span>,</div>
                  <div className="pl-4">reference: <span className="text-green-300">"INV-2024-001"</span>,</div>
                  <div className="pl-4">callback_url: <span className="text-green-300">"https://..."</span></div>
                  <div>{'}'});</div>
                  <div className="text-gray-500 mt-4">// Response</div>
                  <div>console.log(response.data);</div>
                  <div className="text-green-400 mt-1">{'{'} "success": true, "message": "Request accepted" {'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">Solutions For Any Business</h2>
            <p className="text-xl text-muted">Streamline. Innovate. Succeed.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {businessTypes.map((type, i) => (
              <div key={i} className="flex items-center justify-center p-6 glass-card rounded-xl border border-border hover:border-primary/30 transition-all hover:-translate-y-1 cursor-default text-center">
                <span className="text-muted font-medium">{type}</span>
              </div>
            ))}
            <Link href={process.env.NEXT_PUBLIC_REGISTER_URL || "/register"} className="flex items-center justify-center p-6 bg-primary rounded-xl hover:bg-primary-hover transition-all cursor-pointer">
              <span className="text-white font-bold flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

