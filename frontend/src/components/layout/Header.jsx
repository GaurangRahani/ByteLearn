import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  GraduationCap,
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Award,
  ChevronDown,
  LogOut,
  User as UserIcon,
  LogIn
} from 'lucide-react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('Student');
  const [profilePic, setProfilePic] = useState(null);
  const [hasUnreadQueries, setHasUnreadQueries] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchProfileData(token);
      checkUnreadQueries(token);
    } else {
      setIsLoggedIn(false);
    }
  }, [location]); // Re-check on navigation

  const fetchProfileData = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/auth/profile', config);
      if (res.data) {
        if (res.data.name) setProfileName(res.data.name);
        if (res.data.profilePicture && res.data.profilePicture !== 'default-profile.jpg') {
          setProfilePic(res.data.profilePicture);
        }
      }
    } catch (err) {
      console.error("Header failed to fetch profile", err);
    }
  };

  const checkUnreadQueries = async (token) => {
    try {
      const res = await axios.get('/api/queries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data) {
         const hasUnread = res.data.data.some(q => q.status === 'resolved' && !q.studentRead);
         setHasUnreadQueries(hasUnread);
      }
    } catch (err) {
      console.error("Header failed to check unread queries", err);
    }
  };

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
    setIsLoggedIn(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
    { name: 'Browse', path: '/browse', icon: BookOpen },
    { name: 'My Courses', path: '/my-courses', icon: GraduationCap },
    { name: 'Queries', path: '/student/queries', icon: MessageSquare, hasBadge: hasUnreadQueries },
    { name: 'Certificates', path: '/certificates', icon: Award },
  ];

  const fallbackPic = `https://ui-avatars.com/api/?name=${profileName}&background=EFF6FF&color=2563EB`;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-3xl font-bold text-slate-800 group">
          <div className="bg-blue-600 p-1.5 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
            <GraduationCap size={28} className="text-white fill-white/10" />
          </div>
          <span className="tracking-tight">ByteLearn</span>
        </Link>

        {/* Dynamic Content based on Auth */}
        {isLoggedIn ? (
          <>
            {/* Nav Items - Desktop */}
            <nav className="hidden lg:flex items-center gap-4 ml-10 flex-grow">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14.5px] font-bold transition-all relative ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.name}
                  {item.hasBadge && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-4 hover:bg-slate-50 rounded-2xl transition-colors focus:outline-none border border-transparent hover:border-slate-100"
              >
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                   <img src={profilePic || fallbackPic} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[15px] font-bold text-slate-800 leading-tight truncate max-w-[120px]">{profileName}</p>
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Student</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50">
                  <Link 
                    to="/update-profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[14px] text-slate-700 font-bold hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <UserIcon size={18} className="text-slate-400" /> My Profile
                  </Link>
                  <div className="h-px bg-slate-100 mx-3 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-red-600 font-bold hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} className="text-red-400" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-5 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

