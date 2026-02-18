import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import { ArrowLeft, Ban, CheckCircle, Shield, CreditCard, Activity, Edit, DollarSign, Loader2, X } from 'lucide-react';
import { api } from '../../services/api';

export default function MerchantDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [merchant, setMerchant] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

    // Form states
    const [editForm, setEditForm] = useState({
        businessName: '',
        email: '',
        phoneNumber: '',
        settlementType: '',
        shortcode: '',
        tillNumber: '',
        bankAccountNumber: ''
    });

    const [balanceForm, setBalanceForm] = useState({
        amount: 0,
        description: ''
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMerchantData();
        }
    }, [id]);

    const fetchMerchantData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/merchants/${id}`);
            const { merchant, stats } = response.data;
            setMerchant(merchant);
            setStats(stats);
            setEditForm({
                businessName: merchant.businessName || '',
                email: merchant.email || '',
                phoneNumber: merchant.phoneNumber || '',
                settlementType: merchant.settlementType || '',
                shortcode: merchant.shortcode || '',
                tillNumber: merchant.tillNumber || '',
                bankAccountNumber: merchant.bankAccountNumber || ''
            });
        } catch (error) {
            console.error('Failed to fetch merchant:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMerchant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.put(`/merchants/${id}`, editForm);
            await fetchMerchantData();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdjustBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post(`/merchants/${id}/wallet/adjust`, {
                amount: Number(balanceForm.amount),
                description: balanceForm.description
            });
            await fetchMerchantData();
            setIsBalanceModalOpen(false);
            setBalanceForm({ amount: 0, description: '' });
        } catch (error) {
            console.error('Balance adjustment failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Loading Merchant...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!merchant) {
        return (
            <AdminLayout title="Error">
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold text-main">Merchant not found</h2>
                    <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">Go Back</button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Merchant ${id} - Admin Panel`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-lg text-muted hover:text-main transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-main flex items-center gap-3">
                                {merchant.businessName}
                                <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset ${merchant.status === 'ACTIVE'
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-500/20'
                                    }`}>
                                    {merchant.status}
                                </span>
                            </h1>
                            <p className="text-sm text-muted">{merchant.email} • ID: {merchant.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-x-2 rounded-md bg-surface border border-border px-3.5 py-2.5 text-sm font-semibold text-main shadow-sm hover:bg-white/5 transition-colors"
                        >
                            <Edit className="-ml-0.5 h-5 w-5" />
                            Edit Details
                        </button>
                        <button
                            onClick={() => setIsBalanceModalOpen(true)}
                            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-main shadow-sm hover:bg-primary-hover transition-colors"
                        >
                            <DollarSign className="-ml-0.5 h-5 w-5" />
                            Adjust Balance
                        </button>
                        <button className="inline-flex items-center gap-x-2 rounded-md bg-red-500/10 px-3.5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-red-500/20 hover:bg-red-500/20 transition-colors">
                            <Ban className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            Suspend
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Overview Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 rounded-xl border border-border bg-surface">
                            <h3 className="text-lg font-medium text-main mb-4">Business Details</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-muted">Settlement Type</dt>
                                    <dd className="mt-1 text-sm text-main uppercase">{merchant.settlementType || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted">Business Phone</dt>
                                    <dd className="mt-1 text-sm text-main">{merchant.phoneNumber || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted">Subscription Plan</dt>
                                    <dd className="mt-1 text-sm text-main uppercase">{merchant.planId || 'FREE'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted">Joined Date</dt>
                                    <dd className="mt-1 text-sm text-main">{new Date(merchant.createdAt).toLocaleDateString()}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted">Configured Shortcode / Account</dt>
                                    <dd className="mt-1 text-sm text-main font-mono">
                                        {merchant.shortcode || merchant.tillNumber || merchant.bankAccountNumber || '—'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border bg-surface">
                            <h3 className="text-lg font-medium text-main mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Transaction Stats
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-background/50 rounded-lg border border-border">
                                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Count</p>
                                    <p className="text-xl font-bold text-main">{stats?.totalTransactions || 0}</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded-lg border border-border">
                                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Successful</p>
                                    <p className="text-xl font-bold text-green-500">{stats?.successfulTransactions || 0}</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded-lg border border-border">
                                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Volume</p>
                                    <p className="text-xl font-bold text-main">KES {stats?.totalAmount?.toLocaleString() || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-xl border border-border bg-surface shadow-lg shadow-primary/5">
                            <h3 className="text-sm font-medium text-muted mb-2 uppercase tracking-widest">Active Wallet Balance</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-primary">KES {merchant.wallet?.balance?.toLocaleString() || 0}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted">
                                <CreditCard className="h-4 w-4" />
                                <span>Currency: {merchant.wallet?.currency || 'KES'}</span>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border bg-yellow-500/5">
                            <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
                                <Shield className="h-4 w-4" />
                                Security Status
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-bold text-main">
                                    {merchant.verifiedAt ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-muted">
                                {merchant.verifiedAt
                                    ? `KYC approved on ${new Date(merchant.verifiedAt).toLocaleDateString()}`
                                    : 'Awaiting KYC documentation approval.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Merchant Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-main">Edit Merchant Details</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-background rounded-lg transition-colors">
                                <X className="h-5 w-5 text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateMerchant} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-muted uppercase mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={editForm.businessName}
                                        onChange={e => setEditForm({ ...editForm, businessName: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-main focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-muted uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-main focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-muted uppercase mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phoneNumber}
                                        onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-main focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-muted uppercase mb-1">Settlement Type</label>
                                    <select
                                        value={editForm.settlementType}
                                        onChange={e => setEditForm({ ...editForm, settlementType: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-main focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="PAYBILL">PAYBILL</option>
                                        <option value="TILL">TILL</option>
                                        <option value="BANK_PAYBILL">BANK (PAYBILL)</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-muted uppercase mb-1">Shortcode / Till</label>
                                    <input
                                        type="text"
                                        value={editForm.shortcode}
                                        onChange={e => setEditForm({ ...editForm, shortcode: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-main focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-main hover:bg-background transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-main font-bold hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Adjust Balance Modal */}
            {isBalanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-main">Adjust Wallet Balance</h2>
                            <button onClick={() => setIsBalanceModalOpen(false)} className="p-2 hover:bg-background rounded-lg transition-colors">
                                <X className="h-5 w-5 text-muted" />
                            </button>
                        </div>
                        <p className="text-sm text-muted mb-4">You are adjusting the balance for <span className="text-main font-bold">{merchant.businessName}</span>.</p>
                        <form onSubmit={handleAdjustBalance} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1">Amount (Use negative for deduction)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">KES</span>
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        value={balanceForm.amount}
                                        onChange={e => setBalanceForm({ ...balanceForm, amount: Number(e.target.value) })}
                                        className="w-full bg-background border border-border rounded-lg pl-14 pr-4 py-3 text-main text-lg font-black focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1">Reason / Description</label>
                                <textarea
                                    required
                                    value={balanceForm.description}
                                    onChange={e => setBalanceForm({ ...balanceForm, description: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-main focus:ring-1 focus:ring-primary outline-none h-24 resize-none"
                                    placeholder="e.g. Manual top-up via Bank Transfer"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsBalanceModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-main hover:bg-background transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
