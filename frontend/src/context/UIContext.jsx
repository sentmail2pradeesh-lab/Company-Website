import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactService, setContactService] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ve_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('ve_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const openContact = useCallback((service = '') => {
    setContactService(service);
    setIsContactOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setIsContactOpen(false);
    setContactService('');
  }, []);

  return (
    <UIContext.Provider
      value={{
        isContactOpen,
        contactService,
        openContact,
        closeContact,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
