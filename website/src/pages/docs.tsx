import Layout from '../components/layout/Layout';
import { Book, Code, Lock, Shield, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function Docs() {
  return (
    <Layout title="Documentation - PaymentAPI" description="Comprehensive guides and API reference for integrating Paylor.">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-24 space-y-8 pr-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Getting Started</h3>
                <ul className="space-y-2">
                  <li><Link href="#introduction" className="text-primary hover:text-primary-hover text-sm font-medium block">Introduction</Link></li>
                  <li><Link href="#authentication" className="text-gray-400 hover:text-white text-sm block transition-colors">Authentication</Link></li>
                  <li><Link href="#errors" className="text-gray-400 hover:text-white text-sm block transition-colors">Errors</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Payments</h3>
                <ul className="space-y-2">
                  <li><Link href="#stk-push" className="text-gray-400 hover:text-white text-sm block transition-colors">STK Push</Link></li>
                  <li><Link href="#c2b" className="text-gray-400 hover:text-white text-sm block transition-colors">C2B Register</Link></li>
                  <li><Link href="#query" className="text-gray-400 hover:text-white text-sm block transition-colors">Query Status</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Webhooks</h3>
                <ul className="space-y-2">
                  <li><Link href="#callbacks" className="text-gray-400 hover:text-white text-sm block transition-colors">Handling Callbacks</Link></li>
                  <li><Link href="#security" className="text-gray-400 hover:text-white text-sm block transition-colors">Security</Link></li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-12">

            <section id="introduction">
              <div className="border-b border-white/10 pb-8">
                <h1 className="text-4xl font-bold text-white mb-6">API Documentation</h1>
                <p className="text-xl text-gray-400 leading-relaxed">
                  Welcome to the Paylor API. This documentation will help you integrate M-Pesa payments into your application quickly and securely.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <Terminal className="h-4 w-4" />
                    <span>Base URL:</span>
                    <code className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">https://api.yourplatform.com/v1</code>
                  </div>
                </div>
              </div>
            </section>

            <section id="authentication" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Lock className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-white">Authentication</h2>
              </div>
              <p className="text-gray-400 mb-6">
                We use API keys to authenticate requests. You can view and manage your API keys in the Merchant Dashboard.
                Your API keys carry many privileges, so be sure to keep them secure!
              </p>

              <div className="bg-[#0B0F1A] rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                  <span className="text-xs text-gray-500 font-mono">HEADER</span>
                </div>
                <div className="p-6 font-mono text-sm">
                  <div>Authorization: Bearer <span className="text-yellow-300">sk_live_...</span></div>
                </div>
              </div>
            </section>

            <section id="stk-push" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Code className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-white">Initiate STK Push</h2>
              </div>
              <p className="text-gray-400 mb-6">
                To initiate an M-Pesa STK Push prompt on a customer's phone, send a POST request to the <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">/payments/stk-push</code> endpoint.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Request Parameters</h3>
                  <ul className="space-y-4">
                    <li className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded">phone</code>
                        <span className="text-xs text-red-400">required</span>
                        <span className="text-xs text-gray-500">string</span>
                      </div>
                      <p className="text-sm text-gray-400">The customer phone number in international format (e.g. 2547...)</p>
                    </li>
                    <li className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded">amount</code>
                        <span className="text-xs text-red-400">required</span>
                        <span className="text-xs text-gray-500">number</span>
                      </div>
                      <p className="text-sm text-gray-400">The amount to charge.</p>
                    </li>
                    <li className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded">reference</code>
                        <span className="text-xs text-red-400">required</span>
                        <span className="text-xs text-gray-500">string</span>
                      </div>
                      <p className="text-sm text-gray-400">Your unique reference for this transaction.</p>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0B0F1A] rounded-xl border border-white/10 overflow-hidden h-fit">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">POST</span>
                    <span className="text-xs text-gray-500 font-mono">/payments/stk-push</span>
                  </div>
                  <div className="p-6 font-mono text-sm text-gray-300">
                    <pre>{`{
  "phone": "254712345678",
  "amount": 1000,
  "reference": "INV-123456",
  "description": "Payment for Shoes"
}`}</pre>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </Layout>
  );
}
