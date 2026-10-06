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
    // Clear legacy localStorage user session keys so tabs do not bleed sessions across tabs
    localStorage.removeItem('aszen_user');
    localStorage.removeItem('aszen_token');

    // Strict tab-level isolation: check sessionStorage only
    const savedUser = sessionStorage.getItem('aszen_user');
    const token = sessionStorage.getItem('aszen_token');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        sessionStorage.removeItem('aszen_user');
        sessionStorage.removeItem('aszen_token');
      }
      setLoading(false);
    } else if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          const userData = res.data.user;
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

    if (!fullEmail.includes('@')) {
      const cleanName = fullEmail.replace(/\.$/, '');
      fullEmail = `${cleanName}.aszen@gmail.com`;
    }

    try {
      const res = await api.post('/auth/login', { email: fullEmail, password });
      const userData = res.data.user;
      sessionStorage.setItem('aszen_token', res.data.token);
      sessionStorage.setItem('aszen_user', JSON.stringify(userData));
      localStorage.removeItem('aszen_token');
      localStorage.removeItem('aszen_user');
      
      // Store session login timestamp for active shift (use existing ongoing shift time if reconnected)
      const nowIso = new Date().toISOString();
      const backendSession = res.data.work_session;
      let shiftLoginTime = backendSession?.login_time || nowIso;
      if (shiftLoginTime && !shiftLoginTime.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(shiftLoginTime)) {
        shiftLoginTime = shiftLoginTime.replace(' ', 'T') + 'Z';
      }
      sessionStorage.setItem('aszen_login_timestamp', shiftLoginTime);

      // Initialize or sync work session log in localStorage if not master Admin or Admin role
      if (!['arun@aszen.com', 'gokul@aszen.com'].includes(fullEmail.toLowerCase()) && userData.role !== 'admin') {
        try {
          const savedSessions = localStorage.getItem('aszen_work_sessions');
          const list = savedSessions ? JSON.parse(savedSessions) : [];
          const todayStr = new Date().toLocaleDateString('en-CA');
          const shiftDate = backendSession?.date || todayStr;
          
          const existingIndex = list.findIndex(
            (s) => s.user_email?.toLowerCase() === fullEmail.toLowerCase() && s.status === 'Active'
          );

          if (existingIndex >= 0) {
            list[existingIndex] = {
              ...list[existingIndex],
              login_time: shiftLoginTime,
              date: shiftDate,
              status: 'Active',
            };
            localStorage.setItem('aszen_work_sessions', JSON.stringify(list));
          } else {
            const newSession = {
              id: backendSession?.id ? `ws-${backendSession.id}` : `ws-${Date.now().toString().slice(-4)}`,
              user_name: userData.name,
              user_email: fullEmail,
              user_role: userData.role,
              user_designation: userData.designation || 'Editor',
              date: shiftDate,
              login_time: shiftLoginTime,
              logout_time: null,
              total_hours: 0,
              status: 'Active',
              notes: res.data.is_reconnected ? 'Shift reconnected' : 'Shift started',
            };
            localStorage.setItem('aszen_work_sessions', JSON.stringify([newSession, ...list]));
          }
        } catch (e) {
          console.error('Work session init error:', e);
        }
      }


      setUser(userData);
      closeLogin();
      return res.data;
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        throw new Error('Server connection timed out. The cloud server is likely waking up from sleep—please wait 20 seconds and try again.');
      }
      throw new Error('Unable to connect to the authentication service. Please verify your internet connection or try again shortly.');
    }
  };



  const logout = async () => {
    // 1. Capture token before clearing session
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');

    // 2. End active work session and calculate working hours locally
    try {
      const nowIso = new Date().toISOString();
      const savedSessions = localStorage.getItem('aszen_work_sessions');
      if (savedSessions && user && user.role !== 'admin' && !['arun@aszen.com', 'gokul@aszen.com'].includes(user.email?.toLowerCase())) {
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

    // 3. Instant UI & Session invalidation (Zero delay - user is immediately logged out)
    sessionStorage.removeItem('aszen_token');
    sessionStorage.removeItem('aszen_user');
    sessionStorage.removeItem('aszen_login_timestamp');
    localStorage.removeItem('aszen_token');
    localStorage.removeItem('aszen_user');
    setUser(null);

    // 4. Background shift termination to backend via fetch keepalive (non-blocking)
    if (token) {
      try {
        const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
        const baseURL = rawApiUrl.endsWith('/api')
          ? rawApiUrl
          : rawApiUrl.startsWith('http')
            ? `${rawApiUrl.replace(/\/$/, '')}/api`
            : rawApiUrl;

        fetch(`${baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          keepalive: true,
        }).catch(() => {});
      } catch (err) {
        // Fallback fast timeout
        api.post('/auth/logout', {}, { timeout: 2000 }).catch(() => {});
      }
    }
  };


  const forgotPassword = async (email) => {
    let fullEmail = (email || '').trim();
    if (!fullEmail.includes('@')) {
      fullEmail = `${fullEmail.replace(/\.$/, '')}.aszen@gmail.com`;
    }
    const res = await api.post('/auth/forgot-password', { email: fullEmail });
    return res.data;
  };

  const changePassword = async (oldPassword, newPassword) => {
    const res = await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  };

  const adminResetPassword = async (userId, newPassword) => {
    const res = await api.post(`/auth/users/${userId}/reset-password`, {
      password: newPassword,
    });
    return res.data;
  };

  const registerEmployee = async (regData) => {
    let fullEmail = (regData.email || '').trim();
    if (!fullEmail) throw new Error('Please enter an email or username.');
    if (!fullEmail.includes('@')) {
      const cleanName = fullEmail.replace(/\.$/, '');
      fullEmail = `${cleanName}.aszen@gmail.com`;
    }
    const res = await api.post('/auth/register', {
      name: regData.name,
      email: fullEmail,
      password: regData.password,
      designation: regData.designation || 'Editor',
    });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerEmployee,
        logout,
        forgotPassword,
        changePassword,
        adminResetPassword,
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
