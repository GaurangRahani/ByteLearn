import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Briefcase, MessageCircle, GraduationCap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="tracking-tight">ByteLearn</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Empowering developers with interactive, high-quality technical education.
              Build your future with world-class courses and hands-on coding environments.
            </p>
          <div className="flex gap-5">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <Code size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <Briefcase size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-8 text-sm uppercase tracking-widest">Platform</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/" className="text-blue-50 hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/browse" className="text-blue-50 hover:text-white transition-colors">Browse Courses</Link></li>
            <li><Link to="/my-courses" className="text-blue-50 hover:text-white transition-colors">My Courses</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h3 className="text-white font-bold mb-8 text-sm uppercase tracking-widest">Support</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="#" className="text-blue-50 hover:text-white transition-colors">Documentation</Link></li>
            <li><Link to="#" className="text-blue-50 hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link to="#" className="text-blue-50 hover:text-white transition-colors">Help Center</Link></li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div>
          <h3 className="text-white font-bold mb-8 text-sm uppercase tracking-widest">Legal</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="#" className="text-blue-50 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="#" className="text-blue-50 hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-blue-100/70 text-xs">
          © {currentYear} ByteLearn. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-blue-100/70 text-xs font-medium">System Status: All systems operational</span>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
