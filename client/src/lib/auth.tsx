import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from './queryClient';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const userData = await apiRequest('GET', '/api/auth/me');
        setUser(userData);
      } catch (error) {
        // User not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userData = await apiRequest('POST', '/api/auth/login', { email, password });
      setUser(userData);
      return {};
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signOut = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
