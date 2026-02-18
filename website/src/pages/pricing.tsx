import Layout from '../components/layout/Layout';
import Link from 'next/link';
import { Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 1000,
    currency: 'KES',
    period: 'month',
    description: 'Perfect for small businesses just getting started with M-Pesa API.',
    features: [
      'STK Push payments',
      'Basic webhook support',
      'Transaction logs (30 days)',
      'Email support',
      'Unlimited transactions',
      'Standard Rate Limiting'
    ],
    highlight: false
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    price: 5000,
    currency: 'KES',
    period: 'month',
    description: 'For growing businesses enabling automated payment flows.',
    features: [
      'Everything in Starter',
      'Advanced webhook support',
      'Transaction logs & analytics (90 days)',
      'Priority email & chat support',
      'Custom webhook URLs',
      'Unlimited transactions',
      'Higher Rate Limits'
    ],
    highlight: true
  },
  {
    id: 'SCALE',
    name: 'Scale',
    price: 'Custom',
    currency: '',
    period: '',
    description: 'Enterprise-grade infrastructure for high volume merchants.',
    features: [
      'Everything in Growth',
      'Dedicated account manager',
      'Custom webhook URLs',
      'SLA guarantee (99.99%)',
      'Custom integrations',
      'Unlimited transactions',
      'Custom Rate Limits',
      'Quarterly Business Review'
    ],
    highlight: false
  },
];

export default function Pricing() {
  return (
    <Layout title="Pricing - PaymentAPI" description="Transparent pricing for every stage of your business.">
      <div className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
            <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-main sm:text-5xl">
              Pricing that scales with you
            </p>
            <p className="mt-6 text-lg leading-8 text-muted">
              Simple, transparent pricing. No hidden fees. No long-term contracts.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative flex flex-col justify-between rounded-3xl p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10 ${plan.highlight
                  ? 'bg-primary/10 ring-primary/50 shadow-primary/20 scale-105 z-10'
                  : 'bg-surface/50 ring-border/10 hover:ring-border/20'
                  } backdrop-blur-sm transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 id={plan.id} className={`text-lg font-semibold leading-8 ${plan.highlight ? 'text-primary' : 'text-main'}`}>
                      {plan.name}
                    </h3>
                    {plan.highlight && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary ring-1 ring-inset ring-primary/20">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">
                    {plan.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-main">
                      {typeof plan.price === 'number'
                        ? `${plan.currency} ${plan.price.toLocaleString()}`
                        : plan.price
                      }
                    </span>
                    {plan.period && (
                      <span className="text-sm font-semibold leading-6 text-muted">/{plan.period}</span>
                    )}
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={process.env.NEXT_PUBLIC_REGISTER_URL || "/register"}
                  className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors ${plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25'
                    : 'bg-surface text-main hover:bg-surface/80 border border-border'
                    }`}
                  aria-describedby={plan.id}
                >
                  Get started today
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <div className="relative rounded-full px-4 py-1 text-sm leading-6 text-muted ring-1 ring-border/10 hover:ring-border/20 bg-surface">
              More questions about our pricing?{' '}
              <Link href="/contact" className="font-semibold text-primary">
                Contact sales <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
