import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Filter, Download, ArrowUpDown, MoreHorizontal, CheckCircle, XCircle, Clock, Loader2, ChevronLeft, ChevronRight, RefreshCw, X, Receipt, Tag, Phone, Calendar, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export default function Transactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const limit = 10;

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    // Polling logic for pending transactions
    useEffect(() => {
        const hasPending = transactions.some(t => ['PENDING', 'STK_SENT', 'INITIATED'].includes(t.status));

        if (hasPending) {
            const interval = setInterval(() => {
                fetchTransactions(true); // Silent fetch
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(interval);
        }
    }, [transactions]);

    const fetchTransactions = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const offset = (page - 1) * limit;
            const response = await api.get(`/merchants/payments/transactions?limit=${limit}&offset=${offset}`);
            setTransactions(response.data.transactions);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500/10 text-green-400 ring-green-500/20';
            case 'FAILED': return 'bg-red-500/10 text-red-400 ring-red-500/20';
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20';
            default: return 'bg-gray-500/10 text-muted ring-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-3 h-3 mr-1" />;
            case 'FAILED': return <XCircle className="w-3 h-3 mr-1" />;
            case 'PENDING': return <Clock className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    const totalPages = Math.ceil(total / limit);

    // Frontend Filtering Logic
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.phone?.includes(searchTerm) ||
            t.mpesaReceipt?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout title="Transactions - Paylor">
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-main">Transactions</h1>
                        <p className="mt-2 text-sm text-muted">
                            A list of all payments initiated through your account.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 flex flex-wrap gap-2">
                        <button
                            onClick={() => fetchTransactions()}
                            className="inline-flex items-center gap-x-2 rounded-md bg-surface/50 border border-border px-3.5 py-2.5 text-sm font-semibold text-main shadow-sm hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-main shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                        >
                            <Download className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center bg-surface p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-muted" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 bg-background/50 py-1.5 pl-10 pr-3 text-main ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 placeholder-gray-500"
                            placeholder="Search by reference, phone, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative flex items-center gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none inline-flex items-center gap-x-2 rounded-md bg-surface px-3.5 py-2 text-sm font-semibold text-main shadow-sm ring-1 ring-inset ring-border hover:bg-white/5 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="STK_SENT">STK Sent</option>
                            <option value="FAILED">Failed</option>
                            <option value="PENDING">Pending</option>
                        </select>
                        <div className="pointer-events-none absolute right-3">
                            <Filter className="h-4 w-4 text-muted" aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto min-h-[300px] relative">
                        {loading && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        )}
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-surface/50">
                                <tr>
                                    {['#', 'Date', 'Receipt', 'Customer', 'Channel', 'Amount', 'Status', 'Actions'].map((header) => (
                                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                            <div className="flex items-center gap-1 group cursor-pointer hover:text-main">
                                                {header}
                                                {header !== 'Actions' && header !== '#' && <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-transparent">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction, index) => (
                                        <tr key={transaction.id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted">
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-main/80">
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                                                {transaction.mpesaReceipt || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-main/80">
                                                {transaction.phone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {transaction.channel ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-secondary font-bold uppercase text-[10px] tracking-wider">
                                                            {transaction.channel.type === 'TILL' ? 'Buy Goods' :
                                                                transaction.channel.type === 'BANK' ? 'Bank Account' : 'Paybill'}
                                                        </span>
                                                        <span className="text-main font-mono text-xs">
                                                            {transaction.channel.type === 'BANK' ? transaction.channel.accountNumber : transaction.channel.number}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted text-xs italic">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-main font-medium">
                                                {transaction.currency} {transaction.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(transaction.status)}`}>
                                                    {getStatusIcon(transaction.status)}
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedTransaction(transaction)}
                                                    className="text-muted hover:text-main transition-colors p-2 hover:bg-surface rounded-lg"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : !loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center text-muted">
                                            {searchTerm || filterStatus !== 'ALL' ? 'No transactions match your filters.' : 'No transactions found.'}
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {total > 0 && (
                        <div className="flex items-center justify-between border-t border-border bg-surface/50 px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="relative inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-main hover:bg-surface/80 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-main hover:bg-surface/80 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-muted">
                                        Showing <span className="font-medium text-main">{(page - 1) * limit + 1}</span> to <span className="font-medium text-main">{Math.min(page * limit, total)}</span> of <span className="font-medium text-main">{total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted ring-1 ring-inset ring-border hover:bg-surface/50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === i + 1
                                                    ? "bg-primary text-main z-10"
                                                    : "text-muted ring-1 ring-inset ring-border hover:bg-surface/50"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            disabled={page === totalPages}
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted ring-1 ring-inset ring-border hover:bg-surface/50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Detail Modal */}
            <AnimatePresence>
                {selectedTransaction && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTransaction(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl glass-panel overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-main">Transaction Details</h2>
                                    <p className="text-xs text-muted font-mono mt-1">
                                        System Ref: {selectedTransaction.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="p-2 hover:bg-surface rounded-xl text-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Core Info */}
                                <div className="flex items-center justify-between p-4 bg-surface/50 rounded-2xl border border-border">
                                    <div>
                                        <p className="text-xs text-muted uppercase font-bold tracking-wider">Amount</p>
                                        <p className="text-2xl font-black text-main">{selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}</p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center ring-1 ring-inset ${getStatusColor(selectedTransaction.status)}`}>
                                        {getStatusIcon(selectedTransaction.status)}
                                        {selectedTransaction.status}
                                    </div>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface/30 rounded-xl border border-border/50">
                                        <div className="flex items-center gap-2 mb-2 text-primary">
                                            <Receipt className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase">M-Pesa Receipt</span>
                                        </div>
                                        <p className="font-mono text-sm text-main">{selectedTransaction.mpesaReceipt || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-surface/30 rounded-xl border border-border/50">
                                        <div className="flex items-center gap-2 mb-2 text-purple-500">
                                            <Tag className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase">Reference</span>
                                        </div>
                                        <p className="font-mono text-sm text-main truncate">{selectedTransaction.reference}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted">
                                            <Phone className="w-4 h-4" />
                                            <span>Customer</span>
                                        </div>
                                        <span className="text-main font-medium">{selectedTransaction.phone}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted">
                                            <Calendar className="w-4 h-4" />
                                            <span>Date</span>
                                        </div>
                                        <span className="text-main font-medium">
                                            {new Date(selectedTransaction.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2 text-muted">
                                            <Globe className="w-4 h-4" />
                                            <span>M-Pesa Checkout ID</span>
                                        </div>
                                        <span className="text-xs font-mono text-main truncate max-w-[200px]">
                                            {selectedTransaction.transactionId || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-surface/50 border-t border-border">
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="w-full py-3 bg-surface hover:bg-primary/10 border border-border rounded-xl font-bold text-main transition-all"
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
