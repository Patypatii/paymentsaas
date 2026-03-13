import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/H5hUEND9cu47lYkJng3IVB';
const STORAGE_KEY = 'paylor_community_popup_dismissed';

// WhatsApp SVG icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
    <circle cx="16" cy="16" r="16" fill="#25D366" />
    <path
      d="M22.5 9.5C21.0 8.0 19.1 7.0 17 6.8C12.6 6.3 8.5 9.5 8.0 13.9C7.8 15.5 8.2 17.1 9.0 18.4L8.0 23.0L12.8 22.0C14.0 22.7 15.4 23.1 16.8 23.1H16.9C21.4 23.1 25.1 19.4 25.1 14.9C25.1 12.7 24.2 10.8 22.5 9.5ZM16.9 21.6C15.7 21.6 14.5 21.3 13.5 20.6L13.2 20.4L10.2 21.2L11.0 18.3L10.8 18.0C10.0 16.9 9.6 15.6 9.6 14.2C9.6 10.5 13.0 7.5 17.0 7.8C18.9 8.0 20.6 8.9 21.9 10.2C23.1 11.5 23.7 13.2 23.7 14.9C23.5 18.7 20.5 21.6 16.9 21.6Z"
      fill="white"
    />
    <path
      d="M20.4 16.5C20.2 16.4 19.2 15.9 19.0 15.8C18.8 15.7 18.7 15.7 18.5 15.9C18.4 16.1 17.9 16.6 17.8 16.8C17.7 16.9 17.6 17.0 17.4 16.9C17.2 16.8 16.5 16.6 15.7 15.9C15.1 15.3 14.7 14.6 14.6 14.4C14.5 14.2 14.6 14.1 14.7 14.0C14.8 13.9 14.9 13.8 15.0 13.6C15.1 13.5 15.2 13.4 15.2 13.3C15.3 13.2 15.2 13.1 15.2 13.0C15.1 12.9 14.7 11.9 14.5 11.5C14.4 11.1 14.2 11.1 14.1 11.1H13.7C13.5 11.1 13.3 11.2 13.1 11.4C12.9 11.6 12.4 12.1 12.4 13.1C12.4 14.1 13.2 15.0 13.3 15.1C13.4 15.3 14.7 17.3 16.6 18.2C18.5 19.0 18.5 18.7 18.9 18.7C19.3 18.7 20.2 18.2 20.4 17.8C20.6 17.3 20.6 16.9 20.5 16.8C20.6 16.6 20.5 16.6 20.4 16.5Z"
      fill="white"
    />
  </svg>
);

export default function CommunityPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not dismissed in this session
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Popup card */}
      <div className="relative w-80 bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-green-100 dark:border-green-900/30 overflow-hidden">
        {/* Green header bar */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WhatsAppIcon />
            <span className="text-white font-semibold text-sm">Join Our Community</span>
          </div>
          <button
            onClick={dismiss}
            className="text-white/80 hover:text-white transition-colors rounded-full p-0.5 hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Get <strong>real-time support</strong>, tips, and early access to new features. Join merchants on our WhatsApp group!
          </p>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-md hover:shadow-green-200 dark:hover:shadow-green-900"
          >
            <WhatsAppIcon />
            Join WhatsApp Community
          </a>
          <button
            onClick={dismiss}
            className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors py-1"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
