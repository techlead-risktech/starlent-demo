import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getCurrentUser, logoutUser as logoutUtil } from '../utils/auth.js';
import { login as loginApi, clearSession } from '../api/services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginApi(email, password);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error?.message || 'Đăng nhập thất bại.' };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    logoutUtil();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, role: user?.role || null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

