import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  BookCheck,
  UserCog,
  Banknote
} from 'lucide-react';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = adminUser?.name || 'Admin';

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

  const navItems = [
    { name: 'Overview', path: '/admin-dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Educator Approvals', path: '/admin/educators', icon: <ShieldCheck size={16} /> },
    { name: 'Course Approvals', path: '/admin/courses', icon: <BookCheck size={16} /> },
    { name: 'User Management', path: '/admin/users', icon: <UserCog size={16} /> },
    { name: 'Payouts', path: '/admin/payouts', icon: <Banknote size={16} /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo added */}
        <div className="flex items-center">
          <Link to="/admin-dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="hidden sm:inline">ByteLearn</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-1 mx-8 relative">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all relative ${isActive
                  ? 'bg-blue-50 text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
              {adminName?.charAt(0) || <User size={16} />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-none">{adminName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Admin</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <button
                onClick={handleLogout}
                className="w-[calc(100%-8px)] flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all mx-1 rounded-lg"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default AdminHeader;
