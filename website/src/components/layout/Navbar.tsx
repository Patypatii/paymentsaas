import Link from 'next/link';
import { Menu, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              <img src="/favicon.svg" alt="Paylor" className="w-8 h-8 rounded-lg" />
              Paylor
            </Link>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/#services" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/docs" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Developer APIs
            </Link>

            <Link href="/contact" className="text-sm font-medium text-muted hover:text-main transition-colors">
              Contact
            </Link>

            {/* Theme Toggle - Only render on client side */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-muted hover:text-main" />
                ) : (
                  <Moon className="h-5 w-5 text-muted hover:text-main" />
                )}
              </button>
            )}

            <Link
              href={process.env.NEXT_PUBLIC_LOGIN_URL || "/login"}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/25"
            >
              Sign In
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
              Home
            </Link>
            <Link href="/#services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
              Services
            </Link>
            <Link href="/docs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
              Developer APIs
            </Link>

            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
              Contact Us
            </Link>
            <Link href={process.env.NEXT_PUBLIC_LOGIN_URL || "/login"} className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-primary-hover hover:bg-white/5">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
