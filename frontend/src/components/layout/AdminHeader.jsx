import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  BookCheck,
  UserCog
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
    { name: 'Overview',           path: '/admin-dashboard',  icon: <LayoutDashboard size={16} /> },
    { name: 'Educator Approvals', path: '/admin/educators',  icon: <ShieldCheck size={16} /> },
    { name: 'Course Approvals',   path: '/admin/courses',    icon: <BookCheck size={16} /> },
    { name: 'User Management',    path: '/admin/users',      icon: <UserCog size={16} /> },
  ];

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 h-16 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between gap-6">

        {/* Logo */}
        <NavLink to="/admin-dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">ByteLearn</span>
          <span className="ml-1 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Admin</span>
        </NavLink>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right: Bell + Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Bell size={17} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <User size={15} />
              </div>
              <div className="hidden sm:block text-left leading-none">
                <p className="text-xs font-black text-slate-800">{adminName}</p>
                <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
              </div>
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 z-50">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-xs font-black text-slate-800">{adminName}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;
