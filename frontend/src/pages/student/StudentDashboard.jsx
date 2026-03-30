import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ContinueLearningSection from '../../components/common/ContinueLearningSection';
import { BookOpen, TrendingUp, FileText, Award } from 'lucide-react';

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState('Student');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const profileRes = await axios.get('/api/auth/profile', config);
        
        if (profileRes.data && profileRes.data.name) {
          setStudentName(profileRes.data.name);
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };
    
    fetchProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <DashboardHeader studentName={studentName} />
      
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10">
        
        {/* Inline Section - Greeting */}
        <div className="mb-10">
          <h1 className="text-[28px] font-semibold text-[#1e293b] mb-1.5 tracking-tight">
            Welcome back, {studentName}!
          </h1>
          <p className="text-[15px] text-slate-500 font-medium">
            Track your progress and continue your learning journey
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div className="w-12 h-12 bg-[#3b82f6] rounded-[14px] flex items-center justify-center text-white mb-8">
              <BookOpen size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Enrolled Courses</p>
              <h2 className="text-[28px] font-bold text-slate-800 leading-none">2</h2>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div className="w-12 h-12 bg-[#22c55e] rounded-[14px] flex items-center justify-center text-white mb-8">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Overall Progress</p>
              <h2 className="text-[28px] font-bold text-slate-800 leading-none">45%</h2>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div className="w-12 h-12 bg-[#f97316] rounded-[14px] flex items-center justify-center text-white mb-8">
              <FileText size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Assignments</p>
              <h2 className="text-[28px] font-bold text-slate-800 leading-none">1</h2>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div className="w-12 h-12 bg-[#a855f7] rounded-[14px] flex items-center justify-center text-white mb-8">
              <Award size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quiz Performance</p>
              <h2 className="text-[28px] font-bold text-slate-800 leading-none">100%</h2>
            </div>
          </div>

        </div>

        {/* Continue Learning Section */}
        <ContinueLearningSection />

        {/* Bottom Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          
          {/* Recent Quiz Results */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-7">
            <h2 className="text-[17px] font-semibold text-slate-800 mb-6">Recent Quiz Results</h2>
            <div className="bg-slate-50/70 rounded-[14px] border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-[15px] text-slate-800 mb-1">HTML Basics Quiz</h3>
                <p className="text-xs text-slate-400 font-medium">2026-02-18</p>
              </div>
              <div className="text-[22px] font-bold text-[#10b981]">
                100%
              </div>
            </div>
          </div>

          {/* Assignment Status */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-7">
            <h2 className="text-[17px] font-semibold text-slate-800 mb-6">Assignment Status</h2>
            <div className="space-y-4">
              <div className="bg-slate-50/70 rounded-[14px] border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[15px] text-slate-800 mb-1">HTML Structure Assignment</h3>
                  <p className="text-xs text-slate-400 font-medium">Submitted 2026-02-20</p>
                </div>
                <div className="text-[22px] font-bold text-[#10b981] whitespace-nowrap">
                  85<span className="text-sm font-semibold text-[#10b981]">/100</span>
                </div>
              </div>

              <div className="bg-slate-50/70 rounded-[14px] border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[15px] text-slate-800 mb-1">HTML Structure Assignment</h3>
                  <p className="text-xs text-slate-400 font-medium">Submitted 2026-02-21</p>
                </div>
                <div>
                  <span className="inline-flex px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-md border border-amber-200/60 whitespace-nowrap uppercase tracking-wide">
                    Pending Review
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
