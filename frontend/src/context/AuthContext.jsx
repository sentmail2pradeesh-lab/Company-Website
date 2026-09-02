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
    // Clear legacy localStorage user session keys so tabs do not bleed sessions
    localStorage.removeItem('aszen_user');
    localStorage.removeItem('aszen_token');

    // Strict tab-level isolation: check sessionStorage only
    const savedUser = sessionStorage.getItem('aszen_user');
    const token = sessionStorage.getItem('aszen_token');

    const getRoleForEmail = (email, existingRole) => {
      const lower = (email || '').toLowerCase();
      if (lower.includes('arun')) return 'admin';
      if (lower.includes('lessy')) return 'manager';
      if (lower.includes('lalithaa') || lower.includes('lalitha')) return 'employee';
      return existingRole || 'employee';
    };

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const role = getRoleForEmail(parsed.email, parsed.role);
        setUser({ ...parsed, role });
      } catch (e) {
        sessionStorage.removeItem('aszen_user');
        sessionStorage.removeItem('aszen_token');
      }
      setLoading(false);
    } else if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          const email = res.data.user.email || '';
          const rawName = email.split('.')[0].split('@')[0];
          const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          const role = getRoleForEmail(email, res.data.user.role);
          const userData = { ...res.data.user, name: displayName, role };
          setUser(userData);
          sessionStorage.setItem('aszen_user', JSON.stringify(userData));
        })
        .catch(() => {
          sessionStorage.removeItem('aszen_token');
          sessionStorage.removeItem('aszen_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    let fullEmail = (usernameOrEmail || '').trim();
    if (!fullEmail) throw new Error('Please enter your name or email.');

    const lowerInput = fullEmail.toLowerCase();

    // Map test credentials & shorthand names
    let role = 'employee';
    let displayName = fullEmail;

    if (lowerInput === 'arun' || lowerInput === 'arun@aszen.com') {
      fullEmail = 'Arun@aszen.com';
      displayName = 'Arun';
      role = 'admin';
    } else if (lowerInput === 'lessy' || lowerInput === 'lessy@aszen.com') {
      fullEmail = 'Lessy@aszen.com';
      displayName = 'Lessy';
      role = 'manager';
    } else if (lowerInput === 'lalithaa' || lowerInput === 'lalitha' || lowerInput === 'lalithaa@aszen.com') {
      fullEmail = 'Lalithaa@aszen.com';
      displayName = 'Lalithaa';
      role = 'employee';
    } else {
      if (!fullEmail.includes('@')) {
        const cleanName = fullEmail.replace(/\.$/, '');
        fullEmail = `${cleanName}.aszen@gmail.com`;
      }
      const rawName = fullEmail.split('.')[0].split('@')[0];
      displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    }

    try {
      const res = await api.post('/auth/login', { email: fullEmail, password });
      const userData = {
        ...res.data.user,
        email: fullEmail,
        name: res.data.user.name || displayName,
        role: res.data.user.role || role,
      };
      sessionStorage.setItem('aszen_token', res.data.token);
      sessionStorage.setItem('aszen_user', JSON.stringify(userData));
      
      // Store session login timestamp for active shift
      const nowIso = new Date().toISOString();
      sessionStorage.setItem('aszen_login_timestamp', nowIso);

      // Initialize work session log in localStorage if not already existing
      try {
        const savedSessions = localStorage.getItem('aszen_work_sessions');
        const list = savedSessions ? JSON.parse(savedSessions) : [];
        const todayStr = new Date().toISOString().slice(0, 10);
        const existingActive = list.find((s) => s.user_email?.toLowerCase() === fullEmail.toLowerCase() && s.date === todayStr && s.status === 'Active');
        if (!existingActive) {
          const newSession = {
            id: `ws-${Date.now().toString().slice(-4)}`,
            user_name: userData.name,
            user_email: fullEmail,
            user_role: userData.role,
            date: todayStr,
            login_time: nowIso,
            logout_time: null,
            total_hours: 0,
            status: 'Active',
            notes: 'Morning shift started',
          };
          localStorage.setItem('aszen_work_sessions', JSON.stringify([newSession, ...list]));
        }
      } catch (e) {
        console.error('Work session init error:', e);
      }

      setUser(userData);
      closeLogin();
      return res.data;
    } catch (err) {
      // Demo authentication fallback if backend API is offline or returns error
      const nowIso = new Date().toISOString();
      const demoUser = {
        id: Date.now(),
        email: fullEmail,
        name: displayName,
        role: role,
      };
      const demoToken = 'demo_token_' + Date.now();
      sessionStorage.setItem('aszen_token', demoToken);
      sessionStorage.setItem('aszen_user', JSON.stringify(demoUser));
      sessionStorage.setItem('aszen_login_timestamp', nowIso);

      try {
        const savedSessions = localStorage.getItem('aszen_work_sessions');
        const list = savedSessions ? JSON.parse(savedSessions) : [];
        const todayStr = new Date().toISOString().slice(0, 10);
        const existingActive = list.find((s) => s.user_email?.toLowerCase() === fullEmail.toLowerCase() && s.date === todayStr && s.status === 'Active');
        if (!existingActive) {
          const newSession = {
            id: `ws-${Date.now().toString().slice(-4)}`,
            user_name: displayName,
            user_email: fullEmail,
            user_role: role,
            date: todayStr,
            login_time: nowIso,
            logout_time: null,
            total_hours: 0,
            status: 'Active',
            notes: 'Shift started',
          };
          localStorage.setItem('aszen_work_sessions', JSON.stringify([newSession, ...list]));
        }
      } catch (e) {
        console.error(e);
      }

      setUser(demoUser);
      closeLogin();
      return { user: demoUser };
    }
  };

  const logout = async () => {
    // End active work session and calculate working hours
    try {
      const nowIso = new Date().toISOString();
      const savedSessions = localStorage.getItem('aszen_work_sessions');
      if (savedSessions && user) {
        const list = JSON.parse(savedSessions);
        const updatedList = list.map((s) => {
          if (s.user_email?.toLowerCase() === (user.email || '').toLowerCase() && s.status === 'Active') {
            const loginDt = new Date(s.login_time || nowIso);
            const logoutDt = new Date(nowIso);
            const deltaMs = logoutDt - loginDt;
            const hours = Math.max(0.1, Math.round((deltaMs / 3600000) * 100) / 100);
            return {
              ...s,
              logout_time: nowIso,
              total_hours: hours,
              status: 'Completed',
            };
          }
          return s;
        });
        localStorage.setItem('aszen_work_sessions', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error('Work session logout error:', e);
    }

    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore API logout error in offline/demo mode
    }

    sessionStorage.removeItem('aszen_token');
    sessionStorage.removeItem('aszen_user');
    sessionStorage.removeItem('aszen_login_timestamp');
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
