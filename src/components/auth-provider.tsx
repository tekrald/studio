
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock User type, can be expanded or replaced with actual Firebase User type
interface User {
  email: string;
  uid: string;
  displayName?: string;
  holdingType?: 'physical' | ''; // 'digital' removido
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string;
  isWalletConnected?: boolean;
  connectedWalletAddress?: string | null;
  cnpjHolding?: string; // Novo campo para CNPJ
}

interface UpdateProfileData {
  displayName?: string;
  holdingType?: 'physical' | '';
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string;
  isWalletConnected?: boolean;
  connectedWalletAddress?: string | null;
  cnpjHolding?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  signup: (
    email: string,
    name: string,
    relationshipStructureParam?: 'monogamous' | 'polygamous' | '',
    religionParam?: string,
    isWalletConnectedParam?: boolean,
    connectedWalletAddressParam?: string | null,
  ) => void;
  logout: () => void;
  loading: boolean;
  updateProfile: (data: UpdateProfileData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Alterado para false para desabilitar redirecionamentos
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Lógica de carregamento do localStorage comentada para desabilitar auth
    // try {
    //   const storedUser = localStorage.getItem('domedomeMockUser');
    //   if (storedUser) {
    //     setUser(JSON.parse(storedUser) as User);
    //   }
    // } catch (error) {
    //   console.error("Failed to parse user from localStorage", error);
    //   localStorage.removeItem('domedomeMockUser');
    // }
    // setLoading(false);
  }, []);

  const handleAuthChange = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('domedomeMockUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('domedomeMockUser');
    }
  }, []);

  const login = useCallback((email: string, name?: string) => {
    console.log("Login attempt (auth disabled):", email);
    // Simulação de login sem definir usuário para evitar redirecionamentos
    // let existingUser: Partial<User> = {};
    // try {
    //   const storedUser = localStorage.getItem('domedomeMockUser');
    //   if (storedUser) {
    //     const parsedUser = JSON.parse(storedUser) as User;
    //     if (parsedUser.email === email) {
    //         existingUser = parsedUser;
    //     }
    //   }
    // } catch (error) {
    //   // ignore
    // }

    const mockUser: User = {
    //   ...existingUser,
      email,
      uid: `mock-${email}`,
      displayName: name || email.split('@')[0],
      holdingType: '', // Padrão para não definido
      relationshipStructure: '',
      religion: '',
      isWalletConnected: false,
      connectedWalletAddress: null,
      cnpjHolding: '',
    };
    handleAuthChange(mockUser); // Ainda salva para persistir dados para o perfil
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((
    email: string,
    name: string,
    relationshipStructureParam?: 'monogamous' | 'polygamous' | '',
    religionParam?: string,
    isWalletConnectedParam?: boolean,
    connectedWalletAddressParam?: string | null,
  ) => {
    console.log("Signup attempt (auth disabled):", email);
    const mockUser: User = {
      email,
      uid: `mock-${email}-signup`,
      displayName: name,
      holdingType: '', // Padrão para não definido
      relationshipStructure: relationshipStructureParam || '',
      religion: religionParam || '',
      isWalletConnected: isWalletConnectedParam || false,
      connectedWalletAddress: connectedWalletAddressParam || null,
      cnpjHolding: '',
    };
    handleAuthChange(mockUser); // Ainda salva para persistir dados para o perfil
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const logout = useCallback(() => {
    console.log("Logout (auth disabled)");
    handleAuthChange(null);
    router.push('/'); 
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


  // useEffect(() => { // Lógica de proteção de rotas comentada
    // if (loading) {
    //   return; 
    // }

    // const isAuthRoute = pathname === '/login' || pathname === '/signup';
    // const isPublicRoute = pathname === '/'; 

    // if (!user) { 
    //   if (!isAuthRoute && !isPublicRoute) {
    //     router.push('/login'); 
    //   }
    // } else { 
    //   if (isAuthRoute) {
    //     router.push('/dashboard'); 
    //   }
    // }
  // }, [user, loading, pathname, router]);


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
    

    