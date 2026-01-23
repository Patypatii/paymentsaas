import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../services/api';

export default function Merchants() {
    const router = useRouter();
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/login');
            return;
        }

        loadMerchants();
    }, [router]);

    const loadMerchants = async () => {
        try {
            const response = await api.get('/admin/merchants');
            setMerchants(response.data.merchants || []);
        } catch (err) {
            console.error('Failed to load merchants:', err);
            // Don't redirect immediately on every error to allow for transient issues
            // but if it's a 401, the interceptor will handle it
        } finally {
            setLoading(false);
        }
    };

    const approveMerchant = async (merchantId: string) => {
        try {
            await api.post(`/admin/merchants/${merchantId}/approve`);
            await loadMerchants();
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to approve merchant');
        }
    };

    const suspendMerchant = async (merchantId: string) => {
        try {
            await api.post(`/admin/merchants/${merchantId}/suspend`);
            await loadMerchants();
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to suspend merchant');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/10 text-green-400 ring-green-500/20';
            case 'SUSPENDED': return 'bg-red-500/10 text-red-400 ring-red-500/20';
            case 'PENDING':
            case 'PENDING_REVIEW': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-400 ring-gray-500/20';
        }
    };

    const filteredMerchants = merchants.filter(m =>
        m.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout title="Loading Merchants...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Merchants - Admin Panel">
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Merchants</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Manage all registered merchants on the platform.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center bg-[#111827] p-4 rounded-lg border border-gray-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 bg-white/5 py-1.5 pl-10 pr-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6 placeholder-gray-500"
                            placeholder="Search merchants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Merchants Table */}
                <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Menu</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-transparent">
                                {filteredMerchants.length > 0 ? (
                                    filteredMerchants.map((merchant) => (
                                        <tr key={merchant.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                                        <span className="text-sm font-medium text-white">
                                                            {(merchant.businessName || merchant.name || 'U').substring(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">{merchant.businessName || merchant.name}</div>
                                                        <div className="text-sm text-gray-400">{merchant.contactEmail || merchant.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(merchant.status)}`}>
                                                    {merchant.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                                                    {merchant.planId || 'STARTER'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    {merchant.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => approveMerchant(merchant.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs text-white transition-colors"
                                                        >
                                                            <CheckCircle className="h-3 w-3" />
                                                            Approve
                                                        </button>
                                                    )}
                                                    {merchant.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => suspendMerchant(merchant.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 rounded text-xs transition-colors"
                                                        >
                                                            <ShieldAlert className="h-3 w-3" />
                                                            Suspend
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={`/merchants/${merchant.id}`} className="text-gray-400 hover:text-white transition-colors">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                                            No merchants found.
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
