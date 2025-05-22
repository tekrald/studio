
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock User type, can be expanded or replaced with actual Firebase User type
interface User {
  email: string;
  uid: string;
  displayName?: string;
  // Campos da Holding
  holdingType?: 'digital' | 'physical' | '';
  companyType?: string;
  jurisdiction?: string;
  notesForAccountant?: string;
}

interface UpdateProfileData {
  displayName?: string;
  holdingType?: 'digital' | 'physical' | '';
  companyType?: string;
  jurisdiction?: string;
  notesForAccountant?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void; // name for signup
  signup: (email: string, name: string) => void;
  logout: () => void;
  loading: boolean;
  updateProfile: (data: UpdateProfileData) => void;
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
    const mockUser: User = { 
      email, 
      uid: `mock-${email}`, 
      displayName: name || email.split('@')[0],
      holdingType: '', 
      companyType: '',
      jurisdiction: '',
      notesForAccountant: '',
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((email: string, name: string) => {
    const mockUser: User = { 
      email, 
      uid: `mock-${email}-signup`, 
      displayName: name,
      holdingType: '', 
      companyType: '',
      jurisdiction: '',
      notesForAccountant: '',
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const logout = useCallback(() => {
    handleAuthChange(null);
    router.push('/'); // Garante redirecionamento para a landing page
  }, [handleAuthChange, router]);

  const updateProfile = useCallback((data: UpdateProfileData) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        ...data, 
      };
      handleAuthChange(updatedUser);
    }
  }, [user, handleAuthChange]);


  // Protected routes logic
  useEffect(() => {
    // Permite acesso a '/', '/login', '/signup' mesmo se não estiver logado.
    // Redireciona para '/login' se tentar acessar outras rotas sem estar logado.
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
