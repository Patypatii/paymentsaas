import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import AdminLayout from '../components/layout/AdminLayout';
import { Activity, ShieldCheck, Users, Server, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/audit-logs?limit=5'),
      ]);
      setStats(statsRes.data);
      setAuditLogs(logsRes.data.logs || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
      </div>
    );
  }

  const kpis = [
    { name: 'Total Merchants', value: stats?.merchants?.total || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Active Merchants', value: stats?.merchants?.active || 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
    { name: 'Total Transactions', value: stats?.transactions?.total || 0, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'Active Subscriptions', value: stats?.subscriptions?.active || 0, icon: Server, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <AdminLayout title="Dashboard - Admin Panel">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">System Overview</h1>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item) => (
            <div key={item.name} className="relative overflow-hidden rounded-xl bg-white/5 p-4 shadow ring-1 ring-white/10 sm:px-6 sm:py-6 glass-card">
              <div className="absolute rounded-md p-3 bg-white/5">
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-400">{item.name}</p>
              <p className={`ml-16 text-2xl font-semibold text-white`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Alerts */}
        <div className="rounded-xl border border-white/10 bg-[#111827]/50 p-6 glass-card">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium leading-6 text-white">Security Events</h3>
          </div>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {auditLogs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">Medium</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
