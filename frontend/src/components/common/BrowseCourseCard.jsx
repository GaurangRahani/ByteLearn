import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';

const BrowseCourseCard = ({ course }) => {
  const navigate = useNavigate();

  const _id = course?._id || '';
  const title = course?.title || 'Untitled Course';
  const description = course?.description || 'No description available.';
  const thumbnail = course?.thumbnail || 'https://via.placeholder.com/400x200?text=Course+Thumbnail'; 
  const price = course?.price;
  const isFree = course?.isFree || price === 0 || price === '0' || !price;
  
  const educatorName = typeof course?.educatorName === 'string' 
    ? course.educatorName 
    : (course?.educator?.user?.name || course?.educator?.name || course?.educatorName || 'Unknown Educator');
    
  const studentCount = course?.studentCount || (course?.enrolledStudents?.length) || 0;
  const duration = course?.duration || '0h';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full group">
      {/* Thumbnail Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Price Badge overlaying the thumbnail */}
        <div className="absolute top-3 right-3 z-10">
          {isFree ? (
            <span className="bg-[#E6F4EA]/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border border-[#E6F4EA]">
              <span className="text-[#1E8E3E] text-xs font-bold leading-none tracking-wide">Free</span>
            </span>
          ) : (
            <span className="bg-[#2563EB]/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border border-[#2563EB]">
              <span className="text-white text-xs font-bold leading-none tracking-wide">${Number(price).toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-[16px] leading-[1.4] mb-2 line-clamp-1">{title}</h3>
        <p className="text-slate-500 text-[14px] leading-relaxed mb-5 line-clamp-2 min-h-[40px] tracking-tight">{description}</p>
        
        {/* Meta Info Row */}
        <div className="mt-auto mb-5 flex items-center text-[13px] text-slate-500 font-medium">
          <span className="truncate max-w-[130px]">{educatorName}</span>
          <span className="mx-2.5 text-slate-300 text-[10px]">•</span>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Users size={14} className="text-slate-400" />
            <span>{studentCount}</span>
          </div>
          <span className="mx-2.5 text-slate-300 text-[10px]">•</span>
          <div className="flex items-center gap-1.5 whitespace-nowrap lg:ml-auto">
            <Clock size={14} className="text-slate-400" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => navigate(`/course/${_id}`)}
          className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-[11px] px-4 rounded-[10px] transition-colors shadow-[0_2px_10px_rgba(37,99,235,0.2)] text-[14px]"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default BrowseCourseCard;
