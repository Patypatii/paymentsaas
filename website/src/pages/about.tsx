import Layout from '../components/layout/Layout';
import { Users, Target, Zap, Heart } from 'lucide-react';

export default function About() {
    const stats = [
        { label: 'Founded', value: '2024' },
        { label: 'Merchants Supported', value: '500+' },
        { label: 'Transactions Processed', value: '$10M+' },
        { label: 'Team Members', value: '15' },
    ];

    return (
        <Layout title="About Us - Paylor">
            {/* Hero Section */}
            <div className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-background transition-colors duration-300" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-main mb-6">
                        We are building the <span className="text-primary font-bold">Financial Rail</span> <br /> for African Enterprises.
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-muted">
                        Paylor is designed to help businesses automate revenue collection, eliminate reconciliation headaches, and focus on growth.
                    </p>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="py-24 bg-background border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
                                <Target className="h-4 w-4" />
                                Our Mission
                            </div>
                            <h2 className="text-3xl font-bold text-main mb-4">Simplify Payments to Amplify Growth</h2>
                            <p className="text-muted leading-relaxed">
                                We believe that payments should be invisible. Merchants shouldn't have to worry about downtime, complex integrations, or manual reconciliation. Our mission is to build the most reliable and developer-friendly payment infrastructure in the region.
                            </p>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
                                <Zap className="h-4 w-4" />
                                Our Vision
                            </div>
                            <h2 className="text-3xl font-bold text-main mb-4">The Standard for Digital Commerce</h2>
                            <p className="text-muted leading-relaxed">
                                To become the operating system for digital commerce in Africa, connecting businesses to the economy through seamless, secure, and intelligent payment rails.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="py-16 bg-surface border-y border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-3xl md:text-4xl font-bold text-main mb-2">{stat.value}</div>
                                <div className="text-sm text-muted uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-main">Our Values</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 rounded-xl border border-border bg-surface">
                            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-6">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-main mb-3">Customer Obsession</h3>
                            <p className="text-muted">We start with the customer and work backwards. We work vigorously to earn and keep customer trust.</p>
                        </div>
                        <div className="glass-card p-8 rounded-xl border border-border bg-surface">
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500 mb-6">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-main mb-3">Ownership</h3>
                            <p className="text-muted">Owners think long term and don't sacrifice long-term value for short-term results. We act on behalf of the entire company.</p>
                        </div>
                        <div className="glass-card p-8 rounded-xl border border-border bg-surface">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500 mb-6">
                                <Heart className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-main mb-3">Earn Trust</h3>
                            <p className="text-muted">We listen attentively, speak candidly, and treat others with respect. We are vocally self-critical.</p>
                        </div>
                    </div>
                </div>
            </div>

        </Layout>
    );
}
