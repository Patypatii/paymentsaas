import Layout from '../components/layout/Layout';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export default function Compliance() {
    return (
        <Layout title="Compliance - Paylor">
            <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Security & Compliance</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">We adhere to the highest international standards to ensure your data and money are safe.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="glass-card p-8 rounded-xl border border-white/10 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">PCI-DSS Level 1</h3>
                        <p className="text-gray-400">We are certified to the highest industry standards for payment processing.</p>
                    </div>
                    <div className="glass-card p-8 rounded-xl border border-white/10 text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-8 w-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">SOC 2 Type II</h3>
                        <p className="text-gray-400">Regular audits ensure our controls and processes are effective.</p>
                    </div>
                    <div className="glass-card p-8 rounded-xl border border-white/10 text-center">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">GDPR Compliant</h3>
                        <p className="text-gray-400">We respect your privacy and provide full control over your data.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
