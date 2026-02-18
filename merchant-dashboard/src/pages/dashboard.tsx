import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Activity, DollarSign, Users, CreditCard, Wallet, BookOpen, CheckCircle2, ArrowRight, Zap, Key, Plus, ExternalLink, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import TopUpModal from '../components/wallet/TopUpModal';
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
import Link from 'next/link';



export default function Dashboard() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null); // To store the full response including charts
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, statsRes, transRes] = await Promise.all([
          api.get('/merchants/profile'),
          api.get('/merchants/payments/stats'),
          api.get('/merchants/payments/transactions?limit=5')
        ]);

        setMerchant(profileRes.data.merchant);
        setStatsData(statsRes.data);
        setStats(statsRes.data.stats);
        setTransactions(transRes.data.transactions);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const statIcons: Record<string, any> = {
    'Total Revenue': DollarSign,
    'Active Transactions': Activity,
    'Wallet Balance': Wallet,
    'Average Transaction': CreditCard,
  };

  function CheckCircle(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
    )
  }

  return (
    <DashboardLayout title="Overview - Merchant Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/30 p-4 rounded-2xl border border-border glass-card">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {merchant?.profilePicture ? (
                <img
                  src={merchant.profilePicture}
                  alt="Profile"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-primary/20 shadow-md transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-primary/20 shadow-md">
                  {merchant?.firstName?.charAt(0)?.toUpperCase() || 'M'}
                </div>
              )}
              <div className={`absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-card-bg ${merchant?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main">
                {merchant?.businessName || 'Merchant Portal'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${merchant?.status === 'ACTIVE'
                  ? 'bg-green-500/10 text-green-500 ring-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20'}`}>
                  {merchant?.status === 'ACTIVE' ? 'Account Active' : 'Account Inactive'}
                </span>
                {merchant?.status !== 'ACTIVE' && (
                  <span className="text-[10px] font-medium text-muted">KYC Pending</span>
                )}
              </div>
            </div>
          </div>

          {merchant?.status !== 'ACTIVE' && (
            <Link
              href="/kyc"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:translate-x-1"
            >
              Complete Verification
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {merchant?.status === 'PENDING' && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-4 glass-card animate-in fade-in slide-in-from-left duration-500">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-500">Account Pending Verification</h3>
              <p className="text-sm text-muted mt-1">
                Your account is currently being reviewed. You can explore the portal, but transaction capabilities will be enabled once your KYC documents are verified by our team.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = statIcons[item.name] || Activity;
            return (
              <div key={item.name} className="relative overflow-hidden rounded-xl bg-surface/50 shadow ring-1 ring-border glass-card transition-colors duration-300">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="rounded-md bg-primary/10 p-2 sm:p-3 w-fit">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs sm:text-sm font-medium text-muted">{item.name}</p>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <p className="text-xl sm:text-2xl font-semibold text-main">{item.value}</p>
                        {item.name === 'Wallet Balance' ? (
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => setIsTopUpOpen(true)}
                              className="text-[10px] sm:text-xs font-bold text-primary hover:text-primary-hover border border-primary/20 rounded-lg px-2 py-1 bg-primary/5 transition-colors"
                            >
                              Deposit
                            </button>
                          </div>
                        ) : (
                          <p
                            className={`text-xs sm:text-sm font-semibold ${item.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}
                          >
                            {item.change}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <TopUpModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          defaultPhone={merchant?.contactPhone}
        />

        {/* Quick Actions & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 glass-card">
              <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsTopUpOpen(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 transition-all group"
                >
                  <Plus className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-main">Deposit</span>
                </button>
                <Link
                  href="/stk-push"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 transition-all group"
                >
                  <Zap className="h-6 w-6 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-main">Direct Charge</span>
                </Link>
                <Link
                  href="/api-keys"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 transition-all group"
                >
                  <Key className="h-6 w-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-main">API Keys</span>
                </Link>
                <Link
                  href="/transactions"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 transition-all group"
                >
                  <Activity className="h-6 w-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-main">History</span>
                </Link>
              </div>
            </div>

            {/* Money Flow (Doughnut) */}
            <div className="rounded-xl border border-border bg-surface p-6 glass-card">
              <h3 className="text-lg font-bold text-main mb-1 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Money Flow
              </h3>
              <p className="text-xs text-muted mb-6">Revenue vs Expenses (Monthly)</p>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData?.charts?.flow || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(statsData?.charts?.flow || []).map((entry: any, index: number) => (
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
              <div className="flex justify-center gap-6 mt-4">
                {statsData?.charts?.flow?.map((item: any) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-muted">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Activity (Bar Chart) */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-border bg-surface p-6 glass-card h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-main flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Transaction Summary
                  </h3>
                  <p className="text-xs text-muted mt-1">Growth over the last 6 months</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                  <div className="w-3 h-3 rounded bg-primary" /> Revenue
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData?.charts?.monthly || []}>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
