
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ContractClause } from '@/components/contract/ContractSettingsDialog';

// Define Partner interface
export interface Partner {
  name: string;
  photo?: File | null; // Store File object for now, actual upload is separate
}

interface User {
  email: string;
  uid: string;
  displayName?: string; // Union Name
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string | undefined;
  partners?: Partner[]; // Array of partners
  isWalletConnected?: boolean;
  connectedWalletAddress?: string | null;
  holdingType?: 'physical' | '';
  cnpjHolding?: string;
  contractClauses?: ContractClause[];
}

interface UpdateProfileData {
  displayName?: string;
  relationshipStructure?: 'monogamous' | 'polygamous' | '';
  religion?: string | undefined;
  partners?: Partner[];
  holdingType?: 'physical' | '';
  cnpjHolding?: string;
  contractClauses?: ContractClause[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, displayName?: string) => void;
  signup: (
    email: string,
    displayName: string,
    relationshipStructureParam?: 'monogamous' | 'polygamous' | '',
    religionParam?: string | undefined,
    partnersParam?: Partner[],
    isWalletConnectedParam?: boolean,
    connectedWalletAddressParam?: string | null,
    contractClausesParam?: ContractClause[],
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
      const storedUser = localStorage.getItem('ipeActaUser');
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
      // Note: Storing File objects in localStorage won't work directly.
      // For this mock, we'll store partner names, and photo names if File exists.
      // A real implementation would upload photos and store URLs.
      const storableUser = {
        ...newUser,
        partners: newUser.partners?.map(p => ({
          name: p.name,
          photoName: p.photo?.name // Storing only photo name for mock
        }))
      };
      localStorage.setItem('ipeActaUser', JSON.stringify(storableUser));
    } else {
      localStorage.removeItem('ipeActaUser');
    }
  }, []);

  const login = useCallback((email: string, displayName?: string) => {
    let existingUser: Partial<User> = {};
    try {
      const storedUserJson = localStorage.getItem('ipeActaUser');
      if (storedUserJson) {
        const parsedUser = JSON.parse(storedUserJson); // We won't try to revive File objects here
        if (parsedUser.email === email) {
          existingUser = {
            ...parsedUser,
            partners: parsedUser.partners?.map((p: any) => ({ name: p.name, photo: null })) // Photo not revived
          };
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
      religion: existingUser.religion || undefined,
      partners: existingUser.partners || [{ name: 'Partner 1', photo: null }, { name: 'Partner 2', photo: null }],
      isWalletConnected: existingUser.isWalletConnected || false,
      connectedWalletAddress: existingUser.connectedWalletAddress || null,
      holdingType: existingUser.holdingType || '',
      cnpjHolding: existingUser.cnpjHolding || '',
      contractClauses: existingUser.contractClauses || [],
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((
    email: string,
    displayName: string,
    relationshipStructureParam?: 'monogamous' | 'polygamous' | '',
    religionParam?: string | undefined,
    partnersParam?: Partner[],
    isWalletConnectedParam?: boolean,
    connectedWalletAddressParam?: string | null,
    contractClausesParam?: ContractClause[],
  ) => {
    const mockUser: User = {
      email,
      uid: `mock-uid-${email}-signup-${Date.now()}`,
      displayName,
      relationshipStructure: relationshipStructureParam || '',
      religion: religionParam || undefined,
      partners: partnersParam || [{ name: 'Partner 1', photo: null }, { name: 'Partner 2', photo: null }],
      isWalletConnected: isWalletConnectedParam || false,
      connectedWalletAddress: connectedWalletAddressParam || null,
      holdingType: '',
      cnpjHolding: '',
      contractClauses: contractClausesParam || [],
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
      // When updating partners, we also need to handle photos correctly for localStorage
      let storablePartners;
      if (data.partners) {
        storablePartners = data.partners.map(p => ({
            name: p.name,
            photoName: p.photo?.name, // Store only photo name for mock
            photo: null // Don't store the File object itself
        }));
      }


      const updatedUser: User = {
        ...user,
        ...data,
        partners: data.partners ? data.partners.map(p => ({name: p.name, photo: p.photo})) : user.partners, // Keep File object in memory for current session
      };
      // For localStorage, create a version without File objects in partners.photo
      const userForStorage = {
        ...updatedUser,
        partners: updatedUser.partners?.map(p => ({ name: p.name, photoName: p.photo?.name }))
      };

      setUser(updatedUser); // Update in-memory state with File objects
      localStorage.setItem('ipeActaUser', JSON.stringify(userForStorage)); // Update localStorage without File objects

    }
  }, [user]);


  useEffect(() => {
    // This logic is currently disabled for easier navigation during development.
    // Re-enable if needed for production-like auth flow.
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

// Helper function to get partner names, ensuring at least two placeholders if none exist
export const getPartnerNames = (partners: Partner[] | undefined): [string, string] => {
  const p1Name = partners?.[0]?.name || "Partner 1";
  const p2Name = partners?.[1]?.name || "Partner 2";
  return [p1Name, p2Name];
};
