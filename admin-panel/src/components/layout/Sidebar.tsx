import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    LayoutDashboard,
    Users,
    Activity,
    Settings,
    LogOut,
    ShieldAlert,
    FileText,
    FileCheck,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Merchants', href: '/merchants', icon: Users },
    { name: 'KYC Management', href: '/kyc', icon: FileCheck },
    { name: 'Transactions', href: '/transactions', icon: FileText },
    { name: 'System Health', href: '/system-health', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mobile Top Bar
    const MobileHeader = () => (
        <div className="lg:hidden fixed top-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-background border-b border-border glass-panel">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-lg font-bold text-main tracking-tight">Admin Shell</span>
            </div>
            <div className="flex items-center gap-2">
                {mounted && (
                    <button
                        className="p-2 rounded-lg text-muted hover:text-main"
                        onClick={toggleTheme}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                )}
                <button
                    onClick={() => router.push('/login')}
                    className="p-2 rounded-lg text-muted hover:text-main"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
    );

    // Bottom Navigation for Admin
    const BottomNav = () => {
        const primaryItems = [
            { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Merchants', href: '/merchants', icon: Users },
            { name: 'KYC', href: '/kyc', icon: FileCheck },
            { name: 'System', href: '/system-health', icon: Activity },
        ];

        const moreItems = [
            { name: 'Transactions', href: '/transactions', icon: FileText },
            { name: 'Settings', href: '/settings', icon: Settings },
        ];

        return (
            <>
                {/* More Menu Overlay */}
                {isMoreOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden font-sans">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)} />
                        <div className="absolute bottom-20 left-4 right-4 bg-background border border-border rounded-2xl glass-panel p-4 animate-in slide-in-from-bottom duration-200">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="font-bold text-main">More Options</span>
                                <button onClick={() => setIsMoreOpen(false)} className="p-2 text-muted">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {moreItems.map((item) => {
                                    const isActive = router.pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMoreOpen(false)}
                                            className={clsx(
                                                'flex flex-col items-center justify-center p-3 rounded-xl transition-all',
                                                isActive ? 'bg-red-500/10 text-red-500' : 'text-muted hover:bg-surface'
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
                            const isActive = router.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                                        isActive ? 'text-red-500' : 'text-muted'
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
                                isMoreOpen ? 'text-red-500' : 'text-muted'
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
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30 mr-3">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="text-xl font-bold text-main tracking-tight">Admin Panel</span>
                        </div>

                        <nav className="mt-2 flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = router.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            isActive
                                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-r-2 border-red-500'
                                                : 'text-muted hover:bg-surface hover:text-main',
                                            'group flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg'
                                        )}
                                    >
                                        <item.icon
                                            className={clsx(
                                                isActive ? 'text-red-600 dark:text-red-400' : 'text-muted group-hover:text-main',
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

                    <div className="flex-shrink-0 border-t border-border p-4 space-y-2">
                        {/* Theme Toggle - Only render on client side */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted hover:text-main hover:bg-surface rounded-lg transition-all duration-200"
                            >
                                {theme === 'dark' ? (
                                    <>
                                        <Sun className="h-4 w-4" />
                                        Light Mode
                                    </>
                                ) : (
                                    <>
                                        <Moon className="h-4 w-4" />
                                        Dark Mode
                                    </>
                                )}
                            </button>
                        )}

                        {/* Sign Out */}
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted hover:text-main hover:bg-surface rounded-lg transition-all duration-200"
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
