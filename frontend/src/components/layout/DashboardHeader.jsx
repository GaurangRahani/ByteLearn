import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  GraduationCap,
  LogOut,
  User as UserIcon
} from 'lucide-react';

const DashboardHeader = ({ studentName = 'Student' }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(studentName);
  const [hasUnreadQueries, setHasUnreadQueries] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (studentName && studentName !== 'Student') {
      setProfileName(studentName);
      return; 
    }
    const fetchProfileName = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/auth/profile', config);
        if (res.data && res.data.name) {
          setProfileName(res.data.name);
        }
      } catch (err) {
        console.error("DashboardHeader failed to fetch profile name", err);
      }
    };
    fetchProfileName();

    const checkUnreadQueries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/api/queries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.data) {
           const hasUnread = res.data.data.some(q => q.status === 'resolved' && !q.studentRead);
           setHasUnreadQueries(hasUnread);
        }
      } catch (err) {
        console.error("DashboardHeader failed to check unread queries", err);
      }
    };
    checkUnreadQueries();
  }, [studentName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsProfileOpen(false);
    navigate('/update-profile');
  };
  const navItems = [
    { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
    { name: 'Browse', path: '/browse', icon: BookOpen },
    { name: 'My Courses', path: '/my-courses', icon: GraduationCap },
    { name: 'My Queries', path: '/student/queries', icon: MessageSquare, hasBadge: hasUnreadQueries },
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
        <nav className="hidden xl:flex items-center justify-center gap-8 text-[13px] font-medium flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50/80 font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              <item.icon size={16} />
              {item.name}
              {item.hasBadge && (
                 <span className="absolute top-1.5 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_0_2px_#ffffff]"></span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-3 ml-8 relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm overflow-hidden">
              <UserIcon size={20} className="mt-1" fill="currentColor" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[14px] font-bold text-slate-800 leading-tight">{profileName}</p>
              <p className="text-[13px] text-slate-500 font-medium">Student</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <button 
                onClick={handleEditProfile}
                className="w-full text-left px-4 py-2.5 text-[14px] text-slate-700 font-medium hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <UserIcon size={16} /> Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[14px] text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;
