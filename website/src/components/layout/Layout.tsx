import Navbar from './Navbar';
import Footer from './Footer';
import Head from 'next/head';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const Layout = ({ children, title = 'Paylor - Enterprise Payment Orchestration', description = 'Secure, reliable payment initiation and routing infrastructure for modern enterprises.' }: LayoutProps) => {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="min-h-screen flex flex-col bg-background text-white selection:bg-primary/30 selection:text-white">
                <Navbar />
                <main className="flex-grow pt-16">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Layout;
