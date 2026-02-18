import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Wallet, Loader2, AlertCircle, Plus, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import TopUpModal from '../components/wallet/TopUpModal';

const PRICING_TIERS = [
    { min: 1, max: 49, fee: 0 },
    { min: 50, max: 499, fee: 6 },
    { min: 500, max: 999, fee: 10 },
    { min: 1000, max: 1499, fee: 15 },
    { min: 1500, max: 2499, fee: 20 },
    { min: 2500, max: 3499, fee: 25 },
    { min: 3500, max: 4999, fee: 30 },
    { min: 5000, max: 7499, fee: 40 },
    { min: 7500, max: 9999, fee: 45 },
    { min: 10000, max: 14999, fee: 50 },
    { min: 15000, max: 19999, fee: 55 },
    { min: 20000, max: 34999, fee: 80 },
    { min: 35000, max: 49999, fee: 105 },
    { min: 50000, max: 149999, fee: 130 },
    { min: 150000, max: 249999, fee: 160 },
    { min: 250000, max: 349999, fee: 195 },
    { min: 350000, max: 549999, fee: 230 },
    { min: 550000, max: 749999, fee: 275 },
    { min: 750000, max: 999999, fee: 320 },
];

export default function WalletPage() {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState<any>(null);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [contactPhone, setContactPhone] = useState('');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/merchants/wallet');
            setWalletData(response.data.wallet);

            // Fetch profile for default phone
            const profile = await api.get('/merchants/profile');
            setContactPhone(profile.data.merchant.contactPhone || '');

        } catch (err) {
            error('Failed to load wallet information');
        } finally {
            setLoading(false);
        }
    };


    if (loading && !walletData) {
        return (
            <DashboardLayout title="Wallet - Paylor">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Wallet - Paylor">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-main">Prepaid Wallet</h1>
                    <p className="text-muted mt-1">Manage your credits for transaction fees.</p>
                </div>

                <div className="space-y-8">
                    {/* Balance Card */}
                    <div className="glass-card p-8 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full -mr-16 -mt-16"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <span className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                                    <Wallet className="h-4 w-4" /> Current Balance
                                </span>
                                <h1 className="text-5xl font-bold text-main font-mono tracking-tight flex items-baseline gap-2">
                                    <span className="text-2xl text-muted font-medium">{walletData?.currency}</span>
                                    {walletData?.balance?.toLocaleString() || '0.00'}
                                </h1>
                                <p className="text-muted text-sm max-w-md mt-4">
                                    Credits are deducted automatically when you successfully process payments.
                                    Keep your wallet funded to ensure uninterrupted service.
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={() => setIsTopUpOpen(true)}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all text-lg"
                                >
                                    <Plus className="h-6 w-6" />
                                    Deposit Funds
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Schedule */}
                <div className="rounded-xl border border-border bg-surface p-6 glass-card transition-colors duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-main flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Transaction Pricing Schedule
                            </h3>
                            <p className="text-sm text-muted mt-1">Pay-as-you-go fees based on transaction amount.</p>
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {PRICING_TIERS.map((tier, idx) => (
                            <div key={idx} className="py-4 flex items-center justify-between hover:bg-surface/50 transition-colors px-4 rounded-lg group">
                                <div className="flex items-center gap-8">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted uppercase tracking-tight mb-0.5">Transaction Amount Range</p>
                                        <p className="text-sm font-mono text-main">
                                            KES {tier.min.toLocaleString()} - {tier.max.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-primary uppercase tracking-tight mb-0.5">Flat Fee</p>
                                    <p className="text-xl font-bold text-main group-hover:text-primary transition-colors font-mono">
                                        KES {tier.fee.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Balance Warning */}
                {walletData?.balance < 50 && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div>
                            <h4 className="text-red-400 font-bold text-sm">Low Balance</h4>
                            <p className="text-red-200/80 text-xs mt-1">
                                Your balance is running low. Please top up to avoid service interruption.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
                defaultPhone={contactPhone}
                onSuccess={fetchWalletData}
            />
        </DashboardLayout >
    );
}
