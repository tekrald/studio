
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  email: string;
  uid: string;
  displayName?: string; // Nome da União
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string;
  isWalletConnected?: boolean;
  connectedWalletAddress?: string | null;
  holdingType?: 'physical' | ''; // Apenas 'physical' ou '' (não definido)
  cnpjHolding?: string;
}

interface UpdateProfileData {
  displayName?: string;
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string;
  holdingType?: 'physical' | '';
  cnpjHolding?: string;
  // isWalletConnected e connectedWalletAddress podem ser atualizados por outros fluxos, não diretamente pelo perfil
}

interface AuthContextType {
  user: User | null;
  login: (email: string, displayName?: string) => void; // displayName é o nome da união
  signup: (
    email: string,
    displayName: string, // Nome da União
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ipeActaUser'); // Nome do item no localStorage
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('ipeActaUser');
    }
    setLoading(false);
  }, []);

  const handleAuthChange = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('ipeActaUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('ipeActaUser');
    }
  }, []);

  const login = useCallback((email: string, displayName?: string) => {
    let existingUser: Partial<User> = {};
    try {
      const storedUser = localStorage.getItem('ipeActaUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.email === email) {
            existingUser = parsedUser;
        }
      }
    } catch (error) {
      // ignore
    }

    const mockUser: User = {
      ...existingUser,
      email,
      uid: `mock-${email}`,
      displayName: displayName || existingUser.displayName || email.split('@')[0], // Usa o nome da união fornecido ou existente
      relationshipStructure: existingUser.relationshipStructure || '',
      religion: existingUser.religion || '',
      isWalletConnected: existingUser.isWalletConnected || false,
      connectedWalletAddress: existingUser.connectedWalletAddress || null,
      holdingType: existingUser.holdingType || '', // Padrão '' se não houver
      cnpjHolding: existingUser.cnpjHolding || '',
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((
    email: string,
    displayName: string, // Nome da União
    relationshipStructureParam?: 'monogamous' | 'polygamous' | '',
    religionParam?: string,
    isWalletConnectedParam?: boolean,
    connectedWalletAddressParam?: string | null,
  ) => {
    const mockUser: User = {
      email,
      uid: `mock-${email}-signup`,
      displayName,
      relationshipStructure: relationshipStructureParam || '',
      religion: religionParam || '',
      isWalletConnected: isWalletConnectedParam || false,
      connectedWalletAddress: connectedWalletAddressParam || null,
      holdingType: '', // Padrão para novo cadastro
      cnpjHolding: '',
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const logout = useCallback(() => {
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


  useEffect(() => {
    if (loading) {
      return;
    }

    const isAuthRoute = pathname === '/login' || pathname === '/signup';
    const isPublicRoute = pathname === '/';

    if (!user) {
      if (!isAuthRoute && !isPublicRoute) {
        router.push('/login');
      }
    } else {
      if (isAuthRoute) {
        router.push('/dashboard');
      }
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
