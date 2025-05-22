
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
  companyType?: string; // Mantido no tipo, mas não mais editável pelo perfil
  jurisdiction?: string; // Mantido no tipo, mas não mais editável pelo perfil
  notesForAccountant?: string; // Mantido no tipo, mas não mais editável pelo perfil
}

interface UpdateProfileData {
  displayName?: string;
  holdingType?: 'digital' | 'physical' | '';
  // companyType?: string; // Removido dos dados atualizáveis pelo perfil
  // jurisdiction?: string; // Removido dos dados atualizáveis pelo perfil
  // notesForAccountant?: string; // Removido dos dados atualizáveis pelo perfil
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void; 
  signup: (email: string, name: string, holdingType?: 'digital' | 'physical' | '') => void; // Adicionado holdingType
  logout: () => void;
  loading: boolean;
  updateProfile: (data: UpdateProfileData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const MOCK_USER_STORAGE_KEY = 'domedomeMockUser'; // Comentado

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Começa como true para mostrar loading inicial
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { // Reativado para carregar usuário do localStorage
    try {
      const storedUser = localStorage.getItem('domedomeMockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('domedomeMockUser');
    }
    setLoading(false);
  }, []);

  const handleAuthChange = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) { // Reativado para salvar usuário no localStorage
      localStorage.setItem('domedomeMockUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('domedomeMockUser');
    }
  }, []);
  
  const login = useCallback((email: string, name?: string) => {
    const mockUser: User = { 
      email, 
      uid: `mock-${email}`, 
      displayName: name || email.split('@')[0],
      // Inicializa campos da holding (ou carrega se já existirem)
      holdingType: '', 
      companyType: '',
      jurisdiction: '',
      notesForAccountant: '',
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((email: string, name: string, holdingTypeParam?: 'digital' | 'physical' | '') => {
    const mockUser: User = { 
      email, 
      uid: `mock-${email}-signup`, 
      displayName: name,
      holdingType: holdingTypeParam || '', 
      // companyType, jurisdiction, notesForAccountant não são mais passados aqui
      companyType: '',
      jurisdiction: '',
      notesForAccountant: '',
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const logout = useCallback(() => {
    handleAuthChange(null);
    router.push('/'); // Redireciona para a landing page
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


  useEffect(() => { // Reativado para proteção de rotas
    if (loading) {
      return;
    }

    const isAuthRoute = pathname === '/login' || pathname === '/signup';
    const isPublicRoute = pathname === '/'; 

    if (!user && !isAuthRoute && !isPublicRoute) {
      router.push('/login');
    } else if (user && isAuthRoute) {
      router.push('/dashboard');
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

