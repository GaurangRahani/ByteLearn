import React from 'react';

import { BookOpen, ClipboardCheck, Award } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Structured Courses',
    description: 'Learn with well-organized modules, video lessons, and comprehensive materials designed by expert educators.'
  },
  {
    icon: ClipboardCheck,
    title: 'Assignments & Quizzes',
    description: 'Test your knowledge with interactive quizzes and submit assignments for personalized feedback.'
  },
  {
    icon: Award,
    title: 'Earn Certificates',
    description: 'Complete courses and earn verified certificates to showcase your skills and achievements.'
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
          Why Choose ByteLearn?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-slate-100 p-10 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-blue-50 text-blue-600 rounded-full p-5 mb-6 aspect-square flex items-center justify-center">
                  <Icon className="h-8 w-8" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
