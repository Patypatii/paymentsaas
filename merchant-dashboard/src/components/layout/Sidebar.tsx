import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
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
    Send,
    Wallet,
    ArrowLeftRight,
    Zap,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Direct Charge', href: '/stk-push', icon: Zap },
    { name: 'Channels', href: '/channels', icon: Store },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Webhooks', href: '/webhooks', icon: Webhook },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'Verification (KYC)', href: '/kyc', icon: ShieldCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    // Mobile Top Bar (Logo + Theme Toggle)
    const MobileHeader = () => (
        <div className="lg:hidden fixed top-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-background border-b border-border glass-panel">
            <div className="flex items-center gap-2">
                <img src="/favicon.svg" alt="Paylor" className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-bold text-main tracking-tight">Paylor</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="p-2 rounded-lg text-muted hover:text-main"
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                    onClick={() => router.push('/login')}
                    className="p-2 rounded-lg text-muted hover:text-main"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
    );

    // Bottom Navigation for Mobile/Tablet
    const BottomNav = () => {
        const primaryItems = [
            { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Trans', href: '/transactions', icon: ArrowLeftRight },
            { name: 'Direct', href: '/stk-push', icon: Zap },
            { name: 'Wallet', href: '/wallet', icon: Wallet },
        ];

        const moreItems = [
            { name: 'Channels', href: '/channels', icon: Store },
            { name: 'Webhooks', href: '/webhooks', icon: Webhook },
            { name: 'API Keys', href: '/api-keys', icon: Key },
            { name: 'Verification', href: '/kyc', icon: ShieldCheck },
            { name: 'Settings', href: '/settings', icon: Settings },
        ];

        return (
            <>
                {/* More Menu Overlay */}
                {isMoreOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)} />
                        <div className="absolute bottom-20 left-4 right-4 bg-background border border-border rounded-2xl glass-panel p-4 animate-in slide-in-from-bottom duration-200">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="font-bold text-main">More Options</span>
                                <button onClick={() => setIsMoreOpen(false)} className="p-2 text-muted">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {moreItems.map((item) => {
                                    const isActive = router.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMoreOpen(false)}
                                            className={clsx(
                                                'flex flex-col items-center justify-center p-3 rounded-xl transition-all',
                                                isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface'
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 mb-1" />
                                            <span className="text-[10px] font-medium text-center">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="lg:hidden fixed bottom-0 w-full z-50 bg-background border-t border-border glass-panel pb-safe">
                    <nav className="flex items-center justify-around h-16">
                        {primaryItems.map((item) => {
                            const isActive = router.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                                        isActive ? 'text-primary' : 'text-muted'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => setIsMoreOpen(!isMoreOpen)}
                            className={clsx(
                                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                                isMoreOpen ? 'text-primary' : 'text-muted'
                            )}
                        >
                            <Menu className="h-5 w-5" />
                            <span className="text-[10px] font-medium">More</span>
                        </button>
                    </nav>
                </div>
            </>
        );
    };

    return (
        <>
            <MobileHeader />
            <BottomNav />
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 bg-background border-r border-border glass-panel transition-colors duration-300">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4 mb-8">
                            <img src="/favicon.svg" alt="Paylor" className="w-8 h-8 rounded-lg mr-3" />
                            <span className="text-xl font-bold text-main tracking-tight transition-colors duration-300">Paylor</span>
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
                                                : 'text-muted hover:bg-surface/50 hover:text-main',
                                            'group flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg'
                                        )}
                                    >
                                        <item.icon
                                            className={clsx(
                                                isActive ? 'text-primary' : 'text-muted group-hover:text-main',
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

                    <div className="border-t border-border p-4 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                    ME
                                </div>
                                <div className="text-sm">
                                    <p className="text-main font-medium transition-colors duration-300">Merchant</p>
                                    <Link href="/settings" className="text-xs text-muted hover:text-primary transition-colors">
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                            {/* Theme Toggle */}
                            <button
                                className="p-2 rounded-lg text-muted hover:text-main hover:bg-surface/50 transition-colors"
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                onClick={toggleTheme}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        </div>

                        <button
                            onClick={() => router.push('/login')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface/50 hover:bg-surface/80 text-sm font-medium text-muted hover:text-main transition-all border border-border hover:border-border/80"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
