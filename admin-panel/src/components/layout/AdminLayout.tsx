import Sidebar from './Sidebar';
import Head from 'next/head';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const AdminLayout = ({ children, title = 'Admin Panel' }: AdminLayoutProps) => {
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
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminLayout;
