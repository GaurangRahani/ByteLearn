import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  MoreVertical,
  Filter,
  Activity,
  ArrowRight,
  ShieldOff,
  UserX,
  Mail,
  Calendar,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/admin/users?role=${roleFilter}&search=${searchTerm}`, config);
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId, currentName) => {
    const confirmToggle = window.confirm(`Are you sure you want to change the account status for ${currentName}? This will instantly restrict or restore their platform access.`);
    if (!confirmToggle) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`/api/admin/users/${userId}/toggle-status`, {}, config);
      alert("User access status updated successfully.");
      fetchUsers();
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to update user status.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-inter">
      <AdminSidebar />
      <main className="flex-grow p-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
        
        {/* Management Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
           <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">User Governance</h1>
              <p className="text-slate-500 font-medium tracking-tight">Access control and global account management across ByteLearn.</p>
           </div>
           <div className="flex bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm">
              {[
                { label: 'All Users', val: '' },
                { label: 'Students', val: 'student' },
                { label: 'Educators', val: 'educator' }
              ].map((filter) => (
                 <button
                   key={filter.val}
                   onClick={() => setRoleFilter(filter.val)}
                   className={`px-8 py-3 rounded-[20px] text-xs font-bold uppercase tracking-widest transition-all ${
                     roleFilter === filter.val 
                     ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                     : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                   }`}
                 >
                    {filter.label}
                 </button>
              ))}
           </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
           <div className="lg:col-span-3 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 group">
              <Search className="text-slate-300 ml-4 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name, email, or credential ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                className="w-full bg-transparent focus:outline-none font-bold text-slate-700 placeholder:text-slate-300 text-lg uppercase tracking-tight"
              />
              <button 
                onClick={fetchUsers}
                className="px-8 py-4 bg-slate-800 text-white font-black uppercase tracking-widest rounded-[24px] hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                Execute Global Search
              </button>
           </div>
           <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle size={20} /></div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Accounts</p>
                 <p className="text-2xl font-black text-slate-800 leading-none">{users.filter(u => u.isActive !== false).length}</p>
              </div>
           </div>
        </div>

        {/* Global User Data Board */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto relative min-h-[400px]">
           {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                 <div className="w-12 h-12 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing User Repositories...</p>
              </div>
           )}
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-10 py-6">Personal ID</th>
                    <th className="px-10 py-6">Governance Role</th>
                    <th className="px-10 py-6">System Status</th>
                    <th className="px-10 py-6">Access Protocol</th>
                    <th className="px-10 py-6 text-right font-black">Admin Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {users.length === 0 && !loading ? (
                    <tr><td colSpan="5" className="p-32 text-center text-slate-300 font-black uppercase tracking-widest text-sm translate-y-1">No personnel records found for your search parameters.</td></tr>
                 ) : (
                    users.map((user) => (
                       <tr key={user._id} className="group hover:bg-slate-50/80 transition-all">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="w-14 h-14 rounded-[20px] overflow-hidden bg-slate-100 border-2 border-white shadow-sm ring-1 ring-slate-100 relative">
                                   <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-full h-full object-cover" />
                                   {!user.isVerified && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white">!</div>
                                   )}
                                </div>
                                <div>
                                   <p className="text-[15px] font-black text-slate-800 tracking-tight leading-tight mb-1">{user.name}</p>
                                   <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                      <Mail size={12} /> {user.email}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                user.role === 'admin' ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100' :
                                user.role === 'educator' ? 'bg-blue-50/50 text-blue-600 border-blue-100' :
                                'bg-slate-50 text-slate-500 border-slate-100'
                             }`}>
                                {user.role}
                             </span>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                   <Calendar size={12} className="text-slate-300" />
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">JOINED {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Activity size={12} className="text-slate-300" />
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">LAST {new Date(user.lastLogin || user.createdAt).toLocaleDateString()}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-2.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${user.isActive === false ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-emerald-500 shadow-lg shadow-emerald-500/50'}`}></div>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${user.isActive === false ? 'text-rose-500' : 'text-emerald-500'}`}>
                                   {user.isActive === false ? 'Suspended' : 'Operational'}
                                </span>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                {user.role !== 'admin' && (
                                   <>
                                      <button 
                                         onClick={() => toggleStatus(user._id, user.name)}
                                         className={`p-3 rounded-2xl border transition-all active:scale-90 shadow-sm ${
                                            user.isActive === false 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white' 
                                            : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white'
                                         }`}
                                         title={user.isActive === false ? "Restore Access" : "Kill Switch (Suspend Access)"}
                                      >
                                         {user.isActive === false ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
                                      </button>
                                      <button className="p-3 bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-90">
                                         <UserX size={20} />
                                      </button>
                                   </>
                                )}
                             </div>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>

      </main>
    </div>
  );
};

export default UserManagement;
