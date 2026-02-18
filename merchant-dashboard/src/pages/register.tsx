import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import Head from 'next/head';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referralSource: '',
    termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the Terms of Service');
      return;
    }

    setLoading(true);
    console.log('📝 Submitting registration...', {
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber
    });

    try {
      const response = await api.post('/public/merchants/register', {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        referralSource: formData.referralSource,
      });
      console.log('✅ Registration successful:', response.data);
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error('❌ Registration failed:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        fullError: err
      });
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Paylor Merchant</title>
      </Head>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 to-transparent opacity-50 pointer-events-none" />

        <div className="w-full max-w-2xl glass-card p-8 rounded-2xl relative z-10">
          <div className="text-center mb-8">
            <img src="/favicon.svg" alt="Paylor" className="w-12 h-12 rounded-xl mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-main tracking-tight">Sign up to Paylor</h1>
            <p className="text-sm text-muted mt-2">Create your merchant account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Your username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-gray-500"
                  placeholder="johndoe"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Your email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-gray-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-gray-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-gray-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-gray-500"
                    placeholder="eg. 712345678"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Your password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-gray-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main placeholder-gray-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">How did you find out about us?</label>
                <select
                  value={formData.referralSource}
                  onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-main"
                >
                  <option value="">Select an option</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Friend">Friend</option>
                  <option value="Event">Event</option>
                  <option value="Search Engine">Search Engine</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-background/50 text-primary focus:ring-primary/50"
                />
                <label htmlFor="terms" className="text-sm text-muted">
                  I accept the <Link href="/terms" className="text-primary hover:text-primary-hover">Terms of Service</Link>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-main rounded-lg font-medium transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
