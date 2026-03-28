import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold mb-1 text-slate-800">
              <GraduationCap className="h-8 w-8 text-blue-600" strokeWidth={2.5} />
              <span>ByteLearn</span>
            </Link>
          </div>
          <div className="flex items-center">
            <Link to="/login" className="px-5 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
