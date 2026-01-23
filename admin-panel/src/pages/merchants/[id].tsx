import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import { ArrowLeft, Ban, CheckCircle, Shield, CreditCard, Activity } from 'lucide-react';

export default function MerchantDetail() {
    const router = useRouter();
    const { id } = router.query;

    // Mock data - normally fetch by ID
    const merchant = {
        id: id,
        name: 'Acme Corp',
        email: 'admin@acme.com',
        status: 'ACTIVE',
        plan: 'GROWTH',
        joined: '2024-01-15',
        totalVolume: 'KES 1,200,000',
        settlementType: 'PAYBILL',
        shortcode: '522522'
    };

    return (
        <AdminLayout title={`Merchant ${id} - Admin Panel`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                                {merchant.name}
                                <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-sm font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                                    {merchant.status}
                                </span>
                            </h1>
                            <p className="text-sm text-gray-400">{merchant.email} • ID: {merchant.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="inline-flex items-center gap-x-2 rounded-md bg-red-500/10 px-3.5 py-2.5 text-sm font-semibold text-red-400 shadow-sm ring-1 ring-inset ring-red-500/20 hover:bg-red-500/20 transition-colors">
                            <Ban className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            Suspend Merchant
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Overview Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-medium text-white mb-4">Business Details</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">Settlement Type</dt>
                                    <dd className="mt-1 text-sm text-white">{merchant.settlementType}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">Shortcode / Till</dt>
                                    <dd className="mt-1 text-sm text-white font-mono">{merchant.shortcode}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">Subscription Plan</dt>
                                    <dd className="mt-1 text-sm text-white">{merchant.plan}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">Joined Date</dt>
                                    <dd className="mt-1 text-sm text-white">{merchant.joined}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-400" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="text-sm text-white">API Key Created</p>
                                            <p className="text-xs text-gray-500">Triggered by user admin@acme.com</p>
                                        </div>
                                        <span className="text-xs text-gray-400">2 days ago</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-xl border border-white/10">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Volume</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{merchant.totalVolume}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm text-gray-400">
                                <CreditCard className="h-4 w-4" />
                                <span>1,204 Transactions</span>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-white/10 bg-red-500/5">
                            <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Risk Score
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-white">Low</span>
                                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[10%]"></div>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Based on transaction patterns and disputes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
