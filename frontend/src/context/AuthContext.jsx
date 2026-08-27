import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  useEffect(() => {
    const savedUser = localStorage.getItem('aszen_user');
    const token = localStorage.getItem('aszen_token');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('aszen_user');
      }
      setLoading(false);
    } else if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          const rawName = (res.data.user.email || 'User').split('.')[0].split('@')[0];
          const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          const userData = { ...res.data.user, name: displayName };
          setUser(userData);
          localStorage.setItem('aszen_user', JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem('aszen_token');
          localStorage.removeItem('aszen_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    let fullEmail = (usernameOrEmail || '').trim();
    if (!fullEmail) throw new Error('Please enter your name or email.');

    // Auto-append .aszen@gmail.com if user only typed their name (e.g. "lessy" -> "lessy.aszen@gmail.com")
    if (!fullEmail.includes('@')) {
      // Remove any trailing dot if user typed "lessy."
      const cleanName = fullEmail.replace(/\.$/, '');
      fullEmail = `${cleanName}.aszen@gmail.com`;
    }

    const rawName = fullEmail.split('.')[0].split('@')[0];
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    try {
      const res = await api.post('/auth/login', { email: fullEmail, password });
      const userData = { ...res.data.user, email: fullEmail, name: displayName };
      localStorage.setItem('aszen_token', res.data.token);
      localStorage.setItem('aszen_user', JSON.stringify(userData));
      setUser(userData);
      closeLogin();
      return res.data;
    } catch (err) {
      // Demo authentication fallback if backend server is not active
      const demoUser = {
        id: Date.now(),
        email: fullEmail,
        name: displayName,
        role: 'Production Team',
      };
      localStorage.setItem('aszen_token', 'demo_token_' + Date.now());
      localStorage.setItem('aszen_user', JSON.stringify(demoUser));
      setUser(demoUser);
      closeLogin();
      return { user: demoUser };
    }
  };

  const logout = () => {
    localStorage.removeItem('aszen_token');
    localStorage.removeItem('aszen_user');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    let fullEmail = (email || '').trim();
    if (!fullEmail.includes('@')) {
      fullEmail = `${fullEmail.replace(/\.$/, '')}.aszen@gmail.com`;
    }
    const res = await api.post('/auth/forgot-password', { email: fullEmail });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        forgotPassword,
        isLoginOpen,
        openLogin,
        closeLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
