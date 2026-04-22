import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { IndianRupee, Wallet, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const EducatorEarnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [educatorName, setEducatorName] = useState('Educator');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/educator/earnings', config);
        setData(res.data);

        // Fetch user profile for name
        const profileRes = await axios.get('/api/auth/profile', config);
        setEducatorName(profileRes.data.name);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [navigate]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount to withdraw.');
      return;
    }
    
    if (amount > (data?.stats?.walletBalance || 0)) {
      toast.error('Insufficient wallet balance.');
      return;
    }
    
    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.post('/api/educator/earnings/withdraw', { amount }, config);
      
      if (res.data.success) {
        toast.success(res.data.message || 'Payout requested successfully');
        setWithdrawAmount('');
        // Refresh earnings data to show the new pending transaction and updated balance
        const updatedRes = await axios.get('/api/educator/earnings', config);
        setData(updatedRes.data);
      }
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
      toast.error(error.response?.data?.message || 'Failed to request payout. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-16 px-6 py-10 w-full max-w-[1400px] mx-auto">
        <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl mb-4"></div>
        <div className="h-5 w-96 bg-slate-200 animate-pulse rounded-lg mb-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
        </div>
        
        <div className="h-[400px] bg-slate-200 animate-pulse rounded-[24px] mb-12"></div>
        
        <div className="h-[400px] bg-slate-200 animate-pulse rounded-[24px]"></div>
      </div>
    );
  }

  const { stats, transactions, chartData } = data || {
    stats: { walletBalance: 0, totalEarnings: 0, totalSales: 0 },
    transactions: [],
    chartData: []
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans mb-16">
      <EducatorHeader educatorName={educatorName} activePage="/educator/earnings" />
      <motion.main 
        className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <h1 className="text-[36px] font-bold text-slate-900 mb-2 tracking-tight">
            Earnings Dashboard
          </h1>
          <p className="text-[16px] text-slate-500 font-medium">
            Track your revenue, sales history, and account balance.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Available Balance */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-slate-500">Available Balance</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Wallet size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 flex items-center">
              <IndianRupee size={28} className="mr-1" />
              {stats.walletBalance.toLocaleString('en-IN')}
            </h3>
          </motion.div>

          {/* Card 2: Total Earned */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-slate-500">Total Earned</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 flex items-center">
              <IndianRupee size={28} className="mr-1" />
              {stats.totalEarnings.toLocaleString('en-IN')}
            </h3>
          </motion.div>

          {/* Card 3: Total Sales */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-slate-500">Total Sales</p>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <br />
                <Calendar size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">
              {stats.totalSales}
            </h3>
          </motion.div>
        </div>

        {/* Payout Request Section */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
            <svg width="100%" height="100%"><pattern id="pattern-payout" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor"/></pattern><rect width="100%" height="100%" fill="url(#pattern-payout)"/></svg>
          </div>
          <div className="relative z-10 flex-1">
            <h2 className="text-[19px] font-bold text-slate-900 mb-1 flex items-center">
              Request a Payout <ArrowUpRight size={20} className="ml-1 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </h2>
            <p className="text-[14px] text-slate-500 font-medium">Withdraw funds directly to your linked bank account.</p>
          </div>
          <form onSubmit={handleWithdraw} className="relative z-10 flex w-full md:w-auto gap-3 items-center">
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee size={16} className="text-slate-400" />
              </div>
              <input 
                type="number" 
                min="1"
                step="1"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-medium"
                disabled={isWithdrawing}
              />
            </div>
            <button 
              type="submit" 
              disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md hover:shadow-lg active:scale-95"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
            </button>
          </form>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[19px] font-bold text-slate-900">Earnings Overview</h2>
          </div>
          <div className="h-[350px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value}`, 'Earnings']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No earnings data for the selected period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-slate-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-8 py-4">Date</th>
                  <th scope="col" className="px-8 py-4">Transaction / Course</th>
                  <th scope="col" className="px-8 py-4">Type</th>
                  <th scope="col" className="px-8 py-4">Status</th>
                  <th scope="col" className="px-8 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap text-slate-600 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-8 py-5 text-slate-800 font-medium">
                        {tx.description || 'Earnings'}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                          tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-slate-900 whitespace-nowrap">
                        <span className={tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center">
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </motion.main>
    </div>
  );
};

export default EducatorEarnings;
