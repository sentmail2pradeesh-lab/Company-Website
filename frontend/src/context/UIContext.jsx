import { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactService, setContactService] = useState('');

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
      value={{ isContactOpen, contactService, openContact, closeContact }}
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
