import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function Signup() {
  return (
    <Layout title="Sign Up - Paylor" description="Create your account to start accepting payments.">
      <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[#0B0F1A]" />
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 to-transparent opacity-50" />

        <div className="relative z-10 w-full max-w-md space-y-8 glass-card p-8 rounded-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">Create your account</h1>
            <p className="mt-2 text-sm text-gray-400">
              Or <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">sign in to your existing account</Link>
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-blue-500/10 p-4 border border-blue-500/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-300">
                    Registration is handled securely through our Merchant Dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <a
                href="http://localhost:3001/register"
                className="group relative flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
              >
                Continue to Registration
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
