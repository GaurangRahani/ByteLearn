import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, CheckCircle, Award, Clock, ArrowRight, FileText } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ContinueLearningSection from '../../components/common/ContinueLearningSection';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [studentName, setStudentName] = useState('Student');

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
        
        // Fetch profile for name
        const profileRes = await axios.get('/api/auth/profile', config);
        if (profileRes.data && profileRes.data.data?.name) {
          setStudentName(profileRes.data.data.name);
        } else if (profileRes.data && profileRes.data.name) {
          setStudentName(profileRes.data.name);
        }

        // Fetch dashboard data
        const res = await axios.get('/api/dashboard/student', config);
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DashboardHeader studentName={studentName} />
        <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10">
          <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl mb-4"></div>
          <div className="h-5 w-96 bg-slate-200 animate-pulse rounded-lg mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-[24px]"></div>)}
          </div>
          <div className="h-64 bg-slate-200 animate-pulse rounded-[32px] mb-12"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-slate-200 animate-pulse rounded-[24px]"></div>
            <div className="h-80 bg-slate-200 animate-pulse rounded-[24px]"></div>
          </div>
        </main>
      </div>
    );
  }

  const { metrics, activeCourses, recentQuizzes, recentAssignments } = data || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans mb-16">
      <DashboardHeader studentName={studentName} />
      
      <motion.main 
        className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <motion.div className="mb-10" variants={itemVariants}>
          <h1 className="text-[36px] font-bold text-slate-900 mb-2 tracking-tight">
            Welcome back, {studentName.split(' ')[0]}! 👋
          </h1>
          <p className="text-[16px] text-slate-500 font-medium">
            Your progress looks great! Continue where you left off.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={itemVariants}
        >
          {/* Card 1: Enrolled */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-[24px] p-8 text-white shadow-xl shadow-blue-500/20"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-12 shadow-inner">
                <Book size={28} className="text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-[11px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80">Enrolled Courses</p>
                <h2 className="text-4xl font-black tracking-tight">{metrics?.totalEnrolled || 0}</h2>
              </div>
            </div>
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>

          {/* Card 2: Completed */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#10B981] to-[#059669] rounded-[24px] p-8 text-white shadow-xl shadow-emerald-500/20"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-12 shadow-inner">
                <CheckCircle size={28} className="text-white" />
              </div>
              <div>
                <p className="text-emerald-100 text-[11px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80">Completed Courses</p>
                <h2 className="text-4xl font-black tracking-tight">{metrics?.completedCourses || 0}</h2>
              </div>
            </div>
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>

          {/* Card 3: Certificates */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-[24px] p-8 text-white shadow-xl shadow-amber-500/20"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-12 shadow-inner">
                <Award size={28} className="text-white" />
              </div>
              <div>
                <p className="text-amber-100 text-[11px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80">Certificates Earned</p>
                <h2 className="text-4xl font-black tracking-tight">{metrics?.certificatesEarned || 0}</h2>
              </div>
            </div>
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>
        </motion.div>

        {/* Continue Learning */}
        <motion.div variants={itemVariants} className="mb-12">
           <ContinueLearningSection courses={activeCourses} />
        </motion.div>

        {/* Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quizzes */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[19px] font-bold text-slate-900">Recent Quizzes</h2>
              <Link to="/quizzes" className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all">
                View History <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentQuizzes?.length > 0 ? recentQuizzes.map((quiz) => (
                <motion.div 
                  key={quiz._id}
                  whileHover={{ x: 5 }}
                  className="group bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-slate-100 p-5 rounded-[20px] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-[15px] mb-1">{quiz.quizId?.title}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(quiz.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-500 tabular-nums">{quiz.score}%</span>
                  </div>
                </motion.div>
              )) : (
                <div className="py-12 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No quiz attempts yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Assignments */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[19px] font-bold text-slate-900">Assignments Status</h2>
              <Link to="/assignments" className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Check Portal <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentAssignments?.length > 0 ? recentAssignments.map((sub) => (
                <motion.div 
                  key={sub._id}
                  whileHover={{ x: 5 }}
                  className="group bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-slate-100 p-5 rounded-[20px] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-[15px] mb-1">{sub.assignmentId?.title}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                         {sub.status === 'graded' ? `Graded` : `Submitted`} • {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {sub.status === 'graded' ? (
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-600 tabular-nums">{sub.marksObtained}</span>
                        <span className="text-xs font-bold text-slate-400 ml-1">/100</span>
                      </div>
                    ) : (
                      <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border border-amber-200/50 whitespace-nowrap shadow-sm">
                        Pending review
                      </span>
                    )}
                  </div>
                </motion.div>
              )) : (
                <div className="py-12 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No assignments submitted</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.main>
    </div>
  );
};

export default StudentDashboard;
