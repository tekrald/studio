"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock User type, can be expanded or replaced with actual Firebase User type
interface User {
  email: string;
  uid: string;
  displayName?: string; // Added for profile
  // Add other relevant user properties
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void; // name for signup
  signup: (email: string, name: string) => void;
  logout: () => void;
  loading: boolean;
  updateProfile: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER_STORAGE_KEY = 'domedomeMockUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(MOCK_USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const handleAuthChange = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    }
  }, []);
  
  const login = useCallback((email: string, name?: string) => {
    // In a real app, this would call Firebase auth
    // For mock, we check if user exists. If using for signup, name is passed.
    const mockUser: User = { email, uid: `mock-${email}`, displayName: name || email.split('@')[0] };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((email: string, name: string) => {
    // Mock signup, essentially same as login for this mock
    const mockUser: User = { email, uid: `mock-${email}-signup`, displayName: name };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const logout = useCallback(() => {
    handleAuthChange(null);
    router.push('/login');
  }, [handleAuthChange, router]);

  const updateProfile = useCallback((name: string) => {
    if (user) {
      const updatedUser = { ...user, displayName: name };
      handleAuthChange(updatedUser);
    }
  }, [user, handleAuthChange]);


  // Protected routes logic
  useEffect(() => {
    if (!loading && !user && !['/login', '/signup', '/'].includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateProfile }}>
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
