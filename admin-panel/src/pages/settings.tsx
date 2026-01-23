import AdminLayout from '../components/layout/AdminLayout';
import { Settings as SettingsIcon, Shield, Users, Database } from 'lucide-react';

export default function Settings() {
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
