import { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Search, Filter, Download, CreditCard, Calendar, Hash, Building2, Info, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import Link from 'next/link';

export default function GlobalServiceDeposits() {
    const [searchTerm, setSearchTerm] = useState('');
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAmount: 0,
        count: 0
    });

    useEffect(() => {
        loadDeposits();
    }, []);

    const loadDeposits = async () => {
        try {
            const response = await api.get('/admin/deposits?limit=100');
            setDeposits(response.data.deposits || []);
            setStats(response.data.stats || { totalAmount: 0, count: 0 });
        } catch (error) {
            console.error('Failed to load global deposits:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDeposits = deposits.filter(d =>
        searchTerm === '' ||
        d.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout title="Service Deposits - Admin Panel">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Global Service Deposits - Admin Panel">
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Global Service Deposits</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Monitor all wallet top-ups and token purchases across the platform.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-xl border border-white/10 bg-surface">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total System Deposits</p>
                        <p className="text-3xl font-black text-primary">KES {stats.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl border border-white/10 bg-surface">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Deposit Count</p>
                        <p className="text-3xl font-black text-white">{stats.count}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center bg-[#111827] p-4 rounded-lg border border-gray-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 bg-white/5 py-1.5 pl-10 pr-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6 placeholder-gray-500"
                            placeholder="Search by merchant or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-xl border border-white/10 overflow-hidden bg-surface">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Merchant</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredDeposits.length > 0 ? (
                                    filteredDeposits.map((deposit) => (
                                        <tr key={deposit.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    {new Date(deposit.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link href={`/merchants/${deposit.merchantId}`} className="flex items-center gap-2 text-sm font-medium text-white hover:text-red-400 transition-colors">
                                                    <Building2 className="h-4 w-4 text-gray-500" />
                                                    {deposit.merchantName}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm font-bold text-white uppercase">KES {deposit.amount.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
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
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                            No service deposits found.
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
