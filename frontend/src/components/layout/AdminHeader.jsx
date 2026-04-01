import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Bell } from 'lucide-react';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 h-16 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo and Brand */}
        <NavLink to="/admin-dashboard" className="flex items-center gap-2 text-blue-600 hover:opacity-80 transition-opacity">
          <GraduationCap size={28} />
          <span className="text-xl font-bold text-slate-800 tracking-tight">ByteLearn</span>
        </NavLink>

        {/* User and Notification */}
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-blue-600 transition-colors">
            <Bell size={20} />
          </button>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <User size={18} />
            </div>
            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Admin</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;
