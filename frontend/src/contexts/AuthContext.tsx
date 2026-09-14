import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { authApi } from '../services/auth.service.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('petcare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('petcare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('petcare_token');
      if (storedToken) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('petcare_user', JSON.stringify(freshUser));
        } catch {
          // Token không còn hợp lệ
          localStorage.removeItem('petcare_token');
          localStorage.removeItem('petcare_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const result = await authApi.login(data);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('petcare_token', result.token);
    localStorage.setItem('petcare_user', JSON.stringify(result.user));
    return result.user;
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const result = await authApi.register(data);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('petcare_token', result.token);
    localStorage.setItem('petcare_user', JSON.stringify(result.user));
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem('petcare_token');
    localStorage.removeItem('petcare_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedUser };
      localStorage.setItem('petcare_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
