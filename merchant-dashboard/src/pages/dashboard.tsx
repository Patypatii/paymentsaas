import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Activity, DollarSign, Users, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const statIcons: Record<string, any> = {
    'Total Revenue': DollarSign,
    'Active Transactions': Activity,
    'Success Rate': CheckCircle,
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${merchant?.status === 'ACTIVE'
            ? 'bg-green-500/10 text-green-400 ring-green-500/20'
            : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'}`}>
            {merchant?.status === 'ACTIVE' ? 'System Operational' : 'Awaiting Verification'}
          </span>
        </div>

        {merchant?.status === 'PENDING' && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-4 glass-card">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-500">Account Pending Verification</h3>
              <p className="text-sm text-gray-400 mt-1">
                Your account is currently being reviewed. You can explore the portal, but transaction capabilities will be enabled once your KYC documents are verified by our team.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = statIcons[item.name] || Activity;
            return (
              <div key={item.name} className="relative overflow-hidden rounded-xl bg-white/5 p-4 shadow ring-1 ring-white/10 sm:px-6 sm:py-6 glass-card">
                <dt>
                  <div className="absolute rounded-md bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-400">{item.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                      }`}
                  >
                    {item.change}
                  </p>
                </dd>
              </div>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-white/10 bg-[#111827]/50 p-6 glass-card">
          <h3 className="text-lg font-medium leading-6 text-white mb-4">Recent Transactions</h3>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">{tx.reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{tx.currency} {tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${tx.status === 'COMPLETED'
                          ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                          : tx.status === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 ring-red-500/20'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
