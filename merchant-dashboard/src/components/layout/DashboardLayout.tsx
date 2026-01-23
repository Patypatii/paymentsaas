import Sidebar from './Sidebar';
import Head from 'next/head';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const DashboardLayout = ({ children, title = 'Merchant Dashboard' }: DashboardLayoutProps) => {
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className="min-h-screen bg-[#0B0F1A]">
                <Sidebar />
                <div className="md:pl-64 flex flex-col min-h-screen">
                    <main className="flex-1">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                {/* Top Bar / Header could go here if needed, but keeping it minimal for now */}
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;
