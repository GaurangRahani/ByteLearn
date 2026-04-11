import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  ClipboardCheck, 
  Search, 
  Filter, 
  ArrowRight,
  UserCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState('grading'); // 'grading' or 'roster'
  const [educatorName, setEducatorName] = useState('Educator');
  const [loading, setLoading] = useState(true);
  
  // States for Grading Queue
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  
  // States for Course Roster
  const [roster, setRoster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const profileRes = await axios.get('/api/auth/profile', config);
        setEducatorName(profileRes.data.name);
        
        // Fetch pending work
        try {
            const subRes = await axios.get('/api/submissions/educator', config);
            setPendingSubmissions(subRes.data);
            
            const rosterRes = await axios.get('/api/enrollments/educator/roster', config);
            setRoster(rosterRes.data.data);
        } catch (e) {
            console.error("Error fetching submissions or roster:", e);
        }
        
      } catch (err) {
        console.error("Error fetching educator profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredRoster = roster.filter(enrollment => {
    const studentName = enrollment.studentId?.name || '';
    const courseTitle = enrollment.courseId?.title || '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <EducatorHeader educatorName={educatorName} activePage="/educator/student-management" />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Student Management Hub</h1>
          <p className="text-slate-500">The central control center for tracking progress and grading student work.</p>
        </div>

        {/* Tab Switcher - High-end control center style */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('grading')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'grading' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck size={18} />
            Grading Queue
            <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'grading' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {pendingSubmissions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'roster' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users size={18} />
            Course Roster
            <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'roster' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {roster.length}
            </span>
          </button>
        </div>

        {/* Dynamic View Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {loading ? (
             <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
                <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Syncing data...</p>
             </div>
          ) : activeTab === 'grading' ? (
            <GradingQueueView submissions={pendingSubmissions} />
          ) : (
            <CourseRosterView 
              roster={filteredRoster} 
              totalCount={roster.length}
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

/* --- Sub-View: Grading Queue --- */
const GradingQueueView = ({ submissions }) => {
  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center py-24">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="text-blue-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Queue is Empty</h3>
          <p className="text-slate-500 max-w-md mx-auto">All student assignments are currently graded. You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Course Name</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Assignment Name</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Submitted On</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {submissions.map((sub) => (
            <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {sub.studentId?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{sub.studentId?.name || 'Unknown Student'}</p>
                    <p className="text-[11px] text-slate-400">{sub.studentId?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <p className="text-sm font-semibold text-slate-600 line-clamp-1">{sub.courseId?.title}</p>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{sub.assignmentId?.title}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                    {Math.floor((new Date() - new Date(sub.submittedAt)) / (1000 * 60 * 60 * 24))} Days Pending
                  </p>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <button 
                  onClick={() => window.location.href=`/educator/review/${sub._id}`}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-100 inline-flex items-center gap-2"
                >
                  Grade Submission <ArrowRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* --- Sub-View: Course Roster --- */
const CourseRosterView = ({ roster, totalCount, searchTerm, setSearchTerm }) => {
  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search students by name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all border border-slate-100">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {roster.length === 0 ? (
           <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                 <Users className="text-slate-300" size={24} />
              </div>
              <p className="text-slate-500 font-bold">No students found</p>
              <p className="text-slate-400 text-sm">Either no students are enrolled or your filter is too strict.</p>
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Enrolled Course</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Enrolled On</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Progress</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roster.map((enrollment) => (
                <tr key={enrollment._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {enrollment.studentId?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{enrollment.studentId?.name || 'Unknown Student'}</p>
                        <p className="text-[11px] text-slate-400">{enrollment.studentId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600 line-clamp-1">{enrollment.courseId?.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                       {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-grow h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 ${
                              enrollment.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                           }`} 
                           style={{ width: `${enrollment.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{enrollment.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-flex items-center gap-1.5 text-xs font-bold">
                      View Profile <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Total Enrolled Students: {totalCount}
            </p>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
