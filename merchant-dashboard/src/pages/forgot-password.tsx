import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
    const router = useRouter();
    const { success, error } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/public/auth/merchant/forgot-password', { email });
            setIsSent(true);
            success('Reset link sent!');
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[128px] opacity-40"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-main tracking-tight">Recover Account</h2>
                    <p className="mt-2 text-sm text-muted">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                <div className="bg-surface/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-border">
                    {!isSent ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 bg-background/50 border border-border rounded-xl text-main placeholder-gray-500 focus:ring-primary focus:border-primary sm:text-sm py-3 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-main bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary/25"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-medium text-main">Check your email</h3>
                            <p className="mt-2 text-sm text-muted">
                                We've sent a password reset link to <span className="text-main font-medium">{email}</span>.
                            </p>
                            <button
                                onClick={() => { setIsSent(false); setEmail(''); }}
                                className="mt-6 text-primary hover:text-primary-hover text-sm font-medium"
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <div className="mt-8 border-t border-border pt-6">
                        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted hover:text-main transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
