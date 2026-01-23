import Layout from '../components/layout/Layout';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function ApiReference() {
    return (
        <Layout title="API Reference - Paylor">
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">API Reference</h1>
                <p className="text-gray-400 max-w-lg mb-8">
                    Access our comprehensive API documentation to start building your integration.
                </p>
                <Link
                    href="/docs"
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                >
                    View Documentation
                </Link>
            </div>
        </Layout>
    );
}
