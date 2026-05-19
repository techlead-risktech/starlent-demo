import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getCurrentUser, loginUser, logoutUser as logoutUtil } from '../utils/auth.js';
import { users } from '../data/mockUsers.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setUser(getCurrentUser()); setLoading(false); }, []);

  const login = useCallback((email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Email hoặc mật khẩu không đúng.' };
    const safe = loginUser(found);
    setUser(safe);
    return { success: true, user: safe };
  }, []);

  const logout = useCallback(() => { logoutUtil(); setUser(null); }, []);

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
