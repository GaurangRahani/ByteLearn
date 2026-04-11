import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Play,
  Users,
  AlertCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [educatorName, setEducatorName] = useState('Educator');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const profileRes = await axios.get('/api/auth/profile', config);
        setEducatorName(profileRes.data.name);

        const coursesRes = await axios.get('/api/courses/my-courses', config);
        const fetchedCourses = coursesRes.data?.data || coursesRes.data || [];
        if (Array.isArray(fetchedCourses)) {
           setCourses(fetchedCourses);
        } else {
           setCourses([]);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    const title = course?.title || '';
    const status = course?.status || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <EducatorHeader educatorName={educatorName} activePage="/educator/courses" />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">My Courses</h1>
            <p className="text-slate-500">Manage all your courses—from blueprints to published content.</p>
          </div>
          <Link 
            to="/course/create"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            Create New Course
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by course title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400 ml-2 mr-1" />
            <div className="flex gap-2">
               {['All', 'Draft', 'Pending', 'Approved'].map((status) => (
                 <button
                   key={status}
                   onClick={() => setStatusFilter(status)}
                   className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                     statusFilter === status 
                     ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                     : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                   }`}
                 >
                   {status}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-28 w-full bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
             ))}
          </div>
        ) : error ? (
           <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
             <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
             <p className="text-slate-600 font-medium">{error}</p>
             <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 font-bold hover:underline">Try Refreshing</button>
           </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-slate-300" size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No courses found</h3>
             <p className="text-slate-500 mb-8 max-w-sm mx-auto">Get started by creating your first course blueprint or adjusting your filters.</p>
             <Link to="/course/create" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-1">
               Start Creating Now <ChevronRight size={18} />
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.map((course) => {
              const courseId = course?._id || course?.id || Math.random().toString();
              const courseTitle = course?.title || 'Untitled Course';
              const courseCategory = course?.category || 'General';
              const coursePrice = course?.price || 0;
              const courseStatus = course?.status || 'draft';
              const courseThumbnail = course?.thumbnail || 'https://via.placeholder.com/400x225?text=Draft';
              const studentCount = (course?.enrolledStudents?.length) || (course?.studentCount) || 0;
              const moduleCount = (course?.modules?.length) || 0;

              return (
                <div 
                  key={courseId} 
                  className="group bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col md:flex-row items-center gap-6"
                >
                  <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                     <img 
                      src={courseThumbnail} 
                      alt={courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                     <div className="absolute top-2 right-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                          courseStatus === 'approved' ? 'bg-emerald-500 text-white border-emerald-400' :
                          courseStatus === 'pending' ? 'bg-amber-500 text-white border-amber-400' :
                          'bg-slate-700 text-white border-slate-600'
                        }`}>
                          {courseStatus}
                        </span>
                     </div>
                  </div>

                  <div className="flex-grow text-center md:text-left">
                     <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                       <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{courseTitle}</h2>
                       <span className="text-xs font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded hidden md:inline-block border border-slate-100 uppercase tracking-tighter">{courseCategory}</span>
                     </div>
                     <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                          <Play size={14} className="text-blue-500" />
                          <span>{moduleCount} Modules</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                          <Users size={14} className="text-emerald-500" />
                          <span>{studentCount} Students</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                           <span className="text-blue-600">{'\u20B9'}{coursePrice}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-2 items-center w-full md:w-auto">
                     {courseStatus === 'draft' ? (
                       <button 
                         onClick={() => navigate(`/course/${courseId}/curriculum`)}
                         className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                       >
                         <Edit3 size={18} />
                         Build Content
                       </button>
                     ) : (
                        <button 
                         onClick={() => navigate(`/course/${courseId}/curriculum`)}
                         className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                       >
                         <Eye size={18} />
                         View Detail
                       </button>
                     )}
                     <button className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all">
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCourses;
