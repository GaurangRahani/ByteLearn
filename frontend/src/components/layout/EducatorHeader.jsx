import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare,
  Users,
  ChevronDown,
  IndianRupee,
  User,
  LogOut,
  Settings
} from 'lucide-react';

const EducatorHeader = ({ educatorName, activePage }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = educatorName && educatorName !== 'Educator' ? educatorName : (localUser.name || 'Educator');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/educator-dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'My Courses', path: '/educator/courses', icon: <BookOpen size={16} /> },
    { name: 'Student Management', path: '/educator/student-management', icon: <Users size={16} /> },
    { name: 'Queries', path: '/educator/queries', icon: <MessageSquare size={16} /> },
    { name: 'Earnings', path: '/educator/earnings', icon: <IndianRupee size={16} /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
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
          <div className="flex items-center relative" ref={profileRef}>
             <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all"
             >
               <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                 {displayName?.charAt(0) || <User size={16} />}
               </div>
               <div className="hidden sm:block text-left">
                 <p className="text-sm font-bold text-slate-800 leading-none">{displayName}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Educator</p>
               </div>
               <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
             </button>

             {isProfileOpen && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <Link 
                    to="/educator/profile" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all mx-1 rounded-lg"
                  >
                    <Settings size={14} />
                    Account Settings
                  </Link>

                  <div className="h-[1px] bg-slate-50 my-1 mx-2" />

                  <button 
                    onClick={handleLogout}
                    className="w-[calc(100%-8px)] flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-all mx-1 rounded-lg"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
               </div>
             )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default EducatorHeader;
