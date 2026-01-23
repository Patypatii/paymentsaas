import { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Server, Activity, Database, Shield, Zap } from 'lucide-react';
import { api } from '../services/api';

export default function SystemHealth() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSystemHealth();
    }, []);

    const loadSystemHealth = async () => {
        try {
            const response = await api.get('/admin/health');
            setServices(response.data.services || []);
        } catch (error) {
            console.error('Failed to load system health:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (name: string) => {
        if (name.includes('Gateway')) return Server;
        if (name.includes('Database')) return Database;
        if (name.includes('Payment')) return Zap;
        if (name.includes('Fraud')) return Shield;
        return Activity;
    };

    if (loading) {
        return (
            <AdminLayout title="System Health - Admin Panel">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="System Health - Admin Panel">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">System Status</h1>
                    <p className="mt-2 text-sm text-gray-400">Real-time monitoring of platform services.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {services.map((service) => {
                        const Icon = getIcon(service.name);
                        const isOperational = service.status === 'Operational';
                        return (
                            <div key={service.name} className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${isOperational ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                                        <Icon className={`h-6 w-6 ${isOperational ? 'text-green-500' : 'text-yellow-500'}`} />
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${isOperational ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'}`}>
                                        {service.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">{service.name}</h3>
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Uptime</p>
                                        <p className="text-sm font-mono text-white mt-1">{service.uptime}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Latency</p>
                                        <p className="text-sm font-mono text-white mt-1">{service.latency}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Logs Preview */}
                <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h3 className="font-medium text-white flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-400" />
                            System Logs
                        </h3>
                        <button className="text-xs text-gray-400 hover:text-white">View All</button>
                    </div>
                    <div className="font-mono text-sm">
                        {[
                            { time: '10:42:01', level: 'INFO', msg: 'Job worker_payment_retry started' },
                            { time: '10:42:05', level: 'WARN', msg: 'High latency detected on Redis cluster' },
                            { time: '10:42:08', level: 'INFO', msg: 'Webhook dispatch [wh_123] completed' },
                            { time: '10:42:12', level: 'ERROR', msg: 'Failed authentication for user_992: Invalid signature' },
                        ].map((log, i) => (
                            <div key={i} className="px-6 py-3 border-b border-white/5 hover:bg-white/5 flex gap-4 last:border-0">
                                <span className="text-gray-500">{log.time}</span>
                                <span className={log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-blue-400'}>{log.level}</span>
                                <span className="text-gray-300">{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
