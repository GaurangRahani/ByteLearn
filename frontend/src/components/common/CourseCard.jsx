import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

const CourseCard = ({ title, instructor, duration, progress }) => {
  return (
    <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-slate-200 transition-colors">
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800 text-[15px] mb-2">{title}</h3>
        <p className="text-xs font-medium text-slate-500 mb-6 flex items-center gap-4">
          <span>{instructor}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-slate-400" /> {duration}
          </span>
        </p>
        
        <div className="flex items-center gap-4 pr-12">
          <div className="flex-grow">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[11px] font-bold text-slate-600">Course Progress</span>
              <span className="text-xs font-bold text-slate-500">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-[6px]">
              <div 
                className="bg-[#2563EB] h-[6px] rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 flex justify-end mt-4 md:mt-0">
        <button className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[13px] shadow-sm">
          Continue <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
