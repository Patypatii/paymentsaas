import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import AdminLayout from '../components/layout/AdminLayout';
import { Activity, ShieldCheck, Users, Server, AlertTriangle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

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
    { name: 'Total Merchants', value: stats?.merchants?.total || 0, icon: Users, color: 'text-primary' },
    { name: 'Active Merchants', value: stats?.merchants?.active || 0, icon: Activity, color: 'text-green-500' },
    { name: 'Total Volume', value: `KES ${stats?.transactions?.totalAmount?.toLocaleString() || 0}`, icon: AlertTriangle, color: 'text-yellow-500' },
    { name: 'Active Subscriptions', value: stats?.subscriptions?.active || 0, icon: Server, color: 'text-purple-500' },
  ];

  return (
    <AdminLayout title="Dashboard - Admin Panel">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-main">System Overview</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted bg-surface/50 px-3 py-1.5 rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE SYSTEM STATUS
          </div>
        </div>

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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Transaction History */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-border bg-surface p-6 glass-card h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-main flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Transaction Growth
                  </h3>
                  <p className="text-xs text-muted mt-1">Platform-wide revenue over last 6 months</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                    <div className="w-3 h-3 rounded bg-primary" /> Revenue
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                    <div className="w-3 h-3 rounded bg-[#3B82F6]" /> Count
                  </div>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts?.monthly || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      tickFormatter={(value) => `KES ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                      contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text-main)' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="amount"
                      name="Revenue"
                      fill="var(--primary)"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="transactions"
                      name="Transactions"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      barSize={8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Transaction Status (Pie Chart) */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-border bg-surface p-6 glass-card h-full">
              <h3 className="text-lg font-bold text-main mb-1 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                System Health
              </h3>
              <p className="text-xs text-muted mb-6">Payment Success vs Failures</p>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.charts?.flow || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(stats?.charts?.flow || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 mt-4">
                {stats?.charts?.flow?.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-main">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-main">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security Events */}
        <div className="rounded-xl border border-border bg-surface p-6 glass-card transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-bold leading-6 text-main">Recent System Activities</h3>
            </div>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">Severity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-transparent">
                {auditLogs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 ring-1 ring-inset ring-yellow-500/20 uppercase tracking-wider">Medium</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-main">{log.action}</td>
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
