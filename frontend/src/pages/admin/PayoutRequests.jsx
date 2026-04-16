import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowUpRight,
  User,
  Wallet,
  AlertCircle
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';

const PayoutRequests = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPayoutRequests();
  }, []);

  const fetchPayoutRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/payouts', config);
      if (res.data.success) {
        setPayouts(res.data.payouts);
      }
    } catch (err) {
      console.error("Error fetching payout requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPayout = async (transactionId, status) => {
    const action = status === 'completed' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this payout request?`)) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`/api/admin/payouts/${transactionId}/review`, { status }, config);
      
      if (res.data.success) {
        alert(`Payout request ${status === 'completed' ? 'approved' : 'rejected'} successfully`);
        fetchPayoutRequests();
      }
    } catch (err) {
      console.error("Payout review error:", err);
      alert(err.response?.data?.message || "Failed to process payout request");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminHeader />
      
      <main className="max-w-[1440px] mx-auto px-10 py-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[32px] font-black text-slate-800 tracking-tighter mb-1 uppercase">Payout Queue</h1>
            <p className="text-slate-500 font-medium tracking-tight">Review and process educator withdrawal requests.</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
               <Wallet size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending Requests</p>
               <p className="text-xl font-black text-slate-800 leading-none">{payouts.length}</p>
            </div>
          </div>
        </div>

        {/* Payout Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-6 text-center">Protocol ID</th>
                    <th className="px-8 py-6">Educator</th>
                    <th className="px-8 py-6">Request Date</th>
                    <th className="px-8 py-6">Withdrawal Amount</th>
                    <th className="px-8 py-6">Wallet Balance</th>
                    <th className="px-8 py-6 text-right">Settlement</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                    <tr>
                      <td colSpan="6" className="p-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <Loader2 className="animate-spin text-blue-600" size={32} />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Ledger...</p>
                        </div>
                      </td>
                    </tr>
                 ) : payouts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                              <CheckCircle2 size={32} className="text-slate-300" />
                           </div>
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Payout Queue is Empty</p>
                        </div>
                      </td>
                    </tr>
                 ) : (
                    payouts.map((payout) => (
                       <tr key={payout._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 text-center">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">#{payout._id.slice(-6)}</span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                                   <img 
                                    src={payout.educatorId?.profilePicture || `https://ui-avatars.com/api/?name=${payout.educatorId?.name}&background=EFF6FF&color=2563EB`} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                   />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{payout.educatorId?.name}</p>
                                   <p className="text-[11px] text-slate-400 font-medium">{payout.educatorId?.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={14} className="text-slate-300" />
                                <span className="text-xs font-bold">{new Date(payout.createdAt).toLocaleDateString()}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-1.5 text-blue-600">
                                <IndianRupee size={14} />
                                <span className="text-lg font-black tracking-tight">{payout.amount.toLocaleString()}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-1.5 text-slate-400">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none mr-1">Current</span>
                                <IndianRupee size={12} />
                                <span className="text-sm font-bold tracking-tight">{payout.educatorId?.walletBalance?.toLocaleString() || 0}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <button 
                                   onClick={() => handleReviewPayout(payout._id, 'failed')}
                                   disabled={isProcessing}
                                   className="p-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 disabled:opacity-50"
                                   title="Reject Payout"
                                >
                                   <XCircle size={20} />
                                </button>
                                <button 
                                   onClick={() => handleReviewPayout(payout._id, 'completed')}
                                   disabled={isProcessing}
                                   className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50"
                                >
                                   {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                   Approve Release
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-6 bg-slate-900 rounded-[28px] flex items-center gap-4 border border-slate-800 shadow-2xl shadow-slate-900/20">
           <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <AlertCircle size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-0.5">Global Settlement Protocol</p>
              <p className="text-sm font-medium text-slate-400 tracking-tight">
                 Approving a release will mark the bank transfer as "Completed". If rejected, funds will be instantly returned to the educator's wallet repository.
              </p>
           </div>
        </div>

      </main>
    </div>
  );
};

export default PayoutRequests;
