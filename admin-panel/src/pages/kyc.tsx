import { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Search, Filter, Users, CheckCircle, XCircle, Clock, Eye, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function KYC() {
    const router = useRouter();
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/login');
            return;
        }
        loadKYCMerchants();
    }, [router, statusFilter]);

    const loadKYCMerchants = async () => {
        try {
            const url = statusFilter
                ? `/admin/kyc/merchants?status=${statusFilter}&limit=100`
                : '/admin/kyc/merchants?limit=100';
            const response = await api.get(url);
            setMerchants(response.data.merchants || []);
        } catch (error) {
            console.error('Failed to load KYC merchants:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-500/10 text-green-400 ring-green-500/20';
            case 'REJECTED': return 'bg-red-500/10 text-red-400 ring-red-500/20';
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-400 ring-gray-500/20';
        }
    };

    const filteredMerchants = merchants.filter(m =>
    (searchTerm === '' ||
        m.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.merchantEmail?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <AdminLayout title="KYC Management - Admin Panel">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="KYC Management - Admin Panel">
            <div className="space-y-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">KYC Management</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Review merchant identities and business documents. Submissions are grouped by merchant.
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
                            placeholder="Search by merchant name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="rounded-md border-0 bg-white/5 py-1.5 px-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Merchant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Docs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stats (P/A/R)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Overall Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Submission</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-transparent">
                                {filteredMerchants.length > 0 ? (
                                    filteredMerchants.map((merchant) => (
                                        <tr key={merchant.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                        <Users className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">{merchant.merchantName}</div>
                                                        <div className="text-sm text-gray-400">{merchant.merchantEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                                {merchant.documentsCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <span className="text-yellow-500 text-xs font-bold" title="Pending">{merchant.pendingCount}</span>
                                                    <span className="text-gray-600">/</span>
                                                    <span className="text-green-500 text-xs font-bold" title="Approved">{merchant.approvedCount}</span>
                                                    <span className="text-gray-600">/</span>
                                                    <span className="text-red-500 text-xs font-bold" title="Rejected">{merchant.rejectedCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(merchant.status)}`}>
                                                    {merchant.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {new Date(merchant.lastSubmission).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/kyc/${merchant.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    View Detailed
                                                    <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                                            No merchants with KYC submissions found.
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
