import Layout from '../components/layout/Layout';

export default function Changelog() {
    const changes = [
        { date: 'March 20, 2024', version: 'v1.2.0', title: 'Start of Public Beta', desc: 'Released the Merchant Dashboard and initial API endpoints.' },
        { date: 'February 15, 2024', version: 'v1.1.0', title: 'Added M-Pesa Integration', desc: 'Support for STK Push and C2B payments.' },
        { date: 'January 10, 2024', version: 'v1.0.0', title: 'Platform Inception', desc: 'Initial release of Paylor.' },
    ];

    return (
        <Layout title="Changelog - Paylor">
            <div className="max-w-3xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-main mb-12 text-center">Changelog</h1>
                <div className="space-y-12 border-l border-border ml-4 md:ml-0 pl-8 md:pl-0">
                    {changes.map((change, i) => (
                        <div key={i} className="relative md:grid md:grid-cols-5 md:gap-8 hover:bg-surface p-4 rounded-lg transition-colors group">
                            <div className="md:col-span-1 text-sm text-muted md:text-right pt-1 group-hover:text-main transition-colors">{change.date}</div>
                            <div className="absolute -left-[37px] top-6 w-4 h-4 rounded-full bg-background border-2 border-border group-hover:border-primary transition-colors md:hidden"></div>
                            <div className="md:col-span-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-bold text-main">{change.title}</span>
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">{change.version}</span>
                                </div>
                                <p className="text-muted">{change.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
