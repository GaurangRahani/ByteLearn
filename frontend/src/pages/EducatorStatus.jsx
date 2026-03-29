import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, LogOut } from 'lucide-react';

const EducatorStatus = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token and user state
    localStorage.removeItem('token');
    // Navigate back to login
    navigate('/login');
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 py-12 h-full">
      <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-sm border border-slate-100 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Visual Indicator */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-sm">
            <ClipboardList size={40} className="animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
          Application Under Review
        </h2>

        {/* Primary Message */}
        <p className="text-slate-600 text-sm leading-relaxed mb-4 px-2">
          Thank you for applying to be an educator on ByteLearn! Our administration team is currently reviewing your qualifications and supporting documents.
        </p>

        {/* Timeline Expectation */}
        <div className="bg-slate-50 rounded-lg p-4 mb-8 border border-slate-100">
          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            This process typically takes 1 to 3 business days. We will notify you via email as soon as your profile is approved.
          </p>
        </div>

        {/* Divider */}
        <hr className="border-t border-slate-100 mb-8" />

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            <LogOut size={18} />
            Log Out Securely
          </button>

          {/* Support Link */}
          <div className="pt-2">
            <a 
              href="mailto:support@bytelearn.com" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
            >
              Need help? Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EducatorStatus;
