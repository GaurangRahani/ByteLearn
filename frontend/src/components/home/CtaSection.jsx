import React from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section className="py-16 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-xl py-20 px-8 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-blue-100 text-lg mb-10 font-medium">
            Join our community of learners and start your educational journey today.
          </p>
          <Link to="/register-student" className="inline-block bg-white text-slate-900 font-semibold px-8 py-3 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
