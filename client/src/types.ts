export type TransactionType = 'expense' | 'income';
export type Status = 'Cleared' | 'Pending';
export type Account = 'Checking' | 'Credit Card' | 'Savings';

export const CATEGORY_MAP: Record<string, string> = {
  'Food & Drink': '🍱',
  'Groceries': '🛒',
  'Transport': '🚗',
  'Entertainment': '📺',
  'Utilities': '💡',
};

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  description?: string;
  amount: number;
  account: string;
  status: string;
  type: TransactionType;
}