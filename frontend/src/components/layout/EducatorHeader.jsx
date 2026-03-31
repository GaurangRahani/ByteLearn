import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Plus, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  MessageSquare,
  Users,
  ChevronDown
} from 'lucide-react';

const EducatorHeader = ({ educatorName, activePage }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/educator-dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Create Course', path: '/course/create', icon: <Plus size={16} /> },
    { name: 'My Courses', path: '/educator/courses', icon: <BookOpen size={16} /> },
    { name: 'Assignments', path: '/educator/assignments', icon: <FileText size={16} /> },
    { name: 'Quizzes', path: '/educator/quizzes', icon: <HelpCircle size={16} /> },
    { name: 'Queries', path: '/educator/queries', icon: <MessageSquare size={16} /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/educator-dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                 <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span>ByteLearn</span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1 mx-8 relative">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all relative ${
                  activePage === link.path 
                  ? 'bg-blue-50 text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center">
             <button onClick={handleLogout} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                 <Users size={16} />
               </div>
               <div className="text-left hidden sm:block">
                 <p className="text-sm font-bold text-slate-800 leading-tight">{educatorName || 'Educator'}</p>
                 <p className="text-[11px] text-slate-500 font-medium">Educator</p>
               </div>
               <ChevronDown size={16} className="text-slate-400" />
             </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default EducatorHeader;
