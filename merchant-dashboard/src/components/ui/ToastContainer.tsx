import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto"
                    >
                        <div className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border-2 backdrop-blur-md shadow-2xl min-w-[300px] max-w-md bg-surface
              ${toast.type === 'success' ? 'border-green-500/30 text-green-600 dark:text-green-400' :
                                toast.type === 'error' ? 'border-red-500/30 text-red-600 dark:text-red-400' :
                                    'border-blue-500/30 text-blue-600 dark:text-blue-400'}
            `}>
                            <div className="flex-shrink-0">
                                {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                                {toast.type === 'error' && <XCircle className="h-5 w-5" />}
                                {toast.type === 'info' && <Info className="h-5 w-5" />}
                            </div>

                            <p className="text-sm font-bold flex-1">{toast.message}</p>

                            <button
                                onClick={() => onRemove(toast.id)}
                                className="hover:bg-white/5 p-1 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4 opacity-50" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
