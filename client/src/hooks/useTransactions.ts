import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api';
import {type Transaction } from '../types';

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.api.transactions.$get();
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result.data as Transaction[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTransaction = async (payload: Omit<Transaction, 'id'>) => {
    try {
      const response = await apiClient.api.transactions.$post({
        json: {
          ...payload,
          status: payload.status as 'Cleared' | 'Pending'
        }
      });
      
      if (!response.ok) {
        throw new Error('Validation failed on server');
      }
      
      const result = await response.json();
      // Ensure the newly returned DB record is prepended to the UI list
      setData(prev => [result.data as Transaction, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await apiClient.api.transactions[':id'].$delete({
        param: { id }
      });
      
      if (!response.ok) throw new Error('Failed to delete on server');
      
      setData(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      return false;
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction
  };
}