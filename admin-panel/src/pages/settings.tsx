import { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Settings as SettingsIcon, Shield, Users, Database, CreditCard, Save } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [channelConfig, setChannelConfig] = useState({
        type: 'PAYBILL',
        number: '',
        accountNumber: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings/channel');
            if (data.channel) {
                setChannelConfig({
                    type: data.channel.type || 'PAYBILL',
                    number: data.channel.number || '',
                    accountNumber: data.channel.accountNumber || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleUpdateChannel = async () => {
        setLoading(true);
        try {
            await api.post('/admin/settings/channel', channelConfig);
            toast.success('Platform configuration updated successfully');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="System Settings - Admin Panel">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
                    <p className="mt-2 text-sm text-gray-400">Configure global platform parameters and access controls.</p>
                </div>

                <div className="space-y-6">
                    {/* Admin Users */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">Admin Access</h3>
                                <p className="text-sm text-gray-400">Manage internal team access and roles.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">SU</div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Super Admin</p>
                                        <p className="text-xs text-gray-400">patrick@paylor.com</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">Last active: Just now</span>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                                + Add Admin User
                            </button>
                        </div>
                    </div>

                    {/* Platform Payment Channel */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">Platform Payment Channel</h3>
                                <p className="text-sm text-gray-400">Destination for Subscription and Credit purchases.</p>
                            </div>
                        </div>
                        <div className="space-y-4 max-w-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Channel Type</label>
                                    <select
                                        value={channelConfig.type}
                                        onChange={(e) => setChannelConfig({ ...channelConfig, type: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                                    >
                                        <option value="PAYBILL">Paybill</option>
                                        <option value="TILL">Till Number (Buy Goods)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                        {channelConfig.type === 'PAYBILL' ? 'Paybill Number' : 'Till Number'}
                                    </label>
                                    <input
                                        type="text"
                                        value={channelConfig.number}
                                        onChange={(e) => setChannelConfig({ ...channelConfig, number: e.target.value })}
                                        placeholder="e.g. 123456"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {channelConfig.type === 'PAYBILL' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Account Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={channelConfig.accountNumber}
                                        onChange={(e) => setChannelConfig({ ...channelConfig, accountNumber: e.target.value })}
                                        placeholder="Specific Bank Account Number"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Leave empty to use the default Reference (TOPUP-...). Use this for Bank Paybills requiring specific accounts.</p>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={handleUpdateChannel}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {loading ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Global Config */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">System Configuration</h3>
                                <p className="text-sm text-gray-400">Global variables and feature flags.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">Maintenance Mode</p>
                                    <p className="text-xs text-gray-400">Disable all non-admin access.</p>
                                </div>
                                <button className="bg-white/10 w-12 h-6 rounded-full relative transition-colors">
                                    <span className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full transition-transform"></span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-sm font-medium text-white">New Registrations</p>
                                    <p className="text-xs text-gray-400">Allow new merchants to sign up.</p>
                                </div>
                                <button className="bg-green-500 w-12 h-6 rounded-full relative transition-colors">
                                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
