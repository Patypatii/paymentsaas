import { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Search, Filter, Download, ArrowUpDown, MoreHorizontal, CheckCircle, XCircle, Clock, X, CreditCard, User, Building2, Calendar, Hash, Info } from 'lucide-react';
import { api } from '../services/api';

export default function Transactions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const response = await api.get('/admin/transactions?limit=100');
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500/10 text-green-400 ring-green-500/20';
            case 'FAILED': return 'bg-red-500/10 text-red-400 ring-red-500/20';
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-400 ring-gray-500/20';
        }
    };

    const filteredTransactions = transactions.filter(t =>
        searchTerm === '' ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (transaction: any) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <AdminLayout title="Global Transactions - Admin Panel">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Global Transactions - Admin Panel">
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Global Transactions</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            A comprehensive list of all transactions across the platform.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
                        >
                            <Download className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            Export All CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center bg-[#111827] p-4 rounded-lg border border-gray-800">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 bg-white/5 py-1.5 pl-10 pr-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6 placeholder-gray-500"
                            placeholder="Search by ID, merchant, reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="inline-flex items-center gap-x-2 rounded-md bg-white/5 px-3.5 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10">
                        <Filter className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Filter
                    </button>
                </div>

                {/* Table */}
                <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    {['Transaction ID', 'Date', 'Merchant', 'Customer', 'Amount', 'Status', 'Actions'].map((header) => (
                                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-transparent">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                                            {transaction.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                            {transaction.merchantName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {transaction.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                            {transaction.currency} {transaction.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openModal(transaction)}
                                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {isModalOpen && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 bg-[#111827] shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Info className="h-5 w-5 text-red-500" />
                                Transaction Details
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Amount & Status Banner */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="text-2xl font-black text-white">{selectedTransaction.currency} {selectedTransaction.amount?.toLocaleString()}</p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${getStatusColor(selectedTransaction.status)}`}>
                                    {selectedTransaction.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        <User className="h-3 w-3" /> Customer Phone
                                    </label>
                                    <p className="text-sm font-medium text-white">{selectedTransaction.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        <Building2 className="h-3 w-3" /> Merchant
                                    </label>
                                    <p className="text-sm font-medium text-white">{selectedTransaction.merchantName}</p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        <Hash className="h-3 w-3" /> Receipt / Ref
                                    </label>
                                    <p className="text-sm font-mono text-gray-300">{selectedTransaction.mpesaReceipt || selectedTransaction.reference || '—'}</p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        <Calendar className="h-3 w-3" /> Timestamp
                                    </label>
                                    <p className="text-sm text-gray-300">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    <CreditCard className="h-3 w-3" /> Internal Transaction ID
                                </label>
                                <p className="text-xs font-mono text-gray-400 break-all bg-black/30 p-2 rounded border border-white/5">{selectedTransaction.id}</p>
                            </div>

                            {selectedTransaction.description && (
                                <div className="border-t border-white/10 pt-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        Description
                                    </label>
                                    <p className="text-sm text-gray-400 italic">"{selectedTransaction.description}"</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-colors"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
