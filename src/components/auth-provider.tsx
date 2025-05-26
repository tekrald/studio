
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  email: string;
  uid: string;
  displayName?: string; // Nome da Entidade/Registro
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string;
  isWalletConnected?: boolean;
  connectedWalletAddress?: string | null;
  holdingType?: 'physical' | ''; 
  cnpjHolding?: string; 
}

interface UpdateProfileData {
  displayName?: string;
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string;
  isWalletConnected?: boolean;
  connectedWalletAddress?: string | null;
  holdingType?: 'physical' | '';
  cnpjHolding?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  signup: (
    email: string,
    name: string, // Nome da Entidade/Registro
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
      const storedUser = localStorage.getItem('actaIpeUser'); // Alterado nome do item no localStorage
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('actaIpeUser');
    }
    setLoading(false);
  }, []);

  const handleAuthChange = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('actaIpeUser', JSON.stringify(newUser)); // Alterado nome do item
    } else {
      localStorage.removeItem('actaIpeUser');
    }
  }, []);

  const login = useCallback((email: string, name?: string) => {
    let existingUser: Partial<User> = {};
    try {
      const storedUser = localStorage.getItem('actaIpeUser');
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
      displayName: name || existingUser.displayName || email.split('@')[0],
      relationshipStructure: existingUser.relationshipStructure || '',
      religion: existingUser.religion || '',
      isWalletConnected: existingUser.isWalletConnected || false,
      connectedWalletAddress: existingUser.connectedWalletAddress || null,
      holdingType: existingUser.holdingType || '',
      cnpjHolding: existingUser.cnpjHolding || '',
    };
    handleAuthChange(mockUser); 
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
    const mockUser: User = {
      email,
      uid: `mock-${email}-signup`,
      displayName: name,
      relationshipStructure: relationshipStructureParam || '',
      religion: religionParam || '',
      isWalletConnected: isWalletConnectedParam || false,
      connectedWalletAddress: connectedWalletAddressParam || null,
      holdingType: '', 
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
