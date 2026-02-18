import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import ConfirmationModal from '../components/ui/ConfirmationModal';
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
  const [merchant, setMerchant] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadKeys();
    loadMerchant();
    syncAliases();
    loadChannels();
  }, [router]);

  const syncAliases = async () => {
    try {
      await api.get('/merchants/channels/sync-aliases');
    } catch (err) {
      console.error('Failed to sync aliases:', err);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await api.get('/merchants/channels');
      setChannels(response.data.channels);
      if (response.data.channels.length > 0) {
        setSelectedChannelId(response.data.channels[0].id);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    }
  };

  const loadMerchant = async () => {
    try {
      const response = await api.get('/merchants/profile');
      setMerchant(response.data.merchant);
    } catch (err) {
      console.error('Failed to load merchant profile:', err);
    }
  };

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

  const confirmAction = (key: any) => {
    if (key.isActive) {
      // Revoke Action
      setConfirmModal({
        isOpen: true,
        title: 'Revoke API Key',
        message: 'Are you sure you want to revoke this API key? Applications using it will immediately stop working. This action cannot be undone, but you can delete the key record later.',
        onConfirm: () => handleRevoke(key.id),
        confirmText: 'Revoke Key',
        variant: 'warning'
      });
    } else {
      // Permanent Delete Action
      setConfirmModal({
        isOpen: true,
        title: 'Delete API Key',
        message: 'Are you sure you want to permanently delete this API key record? It will be removed from your history forever.',
        onConfirm: () => handleDeletePermanent(key.id),
        confirmText: 'Delete Forever',
        variant: 'danger'
      });
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/merchants/api-keys/${id}`);
      success('API Key revoked successfully');
      loadKeys();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to revoke API key');
    } finally {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeletePermanent = async (id: string) => {
    try {
      await api.delete(`/merchants/api-keys/${id}/permanent`);
      success('API Key deleted permanently');
      loadKeys();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete API key');
    } finally {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout title="API Keys - Merchant Dashboard">
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-main">API Keys</h1>
            <p className="mt-2 text-sm text-muted">
              Manage the keys used to authenticate your requests to our API.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-main shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            >
              <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Create Secret Key
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-border relative animate-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-main mb-6">Create API Key</h2>
              <p className="text-sm text-muted mb-4">Give your key a name to help you identify its purpose.</p>

              <form onSubmit={createKey} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Key Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-main focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none"
                    placeholder="e.g. Website Production"
                  />
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-main hover:bg-surface/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-main hover:bg-primary-hover transition-colors font-medium shadow-lg hover:shadow-primary/25 disabled:opacity-50"
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

        {/* Quick Integration Credentials */}
        <div className="glass-card rounded-xl border border-border bg-surface p-6 mb-6 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-main">Quick Integration Credentials</h3>
              <p className="text-sm text-muted">API Username: <span className="font-mono text-primary select-all">{merchant?.username}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Select Payment Channel</label>
                <select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-main text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {channels.length === 0 ? (
                    <option value="">No channels available</option>
                  ) : (
                    channels.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type === 'BANK' ? `ACC: ${c.accountNumber}` : c.number})
                      </option>
                    ))
                  )}
                </select>
                {channels.length === 0 && (
                  <button
                    onClick={() => router.push('/channels')}
                    className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Create your first channel
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">API Password</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2.5 font-mono text-sm text-main select-all">
                    {merchant?.id || 'Loading...'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(merchant?.id || '')}
                    className="p-2.5 hover:bg-surface rounded-lg text-muted hover:text-primary transition-colors border border-border"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Webhook Secret (Key ID)</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2.5 font-mono text-sm text-main select-all">
                    {keys.find(k => k.isActive)?.id || 'No active key'}
                  </code>
                  <button
                    disabled={!keys.find(k => k.isActive)}
                    onClick={() => copyToClipboard(keys.find(k => k.isActive)?.id || '')}
                    className="p-2.5 hover:bg-surface rounded-lg text-muted hover:text-primary transition-colors border border-border disabled:opacity-30"
                    title="Copy Secret"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Channel ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2.5 font-mono text-sm text-main select-all">
                    {channels.find(c => c.id === selectedChannelId)?.alias || '---'}
                  </code>
                  <button
                    disabled={!selectedChannelId}
                    onClick={() => copyToClipboard(channels.find(c => c.id === selectedChannelId)?.alias || '')}
                    className="p-2.5 hover:bg-surface rounded-lg text-muted hover:text-primary transition-colors border border-border disabled:opacity-30"
                    title="Copy Channel ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-bold text-primary">Integration Note:</span> Authenticate your requests using the <span className="text-main font-medium">Authorization: Bearer YOUR_API_KEY</span> header. Your <span className="text-main">API Key</span> acts as the high-security bearer token.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface/30">
            <h3 className="text-sm font-bold text-main uppercase tracking-wider">Your API Keys</h3>
          </div>
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-surface/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Key ID / Webhook Secret</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Token Prefix</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Last Used</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-main flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted" />
                    <div className="flex flex-col">
                      <span>{key.name || 'Secret Key'}</span>
                      <span className="text-[10px] text-muted font-normal">Auth token is this key</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="select-all">{key.id}</span>
                      <button onClick={() => copyToClipboard(key.id)} className="p-1 hover:text-primary transition-colors">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                    {key.prefix}****************
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${key.isActive ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-red-500/10 text-red-400 ring-red-500/20'}`}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => confirmAction(key)}
                      className={`${key.isActive ? 'text-muted hover:text-yellow-400' : 'text-red-500 hover:text-red-400'} transition-colors`}
                      title={key.isActive ? "Revoke Key" : "Delete Permanently"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText || 'Confirm'}
          variant={confirmModal.variant as any}
        />
      </div>
    </DashboardLayout>
  );
}
