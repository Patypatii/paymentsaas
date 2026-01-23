import DashboardLayout from '../components/layout/DashboardLayout';
import { CreditCard, CheckCircle, Clock, Download } from 'lucide-react';

export default function Billing() {
    const currentPlan = {
        name: 'Growth',
        price: 'KES 2,999/mo',
        renewalDate: 'April 20, 2024',
        features: ['Unlimited Transactions', 'Priority Support', 'Advanced Analytics', '5 Team Members']
    };

    const invoices = [
        { id: 'INV-2024-03', date: 'Mar 20, 2024', amount: 'KES 2,999', status: 'Paid' },
        { id: 'INV-2024-02', date: 'Feb 20, 2024', amount: 'KES 2,999', status: 'Paid' },
        { id: 'INV-2024-01', date: 'Jan 20, 2024', amount: 'KES 2,999', status: 'Paid' },
    ];

    return (
        <DashboardLayout title="Billing - Paylor">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight text-white">Billing & Subscription</h1>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Current Plan */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-medium text-white mb-4">Current Plan</h3>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-3xl font-bold text-white">{currentPlan.name}</p>
                                <p className="text-gray-400">{currentPlan.price}</p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                                Active
                            </span>
                        </div>
                        <div className="space-y-4 mb-6">
                            {currentPlan.features.map(feature => (
                                <div key={feature} className="flex items-center text-sm text-gray-300">
                                    <CheckCircle className="h-4 w-4 text-primary mr-3" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-sm text-gray-400 mb-4"> Renews on {currentPlan.renewalDate}</p>
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium py-2 px-4 rounded-lg transition-colors">
                                Manage Subscription
                            </button>
                        </div>
                    </div>

                    {/* Invoices */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-medium text-white mb-4">Payment History</h3>
                        <div className="space-y-4">
                            {invoices.map(invoice => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{invoice.id}</p>
                                            <p className="text-xs text-gray-400">{invoice.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-white">{invoice.amount}</span>
                                        <button className="text-gray-400 hover:text-white transition-colors">
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Payment Methods</h3>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
                                <p className="text-xs text-gray-400">Expires 12/2025</p>
                            </div>
                        </div>
                        <button className="text-sm text-primary hover:text-primary-hover font-medium">
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
