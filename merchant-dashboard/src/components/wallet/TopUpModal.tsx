import { useState, useEffect } from 'react';
import { X, Loader2, Phone, DollarSign, Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultPhone?: string;
    onSuccess?: () => void;
}

type ModalState = 'input' | 'initiating' | 'waiting' | 'success' | 'failed';

export default function TopUpModal({ isOpen, onClose, defaultPhone = '', onSuccess }: TopUpModalProps) {
    const { success: showSuccess, error } = useToast();
    const [state, setState] = useState<ModalState>('input');
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState(defaultPhone);
    const [reference, setReference] = useState('');
    const [checkoutRequestId, setCheckoutRequestId] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setState('input');
            setAmount('');
            setPhone(defaultPhone);
            setReference('');
            setCheckoutRequestId('');
        }
    }, [isOpen, defaultPhone]);

    useEffect(() => {
        if (state === 'waiting' && reference) {
            // Poll for status every 3 seconds
            const interval = setInterval(async () => {
                try {
                    const response = await api.get(`/merchants/wallet/topup/${reference}`);
                    const status = response.data.status;

                    if (status === 'COMPLETED' || status === 'SUCCESS') {
                        setState('success');
                        clearInterval(interval);
                        if (onSuccess) onSuccess();
                    } else if (status === 'FAILED' || status === 'CANCELLED') {
                        setState('failed');
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error('Failed to check status:', err);
                    // Continue polling
                }
            }, 3000);

            // Timeout after 2 minutes
            const timeout = setTimeout(() => {
                clearInterval(interval);
                setState('failed');
                error('Transaction timed out. Please check your wallet balance.');
            }, 120000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [state, reference, onSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setState('initiating');
            const val = parseFloat(amount);
            if (!val || val < 10) {
                error('Minimum top up is KES 10');
                setState('input');
                return;
            }

            const response = await api.post('/merchants/wallet/topup', {
                amount: val,
                phone
            });

            setReference(response.data.reference);
            setCheckoutRequestId(response.data.checkoutRequestId);
            setState('waiting');
            showSuccess('STK Push sent! Please enter your M-Pesa PIN.');
        } catch (err: any) {
            error(err.response?.data?.message || 'Top-up failed');
            setState('input');
        }
    };

    const handleClose = () => {
        if (state === 'waiting') {
            // Don't allow closing while waiting
            return;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-2xl transition-all glass-card">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-main tracking-tight">Deposit to Wallet</h3>
                    </div>
                    {state !== 'waiting' && (
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-background transition-colors text-muted hover:text-main"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Input State */}
                {state === 'input' && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">M-Pesa Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="block w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-muted/50"
                                    placeholder="2547XXXXXXXX"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">Amount (KES)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-primary font-bold">
                                    KES
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="10"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="block w-full bg-background border border-border rounded-xl pl-14 pr-4 py-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="mt-2 text-[10px] text-muted italic">Minimum deposit: KES 10.00</p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                            >
                                Deposit Now
                                <Wallet className="h-5 w-5" />
                            </button>
                            <p className="text-center text-[10px] text-muted mt-4">
                                Securely processed via Safaricom M-Pesa Daraja API
                            </p>
                        </div>
                    </form>
                )}

                {/* Initiating State */}
                {state === 'initiating' && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <div className="text-center">
                            <h4 className="text-lg font-bold text-main mb-2">Initiating Payment...</h4>
                            <p className="text-sm text-muted">Please wait while we process your request</p>
                        </div>
                    </div>
                )}

                {/* Waiting for Callback State */}
                {state === 'waiting' && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative">
                            <Clock className="h-16 w-16 text-primary animate-pulse" />
                            <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-lg font-bold text-main">Waiting for Payment...</h4>
                            <p className="text-sm text-muted">Check your phone for the M-Pesa prompt</p>
                            <p className="text-xs text-muted/70">Enter your PIN to complete the transaction</p>
                        </div>
                        <div className="w-full bg-background/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted">Amount:</span>
                                <span className="text-main font-mono font-bold">KES {amount}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted">Phone:</span>
                                <span className="text-main font-mono">{phone}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted">Reference:</span>
                                <span className="text-main font-mono text-[10px]">{reference}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center text-xs text-primary">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Polling for status...</span>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {state === 'success' && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative">
                            <CheckCircle className="h-20 w-20 text-green-500" />
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-2xl font-bold text-green-500">Payment Successful!</h4>
                            <p className="text-sm text-muted">Your wallet has been credited</p>
                        </div>
                        <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Amount Deposited:</span>
                                <span className="text-main font-mono font-bold">KES {amount}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-colors"
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* Failed State */}
                {state === 'failed' && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative">
                            <XCircle className="h-20 w-20 text-red-500" />
                            <div className="absolute inset-0 bg-red-500/20 blur-2xl"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-2xl font-bold text-red-500">Payment Failed</h4>
                            <p className="text-sm text-muted">The transaction was not completed</p>
                            <p className="text-xs text-muted/70">Please try again or contact support if the issue persists</p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleClose}
                                className="flex-1 bg-background border border-border hover:bg-surface text-main py-3 rounded-xl font-bold transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setState('input')}
                                className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
