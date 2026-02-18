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
            <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
                <Sidebar />
                <div className="lg:pl-64 flex flex-col flex-1">
                    <main className="flex-1 pb-24 lg:pb-8 pt-16 lg:pt-0">
                        <div className="py-6 h-full">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
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
