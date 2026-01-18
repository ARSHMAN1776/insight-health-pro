import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { showErrorToast, showSuccessToast } from '@/lib/errorUtils';

interface OptimisticMutationOptions<TData, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: readonly unknown[];
  optimisticUpdate?: (
    variables: TVariables,
    previousData: TContext | undefined
  ) => TContext;
  rollback?: (context: TContext | undefined) => void;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * A wrapper around useMutation that provides optimistic updates,
 * automatic cache invalidation, and standardized error handling.
 */
export function useOptimisticMutation<TData, TVariables, TContext = unknown>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  rollback,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TContext>(queryKey);

      // Optimistically update cache
      if (optimisticUpdate) {
        setIsOptimistic(true);
        const newData = optimisticUpdate(variables, previousData);
        queryClient.setQueryData(queryKey, newData);
      }

      return previousData;
    },
    onSuccess: (data, variables) => {
      setIsOptimistic(false);
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey });

      if (successMessage) {
        showSuccessToast(successMessage);
      }

      onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      setIsOptimistic(false);

      // Rollback optimistic update
      if (context !== undefined) {
        if (rollback) {
          rollback(context);
        } else {
          queryClient.setQueryData(queryKey, context);
        }
      }

      showErrorToast(error, errorMessage);
      onError?.(error instanceof Error ? error : new Error(String(error)), variables);
    },
    onSettled: () => {
      setIsOptimistic(false);
    },
  });

  return {
    ...mutation,
    isOptimistic,
  };
}

/**
 * Simple mutation with standardized error/success handling
 */
export function useSimpleMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    invalidateKeys?: readonly unknown[][];
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidate related queries
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (options?.successMessage) {
        showSuccessToast(options.successMessage);
      }

      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showErrorToast(error, options?.errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(String(error)));
    },
  });
}
