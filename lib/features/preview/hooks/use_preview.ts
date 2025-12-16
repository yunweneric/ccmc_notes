'use client';

import { useState, useCallback } from 'react';
import type { PreviewState } from '../data/interfaces';

export function usePreview() {
  const [state, setState] = useState<PreviewState>({
    currentPage: 1,
    totalPages: 0,
    isLoading: false,
    loadingProgress: 0,
  });

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setTotalPages = useCallback((pages: number) => {
    setState((prev) => ({ ...prev, totalPages: pages }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setLoadingProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, loadingProgress: progress }));
  }, []);

  return {
    state,
    actions: {
      setCurrentPage,
      setTotalPages,
      setLoading,
      setLoadingProgress,
    },
  };
}

