import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Trash2, Check, Copy } from 'lucide-react';

const mockWebhooks = [
    { id: 'wh_1', url: 'https://api.myshop.com/payment/callback', events: ['payment.success', 'payment.failed'], active: true, created: '2024-03-01' },
];

export default function Webhooks() {
    const [webhooks, setWebhooks] = useState(mockWebhooks);
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <DashboardLayout title="Webhooks - Paylor">
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Webhooks</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Configure endpoints to receive real-time notifications about payment events.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                        >
                            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            Add Endpoint
                        </button>
                    </div>
                </div>

                <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                    {webhooks.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <p>No webhooks configured.</p>
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-white/5">
                            {webhooks.map((webhook) => (
                                <li key={webhook.id} className="relative flex items-center space-x-4 py-4 px-6 hover:bg-white/5 transition-colors">
                                    <div className="min-w-0 flex-auto">
                                        <div className="flex items-center gap-x-3">
                                            <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                                                {webhook.url}
                                            </h2>
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${webhook.active ? 'text-green-400 bg-green-400/10 ring-green-400/20' : 'text-gray-400 bg-gray-400/10 ring-gray-400/20'}`}>
                                                {webhook.active ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                                            <p className="truncate">Events: {webhook.events.join(', ')}</p>
                                            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx="1" cy="1" r="1" /></svg>
                                            <p className="whitespace-nowrap">Created on {webhook.created}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-gray-400 hover:text-white transition-colors" title="Test Webhook">Test</button>
                                        <button className="text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

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
            </div>
        </DashboardLayout>
    );
}
