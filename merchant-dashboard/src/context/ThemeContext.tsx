import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 1. Check local storage
        const savedTheme = localStorage.getItem('theme') as Theme;

        // 2. Or check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Default to saved > system > dark
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

        setTheme(initialTheme);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);
        // Update Storage
        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    // During SSR or if ThemeProvider is missing, return a safe default
    if (context === undefined) {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            // SSR - return default dark theme without localStorage
            return {
                theme: 'dark' as Theme,
                toggleTheme: () => { }, // No-op during SSR
            };
        }
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}
