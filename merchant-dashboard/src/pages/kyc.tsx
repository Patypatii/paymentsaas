import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { IKContext, IKUpload } from 'imagekitio-react';
import {
    ShieldCheck,
    Upload,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    FileText,
    Building2,
    UserCheck,
    Send
} from 'lucide-react';
import clsx from 'clsx';
import { useToast } from '../context/ToastContext';


const DOCUMENT_TYPES = [
    { id: 'ID_FRONT', label: 'Government ID (Front)', description: 'National ID, Passport, or Driver\'s License', step: 1 },
    { id: 'ID_BACK', label: 'Government ID (Back)', description: 'Back side of your ID document', step: 1 },
    { id: 'BUSINESS_LICENSE', label: 'Business License', description: 'Certification of incorporation or business permit', step: 2 },
    { id: 'TAX_CERTIFICATE', label: 'Tax Certificate', description: 'KRA PIN or similar tax registration document', step: 2 },
];

const STEPS = [
    { id: 0, title: 'Introduction', icon: ShieldCheck },
    { id: 1, title: 'Identity', icon: UserCheck },
    { id: 2, title: 'Business', icon: Building2 },
    { id: 3, title: 'Review', icon: FileText },
];

export default function KYC() {
    const { success, error } = useToast();
    const [currentStep, setCurrentStep] = useState(0);

    const [merchant, setMerchant] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    const authenticationEndpoint = `${process.env.API_URL}/merchants/kyc/auth`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kycRes, profileRes] = await Promise.all([
                    api.get('/merchants/kyc'),
                    api.get('/merchants/profile')
                ]);
                setDocuments(kycRes.data.documents);
                setMerchant(profileRes.data.merchant);
            } catch (error) {
                console.error('Failed to fetch KYC data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/merchants/kyc');
            setDocuments(response.data.documents);
        } catch (error) {
            console.error('Failed to fetch KYC documents:', error);
        }
    };

    const onUploadSuccess = async (res: any, type: string) => {
        try {
            await api.post('/merchants/kyc', {
                type,
                fileUrl: res.url,
                fileId: res.fileId,
            });
            await fetchDocuments();
            setUploading(null);
        } catch (err) {
            console.error('Failed to save document record:', err);
            error('Failed to register uploaded document. Please contact support.');
        }
    };

    const onUploadError = (err: any) => {
        console.error('Upload error:', err);
        setUploading(null);
        error('Upload failed. Please try again.');
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/merchants/kyc/finalize');
            await fetchDocuments();
            setCurrentStep(0);
            success('KYC submitted successfully! Our team will review your documents.');
        } catch (err: any) {
            console.error('Final submission failed:', err);
            error(err.response?.data?.message || 'Failed to submit KYC. Ensure all documents are uploaded.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDocByStep = (step: number) => {
        return DOCUMENT_TYPES.filter(d => d.step === step);
    };

    const getDocStatus = (type: string) => {
        return documents.find((doc) => doc.type === type);
    };

    const canGoToNext = () => {
        if (currentStep === 0) return true;
        if (currentStep === 3) return false;
        const stepDocs = getDocByStep(currentStep);
        return stepDocs.every(d => !!getDocStatus(d.id));
    };

    const authenticator = async () => {
        try {
            const response = await fetch(authenticationEndpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Request failed with status ${response.status}: ${error.message}`);
            }
            const data = await response.json();
            return { signature: data.signature, expire: data.expire, token: data.token };
        } catch (error: any) {
            throw new Error(`Authentication request failed: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        );
    }

    const isVerificationDone = documents.length > 0 && documents.every(d => d.status === 'APPROVED' || d.status === 'PENDING');
    const hasRejectedDocs = documents.some(d => d.status === 'REJECTED');
    const isAllApproved = (merchant?.status === 'ACTIVE') || (documents.length >= DOCUMENT_TYPES.length && documents.every(d => d.status === 'APPROVED'));

    return (
        <DashboardLayout title="KYC Verification - Merchant Dashboard">
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-main">KYC Verification</h1>
                            <p className="text-muted">Complete your verification to enable full transaction capabilities.</p>
                        </div>
                    </div>
                </div>

                <div className="relative pb-8">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-surface/50" />
                    <div className="relative flex justify-between">
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isCompleted = currentStep > step.id;
                            const isActive = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2">
                                    <div className={clsx(
                                        "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        isActive ? "bg-primary border-primary text-main scale-110" :
                                            isCompleted ? "bg-green-500 border-green-500 text-main" :
                                                "bg-background border-border text-gray-500"
                                    )}>
                                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </div>
                                    <span className={clsx(
                                        "text-xs font-medium transition-colors",
                                        isActive ? "text-main" : "text-muted"
                                    )}>{step.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {currentStep === 0 && (
                        <div className="glass-card p-8 rounded-2xl border border-border space-y-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-main">Ready to verify your business?</h2>
                                <p className="text-muted max-w-md mx-auto">
                                    We need to verify your identity and business legitimacy to protect our platform. You'll need:
                                </p>
                            </div>
                            <ul className="text-left max-w-sm mx-auto space-y-3">
                                <li className="flex items-center gap-3 text-main">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Government issued ID
                                </li>
                                <li className="flex items-center gap-3 text-main">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Business registration certificate
                                </li>
                                <li className="flex items-center gap-3 text-main">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Tax registration documents
                                </li>
                            </ul>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="mt-4 px-8 py-3 bg-primary hover:bg-primary-dark text-main rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
                            >
                                Start Verification <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {(currentStep === 1 || currentStep === 2) && (
                        <div className="space-y-6">
                            <IKContext
                                publicKey={publicKey}
                                urlEndpoint={urlEndpoint}
                                authenticator={authenticator}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {getDocByStep(currentStep).map((docType) => {
                                        const statusDoc = getDocStatus(docType.id);
                                        const isUploading = uploading === docType.id;
                                        return (
                                            <div key={docType.id} className="flex flex-col space-y-4">
                                                <div className="glass-card p-6 rounded-xl border border-border">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-main">{docType.label}</h3>
                                                        <p className="text-sm text-muted">{docType.description}</p>
                                                    </div>
                                                    <div className="relative group mt-4">
                                                        {statusDoc ? (
                                                            <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black/20">
                                                                <img
                                                                    src={statusDoc.fileUrl}
                                                                    alt={docType.label}
                                                                    className="w-full h-full object-cover opacity-60"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                                                        <span className="text-xs font-medium text-white px-2 py-1 bg-black/60 rounded backdrop-blur-sm">
                                                                            {statusDoc.status === 'REJECTED' ? 'Rejected' : 'Uploaded'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {(statusDoc.status === 'DRAFT' || statusDoc.status === 'REJECTED') && (
                                                                    <div className="absolute top-2 right-2">
                                                                        <IKUpload
                                                                            fileName={`${docType.id.toLowerCase()}_${Date.now()}`}
                                                                            onSuccess={(res) => onUploadSuccess(res, docType.id)}
                                                                            onError={onUploadError}
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                            onChange={() => setUploading(docType.id)}
                                                                        />
                                                                        <button className="p-1.5 bg-surface/80 hover:bg-surface rounded-lg backdrop-blur-md transition-colors border border-border">
                                                                            <Upload className="h-4 w-4 text-main" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="relative border-2 border-dashed border-border rounded-xl p-8 transition-colors hover:border-primary/50 bg-surface/30">
                                                                {isUploading ? (
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        <Clock className="h-8 w-8 text-primary animate-spin" />
                                                                        <span className="text-sm text-primary">Uploading...</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <IKUpload
                                                                            fileName={`${docType.id.toLowerCase()}_${Date.now()}`}
                                                                            useUniqueFileName={true}
                                                                            onSuccess={(res) => onUploadSuccess(res, docType.id)}
                                                                            onError={onUploadError}
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                            onChange={() => setUploading(docType.id)}
                                                                        />
                                                                        <div className="flex flex-col items-center gap-2 font-semibold">
                                                                            <Upload className="h-8 w-8 text-muted" />
                                                                            <span className="text-sm text-muted">Upload {docType.label}</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {statusDoc?.status === 'REJECTED' && statusDoc.rejectionReason && (
                                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 items-start">
                                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs text-red-500 font-medium">
                                                            Rejected: {statusDoc.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </IKContext>
                            <div className="flex justify-between items-center pt-4">
                                <button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="px-6 py-2 text-muted hover:text-main transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </button>
                                <button
                                    disabled={!canGoToNext()}
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className={clsx(
                                        "px-8 py-2 rounded-xl font-semibold transition-all flex items-center gap-2",
                                        canGoToNext() ? "bg-primary text-main shadow-lg shadow-primary/20" : "bg-surface/50 text-muted cursor-not-allowed"
                                    )}
                                >
                                    Continue <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="glass-card p-6 rounded-2xl border border-border space-y-6">
                                <h3 className="text-lg font-semibold text-main border-b border-white/5 pb-4">Submission Summary</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {DOCUMENT_TYPES.map(d => {
                                        const doc = getDocStatus(d.id);
                                        return (
                                            <div key={d.id} className="space-y-2">
                                                <div className="aspect-square rounded-lg border border-border bg-surface overflow-hidden">
                                                    <img src={doc?.fileUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <p className="text-[10px] text-muted uppercase font-bold text-center truncate">{d.label.split('(')[0]}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                    <p className="text-xs text-yellow-500/80 leading-relaxed font-semibold">
                                        By clicking submit, you confirm that the uploaded documents are authentic and belong to the business registered under this account.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="px-6 py-2 text-muted hover:text-main transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </button>
                                <button
                                    disabled={isSubmitting || isVerificationDone}
                                    onClick={handleFinalSubmit}
                                    className={clsx(
                                        "px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20",
                                        "bg-primary text-main hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    )}
                                >
                                    {isSubmitting ? "Submitting..." : isVerificationDone ? "Submitted for Review" : "Submit for Verification"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {isAllApproved ? (
                    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <ShieldCheck className="h-8 w-8 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-100">Verification Complete</h3>
                            <p className="text-green-500/70 text-sm">
                                Your identity and business documents have been verified. Your account is fully activated.
                            </p>
                        </div>
                    </div>
                ) : hasRejectedDocs ? (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-full">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-100">Action Required</h3>
                            <p className="text-red-500/70 text-sm">
                                Some of your documents were rejected. Please review the reasons and re-upload.
                            </p>
                        </div>
                    </div>
                ) : isVerificationDone && currentStep === 0 && (
                    <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full animate-bounce">
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-main">Verification in Progress</h3>
                            <p className="text-yellow-600 dark:text-yellow-500/70 text-sm">
                                Your documents are currently being reviewed. You'll receive an email once activated.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
