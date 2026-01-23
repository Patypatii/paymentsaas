import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import Head from 'next/head';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/public/auth/admin/login', {
        email,
        password,
      });

      localStorage.setItem('adminToken', response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Paylor Admin</title>
      </Head>
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Warning pattern background */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-radial from-red-900/10 to-transparent opacity-50 pointer-events-none" />

        <div className="w-full max-w-md glass-card p-8 rounded-2xl relative z-10 border-red-500/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Paylor Admin Portal</h1>
            <p className="text-sm text-gray-400 mt-2">Restricted Access only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F1A]/50 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-white placeholder-gray-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F1A]/50 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-white placeholder-gray-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
