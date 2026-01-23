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
              flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl min-w-[300px] max-w-md
              ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-100' :
                                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-100' :
                                    'bg-blue-500/10 border-blue-500/20 text-blue-100'}
            `}>
                            <div className="flex-shrink-0">
                                {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                                {toast.type === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
                                {toast.type === 'info' && <Info className="h-5 w-5 text-blue-400" />}
                            </div>

                            <p className="text-sm font-medium flex-1">{toast.message}</p>

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
