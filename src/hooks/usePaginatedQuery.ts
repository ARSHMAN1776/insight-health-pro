import { useState, useCallback } from 'react';
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
}

export interface UsePaginatedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: (params: { page: number; pageSize: number }) => Promise<PaginatedResult<T>>;
  pageSize?: number;
  enabled?: boolean;
  staleTime?: number;
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  pageSize = 25,
  enabled = true,
  staleTime,
}: UsePaginatedQueryOptions<T>) {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [...queryKey, { page, pageSize }],
    queryFn: () => queryFn({ page, pageSize }),
    enabled,
    staleTime,
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  const pagination: PaginationState = {
    page,
    pageSize,
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / pageSize),
  };

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, pagination.totalPages || 1)));
  }, [pagination.totalPages]);

  const nextPage = useCallback(() => {
    if (query.data?.hasMore) {
      setPage((p) => p + 1);
    }
  }, [query.data?.hasMore]);

  const previousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    ...query,
    data: query.data?.data || [],
    pagination,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
    hasNextPage: query.data?.hasMore || false,
    hasPreviousPage: page > 1,
  };
}

// Helper function to create paginated Supabase queries
export function createPaginatedFetcher<T>(
  fetchFn: (range: { from: number; to: number }) => Promise<{ data: T[] | null; count: number | null; error: any }>
) {
  return async ({ page, pageSize }: { page: number; pageSize: number }): Promise<PaginatedResult<T>> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, count, error } = await fetchFn({ from, to });
    
    if (error) throw error;
    
    const totalCount = count || 0;
    const hasMore = from + pageSize < totalCount;
    
    return {
      data: data || [],
      totalCount,
      hasMore,
    };
  };
}
