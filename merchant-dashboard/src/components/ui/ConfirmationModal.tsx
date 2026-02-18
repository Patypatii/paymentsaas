import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const bgColors = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        info: 'bg-blue-600 hover:bg-blue-700'
    };

    const iconColors = {
        danger: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-border relative animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full bg-surface/50 mb-4 ${iconColors[variant]}`}>
                        <AlertTriangle className="h-8 w-8" />
                    </div>

                    <h3 className="text-lg font-bold text-main mb-2">{title}</h3>
                    <p className="text-muted text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-main hover:bg-surface/50 transition-colors disabled:opacity-50 font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-main font-medium shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${bgColors[variant]}`}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
