
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
  // Campos da empresa (se holding física) - estes não são mais coletados nos formulários principais
  // companyType?: string;
  // jurisdiction?: string;
  // notesForAccountant?: string;
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
    // This effect runs once on mount to check for a stored user
    try {
      const storedUser = localStorage.getItem('domedomeMockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('domedomeMockUser'); // Clear corrupted data
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
        // ignore error during load attempt
    }

    const mockUser: User = {
      ...existingUser, // spread existing data first
      email,
      uid: `mock-${email}`,
      displayName: name || existingUser.displayName || email.split('@')[0],
      // Ensure all fields from User interface are initialized if not present in existingUser
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
    router.push('/'); // Explicitly redirect to the landing page
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
    // Route protection logic
    if (loading) {
      return; // Don't do anything while loading initial user state
    }

    const isAuthRoute = pathname === '/login' || pathname === '/signup';
    const isPublicRoute = pathname === '/'; // Landing page is public

    if (!user) { // If the user is not logged in
      if (!isAuthRoute && !isPublicRoute) {
        // And they are trying to access a protected page (not login, signup, or landing)
        router.push('/login'); // Redirect to login
      }
      // If they are on an auth route or the public landing page, do nothing (allow access)
    } else { // If the user is logged in
      if (isAuthRoute) {
        // And they are on a login/signup page
        router.push('/dashboard'); // Redirect to dashboard
      }
      // If they are on any other page (including landing or protected routes), do nothing (allow access)
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
