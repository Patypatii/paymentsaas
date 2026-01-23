import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Copy, Trash2, Key, AlertTriangle } from 'lucide-react';

export default function ApiKeys() {
  const router = useRouter();
  const { success, error } = useToast();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadKeys();
  }, [router]);

  const loadKeys = async () => {
    try {
      const response = await api.get('/merchants/api-keys');
      setKeys(response.data.keys);
    } catch {
      // Handle error or redirect
    } finally {
      setLoading(false);
    }
  };

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      setCreating(true);
      const response = await api.post('/merchants/api-keys', { name: keyName });
      setNewKey(response.data);
      setKeyName('');
      setIsModalOpen(false);
      success('API Key created successfully!');
      loadKeys();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout title="API Keys - Merchant Dashboard">
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">API Keys</h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage the keys used to authenticate your requests to our API.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            >
              <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Create Secret Key
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 relative animate-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-white mb-6">Create API Key</h2>
              <p className="text-sm text-gray-400 mb-4">Give your key a name to help you identify its purpose.</p>

              <form onSubmit={createKey} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Key Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                    placeholder="e.g. Website Production"
                  />
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {newKey && (
          <div className="rounded-md bg-yellow-500/10 p-4 border border-yellow-500/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-500">Save your key</h3>
                <div className="mt-2 text-sm text-yellow-500/90">
                  <p>This is the only time we'll show you this key. Store it somewhere safe.</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <code className="rounded bg-black/30 px-3 py-1.5 font-mono text-sm text-yellow-200 block border border-yellow-500/20 select-all">
                    {newKey.apiKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newKey.apiKey)}
                    className="p-1.5 hover:bg-yellow-500/20 rounded text-yellow-500 transition-colors"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token Prefix</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Used</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    {key.name || 'Secret Key'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                    {key.prefix}****************
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {key.lastUsedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${key.isActive ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-red-500/10 text-red-400 ring-red-500/20'}`}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
