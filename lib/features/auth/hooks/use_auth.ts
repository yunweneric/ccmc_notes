'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../data/services';
import { mapFirebaseUser } from '../data/interfaces';
import type { User, LoginCredentials } from '../data/interfaces';
import type { User as FirebaseUser } from 'firebase/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      setUser(mapFirebaseUser(firebaseUser));
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    const result = await authService.login(credentials);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      throw new Error(result.error);
    }
    // User state will be updated by onAuthStateChanged
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await authService.logout();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      throw new Error(result.error);
    }
    // User state will be updated by onAuthStateChanged
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
}

