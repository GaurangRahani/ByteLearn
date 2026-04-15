import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Star } from 'lucide-react';

const EnrolledCourseCard = ({ enrollment, progress }) => {
  const {
    title,
    description,
    thumbnail,
    price,
    isFree,
    instructorName,
    enrollmentCount,
    duration,
    rating,
    totalRatings
  } = enrollment;

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer">
      {/* Thumbnail Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={thumbnail || "/api/placeholder/400/250"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Body Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Text content wrapped in a container that grows */}
        <div className="flex-grow">
          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Action & Progress area - always at bottom */}
        <div className="mt-auto space-y-5">
          {/* Progress Section */}
          <div>
            <div className="flex justify-end mb-1.5">
              <span className="text-sm font-semibold text-slate-600">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Continue Learning Button */}
          <Link 
            to={`/learn/${enrollment._id}`} 
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all text-center shadow-lg shadow-blue-100 active:scale-[0.98]"
          >
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;
