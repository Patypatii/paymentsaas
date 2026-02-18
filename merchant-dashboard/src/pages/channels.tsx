import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { Plus, CreditCard, Search, Trash2, Edit2, Loader2, Store, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function PaymentChannels() {
    const { success, error } = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [channels, setChannels] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'TILL',
        number: '',
        bankName: '',
        accountNumber: ''
    });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const supportedBanks = [
        { name: 'Equity Bank', paybill: '247247' },
        { name: 'KCB Bank', paybill: '522522' },
        { name: 'Co-operative Bank', paybill: '400200' },
        { name: 'Stanbic Bank', paybill: '600100' },
        { name: 'ABSA Bank', paybill: '303030' },
        { name: 'Family Bank', paybill: '222111' },
        { name: 'NCBA', paybill: '880100' },
        { name: 'DTB', paybill: '516600' },
    ];

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/merchants/channels');
            setChannels(response.data.channels);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/merchants/channels', formData);
            await fetchChannels();
            setIsAddModalOpen(false);
            setFormData({ name: '', type: 'TILL', number: '', bankName: '', accountNumber: '' });
            success('Channel added successfully!');
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to add channel');
        }
    };

    const confirmDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Channel',
            message: 'Are you sure you want to delete this payment channel? This will prevent payments to this destination.',
            onConfirm: () => handleDeleteChannel(id)
        });
    };

    const handleDeleteChannel = async (id: string) => {
        try {
            await api.delete(`/merchants/channels/${id}`);
            await fetchChannels();
            success('Channel deleted successfully');
        } catch (err) {
            error('Failed to delete channel');
        } finally {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.number.includes(searchQuery)
    );

    if (loading) {
        return (
            <DashboardLayout title="Payment Channels - Paylor">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Payment Channels - Paylor">
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-main">Payment Channels</h1>
                        <p className="mt-2 text-sm text-muted">Manage your Tills and Paybills for collecting payments.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 sm:mt-0 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-main px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-primary/25"
                    >
                        <Plus className="h-4 w-4" />
                        Add Channel
                    </button>
                </div>

                {/* Filter/Search */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search channels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-main focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>

                {/* Channels Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredChannels.map((channel) => (
                        <div key={channel.id} className="glass-card p-6 rounded-xl border border-border hover:border-white/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => confirmDelete(channel.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${channel.type === 'TILL' ? 'bg-blue-500/10 text-blue-400' :
                                    channel.type === 'BANK' ? 'bg-orange-500/10 text-orange-400' :
                                        'bg-purple-500/10 text-purple-400'}`}>
                                    {channel.type === 'TILL' ? <Store className="h-6 w-6" /> :
                                        channel.type === 'BANK' ? <Building2 className="h-6 w-6" /> :
                                            <CreditCard className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-main">{channel.name}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${channel.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-muted'
                                        }`}>
                                        {channel.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Type</span>
                                    <span className="text-gray-300 font-medium">
                                        {channel.type === 'TILL' ? 'Buy Goods Till' :
                                            channel.type === 'BANK' ? 'Bank Account' : 'PayBill Number'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        {channel.type === 'BANK' ? 'Bank Name' : 'Number'}
                                    </span>
                                    <span className="text-main font-mono">
                                        {channel.type === 'BANK' ? channel.bankName : channel.number}
                                    </span>
                                </div>
                                {channel.type === 'BANK' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Account</span>
                                        <span className="text-main font-mono">{channel.accountNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add New Card CTA */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="glass-card p-6 rounded-xl border border-border border-dashed hover:border-primary/50 hover:bg-surface/50 transition-all flex flex-col items-center justify-center text-center gap-4 group h-full min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-surface/50 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                            <Plus className="h-6 w-6 text-muted group-hover:text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium text-main group-hover:text-primary transition-colors">Add New Channel</h3>
                            <p className="text-sm text-gray-500 mt-1">Connect a Till or PayBill</p>
                        </div>
                    </button>
                </div>

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText="Delete Channel"
                    variant="danger"
                />
            </div>

            {/* Add Channel Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-border relative animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-main mb-6">Add Payment Channel</h2>

                        <form onSubmit={handleAddChannel} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Channel Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-main focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                                    placeholder="e.g. Main Branch Till"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Channel Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-main focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                                >
                                    <option value="TILL">Buy Goods Till</option>
                                    <option value="PAYBILL">PayBill Number</option>
                                    <option value="BANK">Bank Account (Direct Settlement)</option>
                                </select>
                            </div>

                            {formData.type === 'BANK' ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-300">Select Bank</label>
                                        <select
                                            required
                                            value={formData.bankName}
                                            onChange={(e) => {
                                                const bank = supportedBanks.find(b => b.name === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    bankName: e.target.value,
                                                    number: bank?.paybill || ''
                                                });
                                            }}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-main focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                                        >
                                            <option value="">Select a bank...</option>
                                            {supportedBanks.map(bank => (
                                                <option key={bank.name} value={bank.name}>{bank.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-300">Bank Account Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-main focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                                            placeholder="e.g. 1710184549306"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-300">Channel Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-main focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                                        placeholder="e.g. 123456"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-main hover:bg-surface/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-main hover:bg-primary-hover transition-colors font-medium shadow-lg hover:shadow-primary/25"
                                >
                                    Add Channel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
