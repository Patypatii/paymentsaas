import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/layout/AdminLayout';
import { ArrowLeft, CreditCard, Calendar, Hash, Info, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';

export default function MerchantDeposits() {
    const router = useRouter();
    const { id } = router.query;

    const [merchant, setMerchant] = useState<any>(null);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAmount: 0,
        count: 0
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [merchantRes, depositsRes] = await Promise.all([
                api.get(`/admin/merchants/${id}`),
                api.get(`/admin/merchants/${id}/deposits`)
            ]);

            setMerchant(merchantRes.data.merchant);
            setDeposits(depositsRes.data.deposits || []);

            const total = (depositsRes.data.deposits || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
            setStats({
                totalAmount: total,
                count: depositsRes.data.deposits?.length || 0
            });
        } catch (error) {
            console.error('Failed to fetch deposits:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Loading Deposits...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Service Deposits - ${merchant?.businessName || 'Merchant'}`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-lg text-muted hover:text-main transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-main">
                                Service Deposits
                            </h1>
                            <p className="text-sm text-muted">
                                {merchant?.businessName} • Deposit History for Token Purchases
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-xl border border-border bg-surface">
                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Total Lifetime Deposits</p>
                        <p className="text-3xl font-black text-primary">KES {stats.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl border border-border bg-surface">
                        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Number of Deposits</p>
                        <p className="text-3xl font-black text-main">{stats.count}</p>
                    </div>
                </div>

                {/* Deposits Table */}
                <div className="glass-card rounded-xl border border-border overflow-hidden bg-surface">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {deposits.length > 0 ? (
                                    deposits.map((deposit) => (
                                        <tr key={deposit.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-main font-medium">
                                                    <Calendar className="h-4 w-4 text-muted" />
                                                    {new Date(deposit.createdAt).toLocaleDateString()} {new Date(deposit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm font-bold text-main">KES {deposit.amount.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs font-mono text-muted">
                                                    <Hash className="h-3 w-3" />
                                                    {deposit.reference || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${deposit.status === 'COMPLETED'
                                                        ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                                                    }`}>
                                                    {deposit.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted italic">
                                                    <Info className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate max-w-xs">{deposit.description}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="p-3 bg-surface border border-border rounded-full">
                                                    <CreditCard className="h-6 w-6 text-muted" />
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">No service deposits found for this merchant.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
