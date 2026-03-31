import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  TrendingUp, 
  Award,
  ChevronDown,
  GraduationCap
} from 'lucide-react';

const DashboardHeader = ({ studentName = 'Student' }) => {
  const navItems = [
    { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
    { name: 'Browse', path: '/browse', icon: BookOpen },
    { name: 'My Courses', path: '/my-courses', icon: GraduationCap },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Quizzes', path: '/quizzes', icon: HelpCircle },
    { name: 'Queries', path: '/queries', icon: MessageSquare }, // Leaving MessageSquare for Queries based on context
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Certificates', path: '/certificates', icon: Award },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 text-blue-600 mr-8">
          <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
            <GraduationCap size={24} className="text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">ByteLearn</span>
        </div>

        {/* Navigation */}
        <nav className="hidden xl:flex items-center gap-1.5 text-[13px] font-medium flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50/80 font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              <item.icon size={16} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-3 ml-8">
          <button className="flex items-center gap-3 focus:outline-none">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-1">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-bold text-slate-800 leading-tight">{studentName}</p>
              <p className="text-[11px] text-slate-500 font-medium">Student</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;
