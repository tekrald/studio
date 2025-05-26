
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ContractClause } from '@/components/contract/ContractSettingsDialog'; // Import ContractClause

// Interface para o usuário, agora incluindo os novos campos
interface User {
  email: string;
  uid: string;
  displayName?: string; // Nome da União
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string;
  isWalletConnected?: boolean;
  connectedWalletAddress?: string | null;
  holdingType?: 'physical' | '';
  cnpjHolding?: string;
  contractClauses?: ContractClause[]; // Novo campo para cláusulas
}

// Interface para dados de atualização de perfil, agora incluindo religião e cláusulas
interface UpdateProfileData {
  displayName?: string;
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string; // Adicionado
  holdingType?: 'physical' | '';
  cnpjHolding?: string;
  contractClauses?: ContractClause[]; // Novo campo para cláusulas
}

interface AuthContextType {
  user: User | null;
  login: (email: string, displayName?: string) => void;
  signup: (
    email: string,
    displayName: string,
    relationshipStructureParam?: 'monogamous' | 'polygamous' | '',
    religionParam?: string,
    isWalletConnectedParam?: boolean,
    connectedWalletAddressParam?: string | null,
    // holdingTypeParam?: 'digital' | 'physical' | '', // Removido, não mais do cadastro
    contractClausesParam?: ContractClause[], // Novo parâmetro
  ) => void;
  logout: () => void;
  loading: boolean;
  updateProfile: (data: UpdateProfileData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Mantido true para lógica de carregamento inicial
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Lógica para carregar usuário do localStorage (MOCK)
    try {
      const storedUser = localStorage.getItem('ipeActaUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('ipeActaUser');
    }
    setLoading(false); // Define loading como false após tentar carregar
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
      email,
      uid: `mock-uid-${email}-${Date.now()}`,
      displayName: displayName || existingUser.displayName || email.split('@')[0],
      relationshipStructure: existingUser.relationshipStructure || '',
      religion: existingUser.religion || '',
      isWalletConnected: existingUser.isWalletConnected || false,
      connectedWalletAddress: existingUser.connectedWalletAddress || null,
      holdingType: existingUser.holdingType || '',
      cnpjHolding: existingUser.cnpjHolding || '',
      contractClauses: existingUser.contractClauses || [], // Inicializa cláusulas
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((
    email: string,
    displayName: string,
    relationshipStructureParam?: 'monogamous' | 'polygamous' | '',
    religionParam?: string,
    isWalletConnectedParam?: boolean,
    connectedWalletAddressParam?: string | null,
    // holdingTypeParam?: 'digital' | 'physical' | '', // Removido
    contractClausesParam?: ContractClause[], // Novo parâmetro
  ) => {
    const mockUser: User = {
      email,
      uid: `mock-uid-${email}-signup-${Date.now()}`,
      displayName,
      relationshipStructure: relationshipStructureParam || '',
      religion: religionParam || '',
      isWalletConnected: isWalletConnectedParam || false,
      connectedWalletAddress: connectedWalletAddressParam || null,
      holdingType: '', // Padrão para novo cadastro
      cnpjHolding: '',
      contractClauses: contractClausesParam || [], // Armazena cláusulas
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
      const updatedUser: User = {
        ...user,
        ...data,
      };
      handleAuthChange(updatedUser);
    }
  }, [user, handleAuthChange]);


  useEffect(() => {
    // Esta lógica de proteção de rota agora está desabilitada
    // para permitir navegação livre e focar em outras partes.
    // Se precisar reativar, descomente as linhas abaixo.
    // if (loading) return;
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
