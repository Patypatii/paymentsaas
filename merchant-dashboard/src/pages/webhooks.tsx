import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { Plus, Trash2, Check, Copy } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Webhooks() {

    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const { success, error } = useToast();

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/merchants/webhooks');
            setWebhooks(response.data.webhooks);
        } catch (err) {
            error('Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/merchants/webhooks', {
                url: newUrl,
                events: ['payment.success', 'payment.failed']
            });
            success('Webhook added successfully');
            setShowAddModal(false);
            setNewUrl('');
            fetchWebhooks();
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to add webhook');
        }
    };

    const confirmDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Webhook',
            message: 'Are you sure you want to delete this webhook endpoint? You will stop receiving notifications at this URL.',
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/merchants/webhooks/${id}`);
            success('Webhook deleted');
            fetchWebhooks();
        } catch (err) {
            error('Failed to delete webhook');
        } finally {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    return (
        <DashboardLayout title="Webhooks - Paylor">
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-main">Webhooks</h1>
                        <p className="mt-2 text-sm text-muted">
                            Configure endpoints to receive real-time notifications about payment events.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-main shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                        >
                            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            Add Endpoint
                        </button>
                    </div>
                </div>

                <div className="glass-card rounded-xl border border-border overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-muted">Loading webhooks...</div>
                    ) : webhooks.length === 0 ? (
                        <div className="p-12 text-center text-muted">
                            <p>No webhooks configured.</p>
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-white/5">
                            {webhooks.map((webhook) => (
                                <li key={webhook.id} className="relative flex items-center space-x-4 py-4 px-6 hover:bg-surface/50 transition-colors">
                                    <div className="min-w-0 flex-auto">
                                        <div className="flex items-center gap-x-3">
                                            <h2 className="min-w-0 text-sm font-semibold leading-6 text-main">
                                                {webhook.url}
                                            </h2>
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${webhook.isActive ? 'text-green-400 bg-green-400/10 ring-green-400/20' : 'text-muted bg-gray-400/10 ring-gray-400/20'}`}>
                                                {webhook.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-x-2.5 text-xs leading-5 text-muted">
                                            <p className="truncate">Events: {webhook.events.join(', ')}</p>
                                            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx="1" cy="1" r="1" /></svg>
                                            <p className="whitespace-nowrap">Secret: <code className="bg-white/10 px-1 rounded">{webhook.secret}</code></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(webhook.secret);
                                                success('Secret copied');
                                            }}
                                            className="text-muted hover:text-main transition-colors"
                                            title="Copy Secret"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(webhook.id)}
                                            className="text-muted hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Add Webhook Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-border">
                            <h2 className="text-xl font-bold text-main mb-6">Add Webhook Endpoint</h2>
                            <form onSubmit={handleAddWebhook} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Endpoint URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://your-api.com/callback"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-main focus:ring-1 focus:ring-primary outline-none"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-border text-main hover:bg-surface/50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-main hover:bg-primary-hover font-medium"
                                    >
                                        Add Endpoint
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="rounded-md bg-blue-500/10 p-4 border border-blue-500/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Check className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-300">
                                Webhooks are sent with a signature header <code>X-Payment-Signature</code>.
                                Verify this signature using your webhook secret to ensure the request came from us.
                            </p>
                            <p className="mt-3 text-sm md:ml-6 md:mt-0">
                                <a href="#" className="whitespace-nowrap font-medium text-blue-400 hover:text-blue-300">
                                    Read documentation &rarr;
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText="Delete Endpoint"
                    variant="danger"
                />
            </div>
        </DashboardLayout>
    );
}
