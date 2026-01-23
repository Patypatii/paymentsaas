import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import Head from 'next/head';
import AdminLayout from '../components/layout/AdminLayout';
import { CheckCircle, ShieldAlert } from 'lucide-react';

export default function Merchants() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadMerchants();
  }, [router]);

  const loadMerchants = async () => {
    try {
      const response = await api.get('/admin/merchants');
      setMerchants(response.data.merchants);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const approveMerchant = async (merchantId: string) => {
    try {
      await api.post(`/admin/merchants/${merchantId}/approve`);
      loadMerchants();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve merchant');
    }
  };

  const suspendMerchant = async (merchantId: string) => {
    try {
      await api.post(`/admin/merchants/${merchantId}/suspend`);
      loadMerchants();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to suspend merchant');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout title="Merchants - Admin Panel">
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Merchants</h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage all registered merchants on the platform.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{merchant.businessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{merchant.contactEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${merchant.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                          : merchant.status === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 ring-red-500/20'
                          }`}
                      >
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{merchant.planId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {merchant.status === 'PENDING' && (
                          <button
                            onClick={() => approveMerchant(merchant.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs text-white transition-colors"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </button>
                        )}
                        {merchant.status === 'ACTIVE' && (
                          <button
                            onClick={() => suspendMerchant(merchant.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 rounded text-xs transition-colors"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
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
