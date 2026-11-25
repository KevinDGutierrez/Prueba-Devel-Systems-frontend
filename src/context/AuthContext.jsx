import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext(null);
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!token) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [token, logout]);

  useEffect(() => {
    if (!token) {
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
  }, [token, resetInactivityTimer]);

  useEffect(() => {
    async function fetchMe() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await ApiService.getMe();
        setUser(res.usuario);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await ApiService.login(email, password);
    if (res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      const userRes = await ApiService.getMe();
      setUser(userRes.usuario);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{
      token,
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
