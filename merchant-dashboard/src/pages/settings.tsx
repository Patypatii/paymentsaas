import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Lock, Bell, Store } from 'lucide-react';
import clsx from 'clsx';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', name: 'General', icon: Store },
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
    ];

    return (
        <DashboardLayout title="Settings - Paylor">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation for Settings */}
                    <nav className="w-full md:w-64 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    activeTab === tab.id
                                        ? 'bg-primary/10 text-primary border-primary'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent',
                                    'group flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg border-l-2'
                                )}
                            >
                                <tab.icon
                                    className={clsx(
                                        activeTab === tab.id ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300',
                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                    )}
                                />
                                {tab.name}
                            </button>
                        ))}
                    </nav>

                    {/* Content Area */}
                    <div className="flex-1 glass-card p-6 rounded-xl border border-white/10 min-h-[500px]">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-white mb-4">Business Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-300">Business Name</label>
                                        <input type="text" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" defaultValue="Acme Corp" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-300">Support Email</label>
                                        <input type="email" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" defaultValue="support@acme.com" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-300">Website</label>
                                        <input type="url" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" defaultValue="https://acme.com" />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-white mb-4">Security Settings</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div>
                                            <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                                            <p className="text-xs text-gray-400">Add an extra text of security to your account.</p>
                                        </div>
                                        <button className="text-primary hover:text-primary-hover text-sm font-medium">Enable</button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div>
                                            <p className="text-sm font-medium text-white">Change Password</p>
                                            <p className="text-xs text-gray-400">Last changed 3 months ago.</p>
                                        </div>
                                        <button className="text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm font-medium transition-colors">Update</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Placeholders for other tabs */}
                        {(activeTab === 'profile' || activeTab === 'notifications') && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                This section is under development.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
