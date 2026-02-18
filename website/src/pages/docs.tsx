import Layout from '../components/layout/Layout';
import { Book, Code, Lock, Shield, Terminal, Zap, Activity, AlertCircle, CheckCircle2, Copy, ExternalLink, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function Docs() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Layout title="Documentation - Paylor" description="Comprehensive guides and API reference for integrating Paylor.">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-24 space-y-8 pr-8">
              <div>
                <h3 className="text-sm font-semibold text-main tracking-wider uppercase mb-3">Getting Started</h3>
                <ul className="space-y-2">
                  <li><Link href="#introduction" className="text-primary hover:text-primary-hover text-sm font-medium block">Introduction</Link></li>
                  <li><Link href="#authentication" className="text-muted hover:text-main text-sm block transition-colors">Authentication</Link></li>
                  <li><Link href="#base-urls" className="text-muted hover:text-main text-sm block transition-colors">Base URLs</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-main tracking-wider uppercase mb-3">Payments API</h3>
                <ul className="space-y-2">
                  <li><Link href="#stk-push" className="text-muted hover:text-main text-sm block transition-colors">Initiate STK Push</Link></li>
                  <li><Link href="#query-status" className="text-muted hover:text-main text-sm block transition-colors">Query Transaction</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-main tracking-wider uppercase mb-3">Webhooks</h3>
                <ul className="space-y-2">
                  <li><Link href="#webhooks-overview" className="text-muted hover:text-main text-sm block transition-colors">Overview</Link></li>
                  <li><Link href="#webhook-payload" className="text-muted hover:text-main text-sm block transition-colors">Payload Structure</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-main tracking-wider uppercase mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><Link href="#error-codes" className="text-muted hover:text-main text-sm block transition-colors">Error Codes</Link></li>
                  <li><Link href="#best-practices" className="text-muted hover:text-main text-sm block transition-colors">Best Practices</Link></li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-16">

            <section id="introduction">
              <div className="border-b border-border pb-8">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Developer First</span>
                </div>
                <h1 className="text-4xl font-extrabold text-main mb-6">API Documentation</h1>
                <p className="text-xl text-muted leading-relaxed max-w-3xl">
                  Paylor provides a robust, secure, and developer-friendly API for processing M-Pesa payments. Our platform abstracts the complexity of direct integration, allowing you to go live in minutes.
                </p>
              </div>
            </section>

            <section id="authentication" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Lock className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-main">Authentication</h2>
              </div>
              <p className="text-muted mb-8 leading-relaxed">
                The Paylor API uses high-security Bearer tokens (API Keys) for authentication. Requests are made using HTTPS to ensure data privacy. Refer to the table below for the required integration credentials found in your dashboard.
              </p>

              <div className="overflow-hidden rounded-xl border border-border bg-surface mb-8">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-background/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Field Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Usage</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-transparent">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-main">API Username</td>
                      <td className="px-6 py-4 text-sm text-muted">Your unique account identifier.</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-primary">bingwa_tech</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-main">API Password</td>
                      <td className="px-6 py-4 text-sm text-muted">Your Merchant ID.</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-primary">697281a7...</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-main">Auth Token</td>
                      <td className="px-6 py-4 text-sm text-muted">Your active Secret Key (Bearer).</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-primary">pk_live_...</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-main">Webhook Secret</td>
                      <td className="px-6 py-4 text-sm text-muted">The ID of your API key. Used to sign per-request callbacks.</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-primary">6995fe04...</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-background rounded-xl border border-border overflow-hidden mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <span className="text-xs text-muted font-mono uppercase">Raw HTTP Header</span>
                </div>
                <div className="p-6 font-mono text-sm text-main">
                  <div className="text-muted italic mb-2">// Set this header on every request</div>
                  <div>Authorization: Bearer <span className="text-primary font-bold">YOUR_API_KEY</span></div>
                </div>
              </div>

              <div className="bg-background rounded-xl border border-border overflow-hidden mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <span className="text-xs text-muted font-mono uppercase">NestJS / Axios</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <pre className="text-main">{`import axios from 'axios';

const PAYLOR_API_KEY = process.env.PAYLOR_API_KEY; // e.g. payl_live_...
const PAYLOR_BASE_URL = 'https://apipaylor.webnixke.com/api/v1';

const response = await axios.post(
  \`\${PAYLOR_BASE_URL}/merchants/payments/stk-push\`,
  {
    phone: '254712345678',
    amount: 1000,
    reference: 'ORDER-12345',
    channelId: 'PAYL-XXXXXX',
    description: 'Payment for Service',
  },
  {
    headers: {
      'Authorization': \`Bearer \${PAYLOR_API_KEY}\`,
      'Content-Type': 'application/json',
    },
  }
);`}</pre>
                </div>
              </div>

              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <span className="text-xs text-muted font-mono uppercase">Node.js / Fetch</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <pre className="text-main">{`const response = await fetch(
  'https://apipaylor.webnixke.com/api/v1/merchants/payments/stk-push',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.PAYLOR_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: '254712345678',
      amount: 1000,
      reference: 'ORDER-12345',
      channelId: 'PAYL-XXXXXX',
      description: 'Payment for Service',
    }),
  }
);`}</pre>
                </div>
              </div>
            </section>

            <section id="base-urls" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400"><Activity className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-main">Base URLs</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-border bg-surface">
                  <h3 className="text-lg font-bold text-main mb-2">Live Environment</h3>
                  <p className="text-sm text-muted mb-4">Use this URL for production transactions.</p>
                  <code className="block w-full bg-background p-3 rounded-lg border border-border text-primary font-mono text-sm select-all">
                    https://apipaylor.webnixke.com/api/v1
                  </code>
                </div>
                <div className="p-6 rounded-xl border border-border bg-surface opacity-60">
                  <h3 className="text-lg font-bold text-main mb-2">Sandbox Environment</h3>
                  <p className="text-sm text-muted mb-4">Coming soon for testing purposes.</p>
                  <code className="block w-full bg-background p-3 rounded-lg border border-border text-muted font-mono text-sm">
                    https://apipaylor.webnixke.com/api/v1/sandbox
                  </code>
                </div>
              </div>
            </section>

            <section id="stk-push" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Code className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-main">Initiate STK Push</h2>
              </div>
              <p className="text-muted mb-8 leading-relaxed">
                The STK Push (Lipa na M-Pesa Online) allows you to trigger a payment request directly to a customer's phone. The customer will be prompted to enter their M-Pesa PIN to authorize the transaction.
              </p>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-main uppercase tracking-widest mb-4">Request Body</h3>
                    <ul className="space-y-6">
                      <li className="flex gap-4">
                        <div className="flex-shrink-0 w-1 bg-primary/20 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-bold text-primary">phone</code>
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase">Required</span>
                          </div>
                          <p className="text-sm text-muted">Customer phone number in international format (e.g., 254712345678).</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="flex-shrink-0 w-1 bg-primary/20 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-bold text-primary">amount</code>
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase">Required</span>
                          </div>
                          <p className="text-sm text-muted">Amount to charge in KES. Minimum is 1.</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="flex-shrink-0 w-1 bg-primary/20 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-bold text-primary">channelId</code>
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase">Required</span>
                          </div>
                          <p className="text-sm text-muted">The unique ID (alias) of your payment channel (Found in your API Settings).</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="flex-shrink-0 w-1 bg-primary/20 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-bold text-primary">reference</code>
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase">Required</span>
                          </div>
                          <p className="text-sm text-muted">A unique internal reference used for tracking top-ups or specific orders.</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <div className="flex-shrink-0 w-1 bg-primary/20 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-bold text-primary">callbackUrl</code>
                            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded uppercase">Highly Recommended</span>
                          </div>
                          <p className="text-sm text-muted">A public URL to receive instant payment notifications. Securely signed with your <span className="text-main font-medium">Webhook Secret (Key ID)</span>.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-background rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">POST</span>
                        <span className="text-xs text-muted font-mono">/merchants/payments/stk-push</span>
                      </div>
                    </div>
                    <div className="p-6 font-mono text-sm leading-relaxed">
                      <pre className="text-main">{`{
  "phone": "254712345678",
  "amount": 1000,
  "reference": "ORDER-12345",
  "channelId": "PAYL-XJ7K2P",
  "callbackUrl": "https://apiskan.com/api/callback",
  "description": "Payment for Service"
}`}</pre>
                    </div>
                  </div>

                  <div className="bg-background rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center px-4 py-3 border-b border-border bg-surface">
                      <span className="text-xs text-muted font-mono uppercase">Success Response (201)</span>
                    </div>
                    <div className="p-6 font-mono text-sm leading-relaxed">
                      <pre className="text-green-400">{`{
  "transactionId": "TR_A98F2...",
  "status": "SENT",
  "message": "STK Push sent successfully"
}`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="query-status" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><RefreshCcw className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-main">Query Transaction</h2>
              </div>
              <p className="text-muted mb-8 leading-relaxed">
                Check the status of a transaction at any time using our query endpoint. This is particularly useful for verifying payments if you miss a webhook callback.
              </p>

              <div className="bg-background rounded-xl border border-border overflow-hidden max-w-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">GET</span>
                    <span className="text-xs text-muted font-mono">/merchants/payments/transactions/:id</span>
                  </div>
                </div>
                <div className="p-6 font-mono text-sm text-main">
                  <div>GET https://apipaylor.webnixke.com/api/v1/merchants/payments/transactions/<span className="text-primary font-bold">TR_A98F2...</span></div>
                </div>
              </div>
            </section>

            <section id="error-codes" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><AlertCircle className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-main">Error Codes</h2>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-background/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-transparent">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-main">401 UNAUTHORIZED</td>
                      <td className="px-6 py-4 text-sm text-muted">Invalid Auth Token or Credentials.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-main">402 PAYMENT_REQUIRED</td>
                      <td className="px-6 py-4 text-sm text-muted">Insufficient wallet balance to process the fee.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-main">404 NOT_FOUND</td>
                      <td className="px-6 py-4 text-sm text-muted">The requested transaction or channel ID does not exist.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="webhooks-overview" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><ExternalLink className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-main">Webhooks Overview</h2>
              </div>
              <p className="text-muted mb-8 leading-relaxed">
                Webhooks allow your application to receive real-time notifications when a transaction status changes. Instead of polling the status API, Paylor will push data to your server as soon as the event occurs.
              </p>
              <div className="bg-background rounded-xl border border-border p-6 mb-8">
                <h3 className="text-sm font-bold text-main uppercase tracking-widest mb-4">Steps to Integrate</h3>
                <ol className="list-decimal list-inside space-y-3 text-muted text-sm">
                  <li>Create an HTTP POST endpoint on your server (e.g., <code className="text-primary">/api/paylor-webhook</code>).</li>
                  <li>Go to your <Link href="/webhooks" className="text-primary hover:underline">Dashboard &gt; Developers &gt; API Keys</Link>.</li>
                  <li>Copy the <span className="text-main font-bold">Key ID</span> (this is your Webhook Secret).</li>
                  <li>Provide a <code className="text-primary">callbackUrl</code> in your STK Push request body.</li>
                  <li>Secure your endpoint by verifying the <code className="text-primary">X-Webhook-Signature</code> header using your Secret.</li>
                </ol>
              </div>
            </section>

            <section id="webhook-payload" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400"><RefreshCcw className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold text-main">Payload Structure</h2>
              </div>
              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <span className="text-xs text-muted font-mono uppercase">POST Webhook Payload</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <pre className="text-main">{`{
  "event": "payment.success",
  "transaction": {
    "id": "TR_A98F2...",
    "reference": "ORDER-12345",
    "amount": 1000,
    "status": "COMPLETED",
    "providerRef": "...",
    "metadata": {
      "mpesaReceipt": "RFL8S2K9P0"
    }
  }
}`}</pre>
                </div>
              </div>

              <div className="bg-background rounded-xl border border-border overflow-hidden mt-6 mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <span className="text-xs text-muted font-mono uppercase">NestJS — Callback Endpoint</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <pre className="text-main">{`import { Controller, Post, Headers, Body, HttpCode } from '@nestjs/common';
import * as crypto from 'crypto';

@Controller('api')
export class PaylorController {
  @Post('paylor-callback')
  @HttpCode(200)
  handleCallback(
    @Headers('x-webhook-signature') signature: string,
    @Body() body: any,
  ) {
    // 1. Verify the signature (optional but recommended)
    const secret = process.env.PAYLOR_WEBHOOK_SECRET;
    if (secret) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex');
      if (signature !== expected) {
        return { status: 'invalid signature' };
      }
    }

    // 2. Handle the event
    const { event, transaction } = body;
    if (event === 'payment.success') {
      // e.g. credit user wallet, fulfill order...
      console.log('Payment received:', transaction.reference);
    } else if (event === 'payment.failed') {
      console.log('Payment failed:', transaction.reference);
    }

    return { received: true };
  }
}`}</pre>
                </div>
              </div>

              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <span className="text-xs text-muted font-mono uppercase">Express — Callback Endpoint</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <pre className="text-main">{`import express from 'express';
import crypto from 'crypto';

const router = express.Router();

router.post('/paylor-callback', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.PAYLOR_WEBHOOK_SECRET;

  // 1. Verify signature
  if (secret) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  // 2. Handle the event
  const { event, transaction } = req.body;
  if (event === 'payment.success') {
    // e.g. credit user wallet, fulfill order...
    console.log('Payment received:', transaction.reference);
  }

  res.json({ received: true });
});`}</pre>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </Layout>
  );
}
