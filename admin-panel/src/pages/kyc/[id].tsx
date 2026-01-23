import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    AlertTriangle,
    ArrowLeft,
    ExternalLink,
    Shield
} from 'lucide-react';
import { api } from '../../services/api';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function MerchantKYCDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/login');
            return;
        }
        loadMerchantKYC();
    }, [id, router]);

    const loadMerchantKYC = async () => {
        try {
            const response = await api.get(`/admin/kyc/merchants/${id}`);
            setData(response.data);
        } catch (error) {
            console.error('Failed to load merchant KYC detail:', error);
            alert('Failed to load KYC details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (kycId: string) => {
        if (!confirm('Are you sure you want to approve this document?')) return;

        try {
            await api.post(`/admin/kyc/${kycId}/approve`);
            await loadMerchantKYC();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to approve document');
        }
    };

    const handleReject = async () => {
        if (!selectedDoc || !rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            await api.post(`/admin/kyc/${selectedDoc.id}/reject`, { reason: rejectReason });
            await loadMerchantKYC();
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedDoc(null);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to reject document');
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

    const getTypeLabel = (type: string) => {
        return type.replace(/_/g, ' ');
    };

    if (loading) {
        return (
            <AdminLayout title="KYC Detail - Admin Panel">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!data) return null;

    const { merchant, documents } = data;

    return (
        <AdminLayout title={`KYC - ${merchant.businessName}`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/kyc" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{merchant.businessName}</h1>
                        <p className="text-sm text-gray-400">KYC Verification Case • {merchant.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Merchant Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-red-500" />
                                Merchant Profile
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Business Name</p>
                                    <p className="text-sm text-white font-medium">{merchant.businessName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Email Address</p>
                                    <p className="text-sm text-white font-medium">{merchant.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                                    <p className="text-sm text-white font-medium">{merchant.phoneNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Account Status</p>
                                    <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${merchant.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                                        }`}>
                                        {merchant.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-white/10 bg-red-500/5">
                            <h3 className="text-sm font-semibold text-white mb-2 uppercase">Review Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Total Documents</span>
                                    <span className="text-white font-mono">{documents.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Approved</span>
                                    <span className="text-green-500 font-mono">{documents.filter((d: any) => d.status === 'APPROVED').length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Pending</span>
                                    <span className="text-yellow-500 font-mono">{documents.filter((d: any) => d.status === 'PENDING').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Documents List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {documents.map((doc: any) => (
                                <div key={doc.id} className="glass-card flex flex-col rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group">
                                    {/* Document Header */}
                                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-500" />
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">{getTypeLabel(doc.type)}</span>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${getStatusColor(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </div>

                                    {/* Document Preview */}
                                    <div className="relative aspect-[4/3] bg-black/40 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={doc.fileUrl}
                                            alt={doc.type}
                                            className="max-h-full max-w-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                                            onClick={() => window.open(doc.fileUrl, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                                                title="View Full Size"
                                            >
                                                <ExternalLink className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Document Info & Actions */}
                                    <div className="p-4 space-y-3 bg-[#0B0F1A]/50">
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Submitted: {new Date(doc.createdAt).toLocaleString()}
                                        </p>

                                        {doc.status === 'REJECTED' && doc.rejectionReason && (
                                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 flex items-start gap-2">
                                                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span>{doc.rejectionReason}</span>
                                            </div>
                                        )}

                                        {doc.status === 'PENDING' && (
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleApprove(doc.id)}
                                                    className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded text-xs hover:bg-green-500/30 transition-colors font-semibold"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDoc(doc);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-500 border border-red-500/50 rounded text-xs hover:bg-red-500/30 transition-colors font-semibold"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {documents.length === 0 && (
                            <div className="glass-card p-12 text-center border border-dashed border-white/10 rounded-xl">
                                <FileText className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500">No documents uploaded for this case.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-[#111827] rounded-2xl border border-white/10 shadow-2xl p-6 max-w-md w-full ring-1 ring-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Reject Document</h3>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-1">DOCUMENT TYPE</p>
                            <p className="text-sm text-gray-200 font-mono">{getTypeLabel(selectedDoc?.type || '')}</p>
                        </div>

                        <p className="text-sm text-gray-400 mb-4">
                            Explain precisely why this document is invalid. This message will be sent to the merchant.
                        </p>

                        <textarea
                            className="w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm placeholder-gray-500 mb-6 min-h-[120px]"
                            placeholder="e.g. Expired ID, blurry photo, incorrect document type..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedDoc(null);
                                }}
                                className="px-6 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 text-sm font-semibold"
                            >
                                Send Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
