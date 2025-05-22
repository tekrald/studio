
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
  // Campos da União
  relationshipStructure?: 'monogamous' | 'polygamous' | 'other' | '';
  religion?: string;
}

interface UpdateProfileData {
  displayName?: string;
  holdingType?: 'digital' | 'physical' | '';
  relationshipStructure?: 'monogamous' | 'polygamous' | 'other' | '';
  religion?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void; 
  signup: (
    email: string, 
    name: string, 
    holdingTypeParam?: 'digital' | 'physical' | '',
    relationshipStructureParam?: 'monogamous' | 'polygamous' | 'other' | '',
    religionParam?: string
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
    if (newUser) {
      localStorage.setItem('domedomeMockUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('domedomeMockUser');
    }
  }, []);
  
  const login = useCallback((email: string, name?: string) => {
    // Try to load existing user data to preserve holding/union details if they re-login
    let existingUser: Partial<User> = {};
    try {
      const storedUser = localStorage.getItem('domedomeMockUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.email === email) { // only load if it's the same email
            existingUser = parsedUser;
        }
      }
    } catch (error) {
        // ignore
    }

    const mockUser: User = { 
      ...existingUser, // spread existing data first
      email, 
      uid: `mock-${email}`, 
      displayName: name || existingUser.displayName || email.split('@')[0],
      holdingType: existingUser.holdingType || '', 
      relationshipStructure: existingUser.relationshipStructure || '',
      religion: existingUser.religion || '',
    };
    handleAuthChange(mockUser);
    router.push('/dashboard');
  }, [handleAuthChange, router]);

  const signup = useCallback((
    email: string, 
    name: string, 
    holdingTypeParam?: 'digital' | 'physical' | '',
    relationshipStructureParam?: 'monogamous' | 'polygamous' | 'other' | '',
    religionParam?: string
  ) => {
    const mockUser: User = { 
      email, 
      uid: `mock-${email}-signup`, 
      displayName: name,
      holdingType: holdingTypeParam || '',
      relationshipStructure: relationshipStructureParam || '',
      religion: religionParam || '',
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
