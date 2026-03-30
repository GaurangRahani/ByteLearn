import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { ArrowRight } from 'lucide-react';

const ContinueLearningSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockData = [
        { id: 1, title: 'Introduction to Web Development', instructor: 'Dr. Sarah Smith', duration: '8', progress: 65 },
        { id: 2, title: 'Advanced React Development', instructor: 'Dr. Sarah Smith', duration: '12', progress: 25 },
      ];
      
      setCourses(mockData);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Continue Learning</h2>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-white border border-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-bold text-slate-800">Continue Learning</h2>
        <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
          View All <ArrowRight size={14} />
        </button>
      </div>
      
      <div className="px-6 pb-6 space-y-4">
        {courses.map(course => (
          <CourseCard 
            key={course.id}
            title={course.title}
            instructor={course.instructor}
            duration={course.duration}
            progress={course.progress}
          />
        ))}
      </div>
    </div>
  );
};

export default ContinueLearningSection;
