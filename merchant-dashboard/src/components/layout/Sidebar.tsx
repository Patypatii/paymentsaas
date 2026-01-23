import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    LayoutDashboard,
    CreditCard,
    Key,
    Webhook,
    Settings,
    LogOut,
    PieChart,
    Store,
    ShieldCheck,
    Send
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'KYC Verification', href: '/kyc', icon: ShieldCheck },
    { name: 'Direct STK Push', href: '/stk-push', icon: Send },
    { name: 'Payment Channels', href: '/channels', icon: Store },
    { name: 'Transactions', href: '/transactions', icon: CreditCard },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'Webhooks', href: '/webhooks', icon: Webhook },
    { name: 'Billing', href: '/billing', icon: PieChart },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
    const router = useRouter();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 bg-[#0B0F1A] border-r border-white/5 glass-panel">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 mr-3">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Paylor</span>
                    </div>

                    <nav className="mt-2 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = router.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        isActive
                                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                        'group flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg'
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300',
                                            'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-shrink-0 flex border-t border-white/5 p-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="flex-shrink-0 w-full group block"
                    >
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white group-hover:text-gray-300 flex items-center gap-2">
                                    <LogOut className="h-4 w-4 text-gray-500" />
                                    Sign Out
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
