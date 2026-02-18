import Layout from '../components/layout/Layout';

export default function Privacy() {
    return (
        <Layout title="Privacy Policy - Paylor">
            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-main mb-8">Privacy Policy</h1>
                <div className="max-w-none text-muted space-y-6">
                    <p>Last updated: March 15, 2024</p>
                    <h3 className="text-main font-bold text-xl">1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, update your profile, or request customer support.</p>
                    <h3 className="text-main font-bold text-xl">2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, including to process transactions and send you related information.</p>
                    <p>This is a placeholder policy for demonstration purposes.</p>
                </div>
            </div>
        </Layout>
    );
}
