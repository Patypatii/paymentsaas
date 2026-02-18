import Layout from '../components/layout/Layout';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function Status() {
    const services = [
        { name: 'API', status: 'Operational' },
        { name: 'Dashboard', status: 'Operational' },
        { name: 'M-Pesa Gateways', status: 'Operational' },
        { name: 'Card Processing', status: 'Operational' },
        { name: 'Webhooks', status: 'Operational' },
    ];

    return (
        <Layout title="System Status - Paylor">
            <div className="max-w-3xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/20 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-main mb-2">All Systems Operational</h1>
                    <p className="text-green-500">Last updated: Just now</p>
                </div>

                <div className="glass-card rounded-xl border border-border bg-surface/50 backdrop-blur-sm overflow-hidden shadow-lg">
                    <div className="divide-y divide-border">
                        {services.map((service) => (
                            <div key={service.name} className="flex items-center justify-between p-4 px-6 hover:bg-surface transition-colors">
                                <span className="font-medium text-main">{service.name}</span>
                                <span className="flex items-center gap-2 text-green-500 text-sm font-medium">
                                    <CheckCircle className="h-4 w-4" />
                                    {service.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
