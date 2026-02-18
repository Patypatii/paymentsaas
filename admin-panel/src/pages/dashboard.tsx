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
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const kpis = [
    { name: 'Total Merchants', value: stats?.merchants?.total || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { name: 'Active Merchants', value: stats?.merchants?.active || 0, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Total Transactions', value: stats?.transactions?.total || 0, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Active Subscriptions', value: stats?.subscriptions?.active || 0, icon: Server, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <AdminLayout title="Dashboard - Admin Panel">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-main">System Overview</h1>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((item) => (
            <div key={item.name} className="relative overflow-hidden rounded-xl bg-surface shadow ring-1 ring-border glass-card transition-colors duration-300">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="rounded-md p-2 sm:p-3 bg-surface border border-border w-fit">
                    <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs sm:text-sm font-medium text-muted">{item.name}</p>
                    <p className="text-xl sm:text-2xl font-semibold text-main">{item.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Alerts */}
        <div className="rounded-xl border border-border bg-surface p-6 glass-card transition-colors duration-300">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium leading-6 text-main">Security Events</h3>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Severity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-transparent">
                {auditLogs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 ring-1 ring-inset ring-yellow-500/20">Medium</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-main">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted">{log.ipAddress}</td>
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
