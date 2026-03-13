import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Lock, Bell, Store, Check, Loader2, X, Phone, AlertTriangle } from 'lucide-react';
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
        settlementType: 'PAYBILL',
        shortcode: ''
    });
    const [notifications, setNotifications] = useState({
        email: true,
        sms: true,
        lowBalanceAlert: false,
        alertPhone: '',
        lowBalanceThreshold: 50
    });

    // Dialog states
    const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
    const [lowBalanceDialogOpen, setLowBalanceDialogOpen] = useState(false);
    const [dialogPhone, setDialogPhone] = useState('');
    const [dialogThreshold, setDialogThreshold] = useState('50');
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const thresholdInputRef = useRef<HTMLInputElement>(null);

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
                settlementType: m.settlementType || 'PAYBILL',
                shortcode: m.shortcode || ''
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

    /** WhatsApp: open dialog when enabling, disable directly */
    const handleWhatsappToggle = () => {
        if (!notifications.sms) {
            // Enabling: open dialog to ask for phone
            setDialogPhone(notifications.alertPhone || '');
            setWhatsappDialogOpen(true);
            setTimeout(() => phoneInputRef.current?.focus(), 100);
        } else {
            // Disabling directly
            const updated = { ...notifications, sms: false };
            setNotifications(updated);
            handleUpdateProfile({ notifications: updated });
        }
    };

    const confirmWhatsappDialog = () => {
        if (!dialogPhone.trim()) return;

        // Normalise to Kenyan international format (254XXXXXXXXX)
        let phone = dialogPhone.trim().replace(/[\+\-\s]/g, '');
        if (phone.startsWith('0')) phone = '254' + phone.slice(1);        // 07xx → 2547xx
        else if (phone.startsWith('7') || phone.startsWith('1')) phone = '254' + phone; // 7xx → 2547xx
        // already 254xxx → keep as is

        const updated = { ...notifications, sms: true, alertPhone: phone };
        setNotifications(updated);
        handleUpdateProfile({ notifications: updated });
        setWhatsappDialogOpen(false);
    };

    /** Low Balance Alert: open dialog when enabling, disable directly */
    const handleLowBalanceToggle = () => {
        if (!notifications.lowBalanceAlert) {
            setDialogThreshold(String(notifications.lowBalanceThreshold || 50));
            setLowBalanceDialogOpen(true);
            setTimeout(() => thresholdInputRef.current?.focus(), 100);
        } else {
            const updated = { ...notifications, lowBalanceAlert: false };
            setNotifications(updated);
            handleUpdateProfile({ notifications: updated });
        }
    };

    const confirmLowBalanceDialog = () => {
        const threshold = parseFloat(dialogThreshold);
        if (isNaN(threshold) || threshold <= 0) return;
        const updated = { ...notifications, lowBalanceAlert: true, lowBalanceThreshold: threshold };
        setNotifications(updated);
        handleUpdateProfile({ notifications: updated });
        setLowBalanceDialogOpen(false);
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
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-muted">Settlement Type</label>
                                        <select
                                            value={generalForm.settlementType}
                                            onChange={(e) => setGeneralForm({ ...generalForm, settlementType: e.target.value })}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-main focus:ring-1 focus:ring-primary outline-none"
                                        >
                                            <option value="PAYBILL">Paybill</option>
                                            <option value="TILL">Till Number</option>
                                            <option value="BANK_PAYBILL">Bank Paybill</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-muted">Shortcode / Till Number</label>
                                        <input
                                            type="text"
                                            value={generalForm.shortcode}
                                            onChange={(e) => setGeneralForm({ ...generalForm, shortcode: e.target.value })}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-main focus:ring-1 focus:ring-primary outline-none"
                                            placeholder="e.g. 123456"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => handleUpdateProfile({
                                            businessName: generalForm.businessName,
                                            settlementType: generalForm.settlementType,
                                            shortcode: generalForm.shortcode
                                        })}
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
                                    {/* Email Alerts */}
                                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border">
                                        <div>
                                            <p className="text-sm font-medium text-main">Email Alerts</p>
                                            <p className="text-xs text-muted">Receive transactional emails and critical system alerts.</p>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationToggle('email')}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications.email ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.email ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* WhatsApp Alerts */}
                                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border">
                                        <div>
                                            <p className="text-sm font-medium text-main flex items-center gap-2">WhatsApp Notifications <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-medium">NEW</span></p>
                                            <p className="text-xs text-muted">Get instant WhatsApp alerts for every successful payment.</p>
                                            {notifications.sms && notifications.alertPhone && (
                                                <p className="text-xs text-primary mt-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Sending to: {notifications.alertPhone}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleWhatsappToggle}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications.sms ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/10'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.sms ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* Low Balance Alert */}
                                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border">
                                        <div>
                                            <p className="text-sm font-medium text-main flex items-center gap-2">Low Balance Alert <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">NEW</span></p>
                                            <p className="text-xs text-muted">Get a WhatsApp alert when your wallet drops below a set threshold.</p>
                                            {notifications.lowBalanceAlert && (
                                                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Alert when below: KES {notifications.lowBalanceThreshold}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleLowBalanceToggle}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications.lowBalanceAlert ? 'bg-amber-500' : 'bg-gray-200 dark:bg-white/10'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.lowBalanceAlert ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* ── WhatsApp Dialog ── */}
                                {whatsappDialogOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setWhatsappDialogOpen(false)}>
                                        <div className="relative w-full max-w-md mx-4 glass-card border border-border rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setWhatsappDialogOpen(false)} className="absolute top-4 right-4 text-muted hover:text-main transition-colors"><X className="h-5 w-5" /></button>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <Phone className="h-5 w-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-main">Enable WhatsApp Alerts</h3>
                                                    <p className="text-xs text-muted">Enter your WhatsApp number to receive payment notifications.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-muted">WhatsApp Phone Number</label>
                                                <input
                                                    ref={phoneInputRef}
                                                    type="tel"
                                                    value={dialogPhone}
                                                    onChange={e => setDialogPhone(e.target.value)}
                                                    placeholder="e.g. 254712345678"
                                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-main focus:ring-1 focus:ring-green-500 outline-none"
                                                    onKeyDown={e => e.key === 'Enter' && confirmWhatsappDialog()}
                                                />
                                                <p className="text-xs text-muted">Include country code, no + or spaces. e.g. 254712345678</p>
                                            </div>
                                            <div className="flex gap-3 mt-5">
                                                <button onClick={() => setWhatsappDialogOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-muted hover:text-main transition-colors text-sm font-medium">Cancel</button>
                                                <button
                                                    onClick={confirmWhatsappDialog}
                                                    disabled={!dialogPhone.trim()}
                                                    className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <Check className="h-4 w-4" /> Enable Alerts
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Low Balance Dialog ── */}
                                {lowBalanceDialogOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setLowBalanceDialogOpen(false)}>
                                        <div className="relative w-full max-w-md mx-4 glass-card border border-border rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setLowBalanceDialogOpen(false)} className="absolute top-4 right-4 text-muted hover:text-main transition-colors"><X className="h-5 w-5" /></button>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-main">Set Low Balance Threshold</h3>
                                                    <p className="text-xs text-muted">You&apos;ll get a WhatsApp alert when your balance drops below this amount.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-muted">Minimum Balance (KES)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">KES</span>
                                                    <input
                                                        ref={thresholdInputRef}
                                                        type="number"
                                                        min="1"
                                                        value={dialogThreshold}
                                                        onChange={e => setDialogThreshold(e.target.value)}
                                                        placeholder="e.g. 100"
                                                        className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-lg text-main focus:ring-1 focus:ring-amber-500 outline-none"
                                                        onKeyDown={e => e.key === 'Enter' && confirmLowBalanceDialog()}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted">Alert will be sent to your configured WhatsApp number.</p>
                                            </div>
                                            <div className="flex gap-3 mt-5">
                                                <button onClick={() => setLowBalanceDialogOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-muted hover:text-main transition-colors text-sm font-medium">Cancel</button>
                                                <button
                                                    onClick={confirmLowBalanceDialog}
                                                    disabled={!dialogThreshold || parseFloat(dialogThreshold) <= 0}
                                                    className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <Check className="h-4 w-4" /> Enable Alert
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
