import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';

const EnrolledCourseCard = ({ enrollment, progress }) => {
  const {
    title,
    description,
    thumbnail,
    price,
    isFree,
    educatorName,
    studentCount,
    duration
  } = enrollment;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
      {/* Thumbnail Container */}
      <div className="relative h-48 w-full">
        <img 
          src={thumbnail || "/api/placeholder/400/250"} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          {isFree ? (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-100 text-teal-800">
              Free
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white">
              ${price}
            </span>
          )}
        </div>
      </div>

      {/* Body Section */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Meta info row */}
        <div className="flex items-center text-xs text-slate-500 mb-6 flex-wrap gap-y-2">
          <span>{educatorName}</span>
          <span className="mx-2 text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{studentCount}</span>
          </div>
          <span className="mx-2 text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{duration}</span>
          </div>
        </div>

        <div className="mt-auto">
          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-500">Course Progress</span>
              <span className="text-slate-700">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Continue Learning Button */}
          <Link to={`/learn/${enrollment._id}`} className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors text-center">
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;
