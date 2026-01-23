import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, Send, Loader2, Phone, DollarSign, Tag, FileText } from 'lucide-react';
import clsx from 'clsx';

interface STKPushModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function STKPushModal({ isOpen, onClose }: STKPushModalProps) {
    const [loading, setLoading] = useState(false);
    const [channels, setChannels] = useState<any[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(false);

    const [formData, setFormData] = useState({
        phone: '',
        amount: '',
        channelId: '',
        reference: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchChannels();
        }
    }, [isOpen]);

    const fetchChannels = async () => {
        try {
            setLoadingChannels(true);
            const response = await api.get('/merchants/channels');
            setChannels(response.data.channels);
            if (response.data.channels.length > 0) {
                setFormData(prev => ({ ...prev, channelId: response.data.channels[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        } finally {
            setLoadingChannels(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/merchants/payments/stk-push', {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            alert('STK Push initiated successfully!');
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to initiate STK Push');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 relative animate-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Send className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Direct STK Push</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Phone Number
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 254712345678"
                            className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-400 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Amount
                            </label>
                            <input
                                type="number"
                                required
                                placeholder="KES 1.00"
                                className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Tag className="h-4 w-4" /> Channel
                            </label>
                            <select
                                className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                                value={formData.channelId}
                                onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                                disabled={loadingChannels}
                            >
                                {channels.length === 0 && !loadingChannels && (
                                    <option value="">No channels found</option>
                                )}
                                {channels.map(channel => (
                                    <option key={channel.id} value={channel.id}>
                                        {channel.name} ({channel.number})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Reference
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. INV-001"
                            className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            rows={2}
                            placeholder="Optional payment notes..."
                            className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || channels.length === 0}
                        className={clsx(
                            "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4",
                            "bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Initiate STK Push
                                <Send className="h-4 w-4 ml-1" />
                            </>
                        )}
                    </button>

                    {channels.length === 0 && !loadingChannels && (
                        <p className="text-xs text-red-400 text-center">
                            You need at least one active channel to send STK pushes.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
