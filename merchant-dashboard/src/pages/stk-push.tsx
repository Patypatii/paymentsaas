import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { Send, Loader2, Phone, DollarSign, Tag, FileText, AlertCircle, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useToast } from '../context/ToastContext';

export default function DirectSTKPush() {
    const router = useRouter();
    const { success, error, info } = useToast();
    const [loading, setLoading] = useState(false);
    const [channels, setChannels] = useState<any[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(true);

    const [formData, setFormData] = useState({
        phone: '',
        amount: '',
        channelId: '',
        reference: '',
        description: ''
    });

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            setLoadingChannels(true);
            const response = await api.get('/merchants/channels');
            setChannels(response.data.channels);
            if (response.data.channels.length > 0) {
                setFormData(prev => ({ ...prev, channelId: response.data.channels[0].id }));
            }
        } catch (err) {
            error('Failed to load your payment channels');
        } finally {
            setLoadingChannels(false);
        }
    };

    const generateReference = () => {
        const prefix = 'PAY';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        const ref = `${prefix}-${timestamp}-${random}`;
        setFormData(prev => ({ ...prev, reference: ref }));
        return ref;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Auto-generate reference if empty
            let finalReference = formData.reference;
            if (!finalReference.trim()) {
                finalReference = generateReference();
            }

            await api.post('/merchants/payments/stk-push', {
                ...formData,
                reference: finalReference,
                amount: parseFloat(formData.amount)
            });
            success('STK Push initiated! Please check your phone.');
            router.push('/transactions');
        } catch (err: any) {
            error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to initiate STK Push');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Direct STK Push - Paylor">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Send className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-main">Direct STK Push</h1>
                        <p className="text-muted text-sm">Initiate an M-Pesa STK push payment directly to one of your channels.</p>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-2xl border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-muted flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Customer Phone
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 254712345678"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <p className="text-[10px] text-gray-500">Must start with 254</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-muted flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" /> Amount (KES)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="1.00"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-muted flex items-center gap-2">
                                <Tag className="h-4 w-4" /> Settlement Channel
                            </label>
                            <select
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                value={formData.channelId}
                                onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                                disabled={loadingChannels}
                            >
                                {loadingChannels ? (
                                    <option>Loading channels...</option>
                                ) : channels.length === 0 ? (
                                    <option value="">No active channels found</option>
                                ) : (
                                    channels.map(channel => (
                                        <option key={channel.id} value={channel.id}>
                                            {channel.type === 'BANK'
                                                ? `${channel.name} — ${channel.bankName} (${channel.accountNumber})`
                                                : `${channel.name} — ${channel.type} (${channel.number})`
                                            }
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-medium text-muted flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Transaction Reference
                                </label>
                                <button
                                    type="button"
                                    onClick={generateReference}
                                    className="text-[10px] text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-colors uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-md border border-primary/10"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Generate
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="e.g. INV-10203"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-500">Leaving blank will auto-generate a reference.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-muted">Description</label>
                            <textarea
                                rows={3}
                                placeholder="What is this payment for?"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {channels.length === 0 && !loadingChannels && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-200">
                                    <p className="font-bold">No active channels found</p>
                                    <p className="opacity-80">You must add and activate at least one Till or Paybill number before you can initiate payments.</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || channels.length === 0}
                            className={clsx(
                                "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
                                "bg-primary text-main hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] mt-4"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Send STK Push
                                    <Send className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
