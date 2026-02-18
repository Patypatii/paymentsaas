import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Lock, Bell, Store, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ImageKitService } from '../services/imagekit.service';

export default function Settings() {
    const { success, error } = useToast();
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [bioText, setBioText] = useState('');
    const [profile, setProfile] = useState<any>(null);

    // Form states
    const [generalForm, setGeneralForm] = useState({
        businessName: '',
        email: '',
    });
    const [notifications, setNotifications] = useState({
        email: true,
        sms: true
    });

    const tabs = [
        { id: 'general', name: 'General', icon: Store },
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/merchants/profile');
            const m = data.merchant;
            setProfile(m);
            setGeneralForm({
                businessName: m.businessName || '',
                email: m.email || '',
            });
            if (m.notifications) {
                setNotifications(m.notifications);
            }
            setBioText(m.bio || '');  // Initialize bio text
        } catch (err) {
            error('Failed to load profile settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (updates: any) => {
        setIsSaving(true);
        try {
            await api.patch('/merchants/profile', updates);
            success('Settings updated successfully');
            fetchProfile(); // Refresh
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotificationToggle = (type: 'email' | 'sms') => {
        const newSettings = { ...notifications, [type]: !notifications[type] };
        setNotifications(newSettings);
        handleUpdateProfile({ notifications: newSettings });
    };

    const handleAvatarUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const imageUrl = await ImageKitService.uploadProfilePicture(file);
            success('Profile picture uploaded successfully!');
            // Refresh profile to get updated image
            fetchProfile();
        } catch (err: any) {
            error(err.message || 'Failed to upload profile picture');
        } finally {
            setIsUploading(false);
        }
    };

    const handleBioSave = async () => {
        setIsSaving(true);
        try {
            await api.patch('/merchants/profile/bio', { bio: bioText });
            success('Bio updated successfully!');
            fetchProfile();
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to update bio');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Settings - Paylor">
                <div className="flex h-[500px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Settings - Paylor">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight text-main">Settings</h1>

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
                                        : 'text-muted hover:bg-surface/50 hover:text-main border-transparent',
                                    'group flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg border-l-2'
                                )}
                            >
                                <tab.icon
                                    className={clsx(
                                        activeTab === tab.id ? 'text-primary' : 'text-gray-500 group-hover:text-muted',
                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                    )}
                                />
                                {tab.name}
                            </button>
                        ))}
                    </nav>

                    {/* Content Area */}
                    <div className="flex-1 glass-card p-6 rounded-xl border border-border min-h-[500px]">
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-lg font-medium text-main mb-4">Business Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-muted">Business Name</label>
                                        <input
                                            type="text"
                                            value={generalForm.businessName}
                                            onChange={(e) => setGeneralForm({ ...generalForm, businessName: e.target.value })}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-main focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-muted">Email Address (Read Only)</label>
                                        <input
                                            type="email"
                                            disabled
                                            value={generalForm.email}
                                            className="w-full px-4 py-2 bg-surface/50 border border-border rounded-lg text-muted cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => handleUpdateProfile({ businessName: generalForm.businessName })}
                                        disabled={isSaving}
                                        className="bg-primary hover:bg-primary-hover text-main px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-lg font-medium text-main mb-4">Notification Preferences</h2>
                                <p className="text-sm text-muted mb-6">Choose how you want to be notified about important updates and transaction alerts.</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border">
                                        <div>
                                            <p className="text-sm font-medium text-main">Email Alerts</p>
                                            <p className="text-xs text-muted">Receive transactional emails and critical system alerts.</p>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationToggle('email')}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications.email ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.email ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border opacity-50">
                                        <div>
                                            <p className="text-sm font-medium text-main">SMS Alerts</p>
                                            <p className="text-xs text-muted">Receive instant SMS notifications for payouts (Coming Soon)</p>
                                        </div>
                                        <button
                                            disabled
                                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-gray-200 dark:bg-white/10"
                                        >
                                            <span
                                                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-lg font-medium text-main mb-4">Security Settings</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border">
                                        <div>
                                            <p className="text-sm font-medium text-main">Change Password</p>
                                            <p className="text-xs text-muted">Update your account password regularly to stay safe.</p>
                                        </div>
                                        <button className="text-main bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 px-3 py-1.5 rounded text-sm font-medium transition-colors">Update</button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border opacity-50 cursor-not-allowed">
                                        <div>
                                            <p className="text-sm font-medium text-main">Two-Factor Authentication</p>
                                            <p className="text-xs text-muted">Currently unavailable for this plan.</p>
                                        </div>
                                        <button disabled className="text-primary/50 text-sm font-medium">Enable</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-lg font-medium text-main mb-4">Profile Information</h2>

                                {/* Profile Picture Upload */}
                                <div className="flex items-start gap-6">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="relative group">
                                            {profile?.profilePicture ? (
                                                <img
                                                    src={profile.profilePicture}
                                                    alt="Profile"
                                                    className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-border shadow-lg">
                                                    {profile?.firstName?.charAt(0)?.toUpperCase() || 'M'}
                                                </div>
                                            )}
                                            <label
                                                htmlFor="avatar-upload"
                                                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                                            >
                                                <div className="text-white text-center">
                                                    {isUploading ? (
                                                        <>
                                                            <Loader2 className="h-6 w-6 mx-auto mb-1 animate-spin" />
                                                            <span className="text-xs font-medium">Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="h-6 w-6 mx-auto mb-1" />
                                                            <span className="text-xs font-medium">Change</span>
                                                        </>
                                                    )}
                                                </div>
                                            </label>
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                disabled={isUploading}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleAvatarUpload(file);
                                                        // Reset input
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted text-center max-w-[140px]">
                                            Click to upload a new profile picture
                                        </p>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-muted">Full Name</label>
                                            <input
                                                type="text"
                                                value={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
                                                disabled
                                                className="w-full px-4 py-2 bg-surface/50 border border-border rounded-lg text-muted cursor-not-allowed"
                                            />
                                            <p className="text-xs text-muted">Contact support to update your name</p>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-muted">Username</label>
                                            <input
                                                type="text"
                                                value={profile?.username || ''}
                                                disabled
                                                className="w-full px-4 py-2 bg-surface/50 border border-border rounded-lg text-muted cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bio Section */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-muted">Bio / About</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us about your business..."
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-main focus:ring-1 focus:ring-primary outline-none resize-none"
                                        value={bioText}
                                        onChange={(e) => setBioText(e.target.value)}
                                    />
                                    <p className="text-xs text-muted">A brief description about your business (optional)</p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleBioSave}
                                        disabled={isSaving}
                                        className="bg-primary hover:bg-primary-hover text-main px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Save Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
