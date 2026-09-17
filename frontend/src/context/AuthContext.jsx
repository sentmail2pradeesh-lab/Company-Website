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
      const shiftLoginTime = backendSession?.login_time || nowIso;
      sessionStorage.setItem('aszen_login_timestamp', shiftLoginTime);

      // Initialize or sync work session log in localStorage if not master Admin or Admin role
      if (fullEmail.toLowerCase() !== 'arun@aszen.com' && userData.role !== 'admin') {
        try {
          const savedSessions = localStorage.getItem('aszen_work_sessions');
          const list = savedSessions ? JSON.parse(savedSessions) : [];
          const todayStr = nowIso.slice(0, 10);
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
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      // Demo fallback only if server is completely offline
      const rawName = fullEmail.split('.')[0].split('@')[0];
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const isMasterAdmin = fullEmail.toLowerCase().includes('arun');
      
      const demoUser = {
        id: Date.now(),
        email: fullEmail,
        name: displayName,
        role: isMasterAdmin ? 'admin' : 'employee',
        designation: isMasterAdmin ? 'Admin / System Manager' : 'Editor',
      };
      const demoToken = 'demo_token_' + Date.now();
      sessionStorage.setItem('aszen_token', demoToken);
      sessionStorage.setItem('aszen_user', JSON.stringify(demoUser));
      sessionStorage.setItem('aszen_login_timestamp', new Date().toISOString());

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
      if (savedSessions && user && user.role !== 'admin' && user.email?.toLowerCase() !== 'arun@aszen.com') {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
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
