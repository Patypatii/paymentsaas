import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import Head from 'next/head';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedUsername = username.trim();

    try {
      const response = await api.post('/public/auth/merchant/login', {
        username: trimmedUsername,
        password,
      });

      localStorage.setItem('token', response.data.token);
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
        <title>Login - Paylor Merchant</title>
      </Head>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-50 pointer-events-none" />

        <div className="w-full max-w-md glass-card p-8 rounded-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 mb-4">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
            <h1 className="text-2xl font-bold text-main tracking-tight">Welcome Back!</h1>
            <p className="text-sm text-muted mt-2">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-muted">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setUsername(username.trim())}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-muted/50"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-muted">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-hover transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-muted/50"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-main rounded-lg font-medium transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
