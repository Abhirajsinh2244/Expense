import React, { useState, useEffect, useMemo, type JSX } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useTransactions } from './hooks/useTransactions';
import {type TransactionType, CATEGORY_MAP } from './types';

const ACCOUNTS = ['Checking', 'Credit Card', 'Savings'];
const STATUSES = ['Cleared', 'Pending'];

export default function App(): JSX.Element {
  const { data: transactions, isLoading, error, fetchTransactions, addTransaction, deleteTransaction } = useTransactions();
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterAccount, setFilterAccount] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    category: 'Food & Drink',
    description: '',
    amount: '',
    account: 'Checking',
    status: 'Cleared'
  });

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      type: transactionType,
    });

    if (success) {
      setIsModalOpen(false);
      setFormData(prev => ({ ...prev, merchant: '', description: '', amount: '' }));
    }
    setIsSubmitting(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchCat = filterCategory === 'All' || t.category === filterCategory;
      const matchAcc = filterAccount === 'All' || t.account === filterAccount;
      let matchDate = true;
      if (startDate && endDate) {
        matchDate = t.date >= startDate && t.date <= endDate;
      }
      return matchCat && matchAcc && matchDate;
    });
  }, [transactions, filterCategory, filterAccount, startDate, endDate]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number, type: TransactionType) => {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    return type === 'expense' ? `-${formatted}` : `+${formatted}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="min-h-screen bg-blue-50/50 p-6 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Transactions Ledger</h1>
          {error && (
            <div className="flex items-center text-red-600 text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-2 bg-white">
              <Calendar size={18} className="text-gray-400" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="outline-none text-sm w-full bg-transparent"/>
              <span className="text-gray-400">-</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="outline-none text-sm w-full bg-transparent"/>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
            <div className="relative">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full appearance-none border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="All">All</option>
                {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <div className="relative">
              <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="w-full appearance-none border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="All">All</option>
                {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            <div className="flex space-x-3">
              <button onClick={() => { setTransactionType('expense'); setIsModalOpen(true); }} className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={16} /> <span>Add Expense</span>
              </button>
              <button onClick={() => { setTransactionType('income'); setIsModalOpen(true); }} className="flex items-center space-x-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={16} /> <span>Add Income</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                      <Loader2 className="animate-spin mx-auto text-emerald-500 mb-3" size={28} />
                      <p className="font-medium">Syncing with server...</p>
                    </td>
                  </tr>
                ) : currentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                      <p className="font-medium text-lg mb-1">No network data found</p>
                      <p className="text-sm">Adjust your filters or add a new transaction.</p>
                    </td>
                  </tr>
                ) : (
                  currentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">{formatDate(tx.date)}</td>
                      <td className="px-6 py-4 text-gray-700">{tx.merchant}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-2 bg-yellow-50/50 px-2 py-1 rounded-md text-gray-700 border border-yellow-100/50">
                          <span>{CATEGORY_MAP[tx.category] || '📦'}</span>
                          <span>{tx.category}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={tx.description}>{tx.description}</td>
                      <td className={`px-6 py-4 font-medium ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {formatCurrency(tx.amount, tx.type)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{tx.account}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tx.status === 'Cleared' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => deleteTransaction(tx.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-center space-x-2 bg-gray-50/30 text-sm">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 text-gray-600"><ChevronLeft size={18} /></button>
            <span className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-800 font-medium rounded-md shadow-sm">{currentPage}</span>
            <span className="text-gray-500">of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 text-gray-600"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-semibold text-gray-900">Create {transactionType === 'expense' ? 'Expense' : 'Income'}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount ($)</label>
                  <input required type="number" step="0.01" min="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{transactionType === 'expense' ? 'Merchant' : 'Source'}</label>
                <input required type="text" name="merchant" value={formData.merchant} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="e.g., Target, Payroll" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                    {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Account</label>
                  <select name="account" value={formData.account} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                    {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                  {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="Notes..." />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 outline-none transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 outline-none transition-all flex items-center">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2"/> : null}
                  Commit to Server
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}