import React from 'react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader />
      
      <main className="flex-grow max-w-[800px] w-full mx-auto px-6 py-10">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>
        
        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Update Profile</h1>
          <p className="text-slate-500 text-[15px] mb-8">Manage your profile details and preferences.</p>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User size={40} className="mt-1" />
              </div>
              <button 
                type="button"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[14px] transition-colors"
              >
                Change Picture
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    defaultValue="Student"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    defaultValue="student@bytelearn.com"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-8 flex justify-end">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-slate-600 font-medium text-[14px] hover:bg-slate-50 rounded-xl transition-colors mr-3"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-[14px] transition-colors shadow-sm"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default UpdateProfile;
