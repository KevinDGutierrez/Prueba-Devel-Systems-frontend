import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext(null);
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  const logout = useCallback(async () => {
    try {
      await ApiService.logout();
    } catch {}
    setUser(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!user) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [user, logout]);

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach(ev => window.addEventListener(ev, handleActivity));
    resetInactivityTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, resetInactivityTimer]);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await ApiService.getMe();
        setUser(res.usuario);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const login = async (usuario, password) => {
    const res = await ApiService.login(usuario, password);
    if (res.success) {
      const userRes = await ApiService.getMe();
      setUser(userRes.usuario);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isSuperAdmin: user?.rol === 'Super Admin',
      isAdmin: user?.rol === 'Super Admin' || user?.rol === 'Admin',
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
