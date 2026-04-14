import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  ChevronRight,
  Loader2,
  Calendar,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';

const StudentQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'resolved'
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/queries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQueries(res.data.data);
      } catch (err) {
        console.error('Error fetching queries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const uniqueCourses = [...new Set(queries.map(q => q.courseId?.title))].filter(Boolean);

  const filteredQueries = queries.filter(q => {
    const matchesStatus = filter === 'all' || q.status === filter;
    const matchesCourse = courseFilter === 'all' || q.courseId?.title === courseFilter;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (q.courseId?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCourse && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-20">
      <DashboardHeader activePage="/student/queries" />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">My Questions</h1>
            <p className="text-slate-500 font-medium">Track all your doubts and instructor responses in one place.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl flex items-center px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all w-full md:w-80">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search your questions..." 
                className="bg-transparent border-none outline-none px-3 py-1.5 text-sm w-full font-medium text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Filter By:</span>
          </div>

          <div className="flex p-1 bg-slate-200/50 rounded-xl">
             {['all', 'pending', 'resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${filter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {s}
                </button>
             ))}
          </div>

          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/10"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
             <option value="all">All Courses</option>
             {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing your discussions...</p>
          </div>
        ) : filteredQueries.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredQueries.map((query) => (
              <div key={query._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl ${query.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {query.status === 'resolved' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Context</p>
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-800">{query.courseId?.title || 'Unknown Course'}</span>
                             {query.lessonId && (
                                <>
                                  <ArrowRight size={14} className="text-slate-300" />
                                  <span className="text-sm font-medium text-slate-500">{query.lessonId.title}</span>
                                </>
                             )}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${query.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {query.status}
                       </span>
                    </div>
                  </div>

                  <div className="pl-12">
                     <p className="text-slate-800 font-bold text-lg mb-4 leading-relaxed tracking-tight italic">
                        "{query.question}"
                     </p>
                     
                     <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
                        <div className="flex items-center gap-1.5">
                           <Calendar size={14} />
                           {new Date(query.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                     </div>

                     {query.answer ? (
                       <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 relative">
                          <div className="absolute top-4 left-[-8px] w-4 h-4 bg-blue-50 border-l border-t border-blue-100 rotate-[-45deg] hidden md:block"></div>
                          <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <MessageSquare size={14} /> Instructor's Response
                          </p>
                          <p className="text-slate-700 font-medium leading-relaxed">{query.answer}</p>
                          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 italic">
                             <Clock size={12} /> Response provided on {new Date(query.updatedAt).toLocaleDateString()}
                          </div>
                       </div>
                     ) : (
                       <div className="bg-slate-50 rounded-2xl p-6 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                          <Loader2 size={24} className="text-slate-300 animate-spin mb-3" />
                          <p className="text-slate-500 font-bold text-sm tracking-tight">Hang tight! The instructor will reply soon.</p>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-dashed border-slate-300 py-24 px-6 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <MessageSquare size={44} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No conversations found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
               {queries.length === 0 
                ? "You haven't asked any questions yet. Start a discussion from your course player!" 
                : "No questions match your current filters."}
            </p>
            {queries.length > 0 && (
              <button 
                onClick={() => {setFilter('all'); setCourseFilter('all'); setSearchQuery('');}}
                className="text-blue-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentQueries;
