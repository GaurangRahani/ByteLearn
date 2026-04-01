import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookCheck, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Users,
  Video,
  Layers,
  Check,
  ChevronRight,
  Edit2,
  Loader2
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';

const CourseApprovals = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/courses/pending', config);
      setCourses(res.data.courses);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    if (status === 'rejected' && !feedback.trim()) {
      alert("Feedback is required for rejection.");
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/courses/${id}/review`, { status, adminFeedback: feedback }, config);
      alert(`Course ${status === 'approved' ? 'Published' : 'Rejected'} Successfully!`);
      setSelectedCourse(null);
      setFeedback('');
      fetchPendingCourses();
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to review course.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminHeader />
      <main className="max-w-[1440px] mx-auto px-10 py-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div>
              <h1 className="text-[32px] font-black text-slate-800 tracking-tighter mb-1">Course Approvals</h1>
              <p className="text-slate-500 font-medium tracking-tight">Curate and verify the latest learning content submissions.</p>
           </div>
        </div>

        {/* Data List View */}
        <div className="grid grid-cols-1 gap-4">
           {loading ? (
             <div className="p-20 text-center flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
             </div>
           ) : courses.length === 0 ? (
             <div className="bg-white p-20 rounded-[32px] border border-slate-100 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200"><BookCheck size={32} /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No pending courses for review</h3>
             </div>
           ) : (
              courses.map((course) => (
                 <div key={course._id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-8 group">
                    <div className="w-40 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-50">
                       <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                       <h3 className="text-lg font-bold text-slate-800 tracking-tight">{course.title}</h3>
                       <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-1">
                          <p className="text-xs font-bold text-slate-400">By {course.educatorId?.name}</p>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{course.category}</span>
                       </div>
                    </div>
                    <button 
                       onClick={() => setSelectedCourse(course)}
                       className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-95"
                    >
                       Review
                    </button>
                 </div>
              ))
           )}
        </div>

        {/* Modal/Drawer Overlay */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
                
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                   <div className="flex items-center gap-4">
                      <img src={selectedCourse.thumbnail} className="w-20 h-14 rounded-xl object-cover border border-slate-100" />
                      <div>
                         <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedCourse.title}</h2>
                         <p className="text-sm font-medium text-slate-400">Reviewing curriculum blueprint</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedCourse(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                      <XCircle size={24} className="text-slate-500" />
                   </button>
                </div>

                <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/20">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Course Description</label>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">{selectedCourse.description}</p>
                   </div>
                   
                   <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100/50">
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 block">Feedback (Required only if requesting changes)</label>
                      <textarea 
                        rows="4" 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full bg-white border border-emerald-100 rounded-xl p-5 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-slate-700 font-medium placeholder:text-slate-300 text-sm"
                        placeholder="Detail the changes required for approval..."
                      ></textarea>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-2 gap-6 sticky bottom-0 z-10 shadow-xl">
                   <button 
                      onClick={() => handleReview(selectedCourse._id, 'rejected')}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 disabled:opacity-50"
                   >
                      Reject
                   </button>
                   <button 
                      onClick={() => handleReview(selectedCourse._id, 'approved')}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50"
                   >
                      {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Publish
                   </button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CourseApprovals;
