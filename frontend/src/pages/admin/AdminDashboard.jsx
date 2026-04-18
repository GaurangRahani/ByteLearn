import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  UserPlus,
  BookCheck,
  Loader2,
  Wallet,
  IndianRupee
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalStudents: 0,
    totalEducators: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    pendingPayoutsCount: 0,
    pendingEducators: [],
    pendingCourses: [],
    pendingPayouts: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/stats', config);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const kpis = [
    { title: 'Total Students', value: data.totalStudents, color: 'bg-blue-50', icon: <Users size={20} className="text-blue-500" /> },
    { title: 'Total Educators', value: data.totalEducators, color: 'bg-emerald-50', icon: <ShieldCheck size={20} className="text-emerald-500" /> },
    { title: 'Total Courses', value: data.totalCourses, color: 'bg-purple-50', icon: <BookOpen size={20} className="text-purple-500" /> },
    { title: 'Pending Payouts', value: data.pendingPayoutsCount || 0, color: 'bg-amber-50', icon: <Wallet size={20} className="text-amber-500" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminHeader />
      
      <main className="max-w-[1440px] mx-auto px-10 py-10">
        
        {/* Dashboard Title & Subtitle */}
        <div className="mb-10">
          <h1 className="text-[32px] font-black text-slate-800 tracking-tight mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium tracking-tight">Platform overview and management</p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, index) => (
             <div key={index} className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${kpi.color}`}>
                   {kpi.icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{kpi.title}</p>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
             </div>
          ))}
        </div>

        {/* Pending Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Educator Apps */}
           <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
              <div className="p-8 pb-4">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pending Educator Applications</h2>
              </div>
              <div className="p-4 space-y-3">
                 {data.pendingEducators.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 font-bold">No pending applications found.</div>
                 ) : (
                    data.pendingEducators.map((edu) => (
                       <div key={edu._id} className="p-6 bg-amber-50/30 rounded-2xl border border-amber-100/50 flex items-center justify-between group transition-all hover:bg-amber-50">
                          <div>
                             <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-0.5">{edu.name}</h4>
                             <p className="text-xs font-medium text-slate-500">{edu.email}</p>
                          </div>
                          <Link 
                            to="/admin/educators"
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-95"
                          >
                            Review
                          </Link>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Course Apps */}
           <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
              <div className="p-8 pb-4">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pending Course Approvals</h2>
              </div>
              <div className="p-4 space-y-3">
                 {data.pendingCourses.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 font-bold">No courses pending approval.</div>
                 ) : (
                    data.pendingCourses.map((course) => (
                       <div key={course._id} className="p-6 bg-amber-50/30 rounded-2xl border border-amber-100/50 flex items-center justify-between group transition-all hover:bg-amber-50">
                          <div>
                             <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-0.5">{course.title}</h4>
                             <p className="text-xs font-medium text-slate-500">By {course.educatorId?.name}</p>
                          </div>
                          <Link 
                            to="/admin/courses"
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-95"
                          >
                            Review
                          </Link>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Payout Requests */}
           <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
              <div className="p-8 pb-4">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pending Payouts</h2>
              </div>
              <div className="p-4 space-y-3">
                 {!data.pendingPayouts || data.pendingPayouts.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 font-bold">No pending payouts.</div>
                 ) : (
                    data.pendingPayouts.map((payout) => (
                       <div key={payout._id} className="p-6 bg-amber-50/30 rounded-2xl border border-amber-100/50 flex items-center justify-between group transition-all hover:bg-amber-50">
                          <div>
                             <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-0.5">{payout.educatorId?.name}</h4>
                             <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                               <IndianRupee size={12}/>{payout.amount.toLocaleString()}
                             </p>
                          </div>
                          <Link 
                            to="/admin/payouts"
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-95"
                          >
                            Review
                          </Link>
                       </div>
                    ))
                 )}
              </div>
           </div>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
