import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  User, 
  Users, 
  Star, 
  Clock, 
  FileText, 
  HelpCircle, 
  BookOpen 
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err.response?.data?.message || 'Failed to fetch course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyCourse = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);

      if (course.isPaid) {
        const res = await loadRazorpayScript();
        if (!res) {
          alert("Razorpay SDK failed to load. Are you online?");
          return;
        }

        const orderResponse = await axios.post('/api/payment/checkout', { courseId: id }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { order } = orderResponse.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "ByteLearn LMS",
          description: `Enrollment for ${course.title}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyResponse = await axios.post('/api/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (verifyResponse.data.success) {
                alert("Payment successful! You are now enrolled.");
                navigate('/my-courses');
              }
            } catch (err) {
              console.error("Verification failed:", err);
              alert(err.response?.data?.message || "Payment verification failed. Please contact support.");
            }
          },
          theme: {
            color: "#2563EB",
          },
          modal: {
            ondismiss: function() {
              setEnrolling(false);
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        await axios.post('/api/enrollments/enroll', { courseId: id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Enrolled successfully!"); 
        navigate('/my-courses');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        alert(err.response?.data?.message || 'Failed to enroll');
      }
    } finally {
      if (!course.isPaid) {
        setEnrolling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DashboardHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
       <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DashboardHeader />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error || 'Course not found'}</p>
          <Link to="/browse" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-16">
      <DashboardHeader />
      
      <main className="flex-grow max-w-[1240px] w-full mx-auto px-6 py-8">
        
        <Link to="/browse" className="inline-flex items-center text-slate-500 hover:text-blue-600 text-[15px] font-medium mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Browse
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-[70%] flex flex-col gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-[32px] font-bold text-slate-800 tracking-tight leading-tight pr-4">
                  {course.title}
                </h1>
                <div className="mt-1 flex-shrink-0">
                  {course.isPaid ? (
                    <span className="bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-lg text-sm border border-blue-100">
                      ${course.price}
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-4 py-1.5 rounded-lg text-sm border border-emerald-100">
                      Free
                    </span>
                  )}
                </div>
              </div>
              
              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-6 text-slate-500 text-[15px]">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-slate-400" />
                  <span>{course.educatorId?.name || 'Unknown Educator'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  <span>{course.enrolledStudents || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                  <span>{course.rating || '4.8'}</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">About This Course</h2>
              <div className="text-slate-600 text-[15.5px] leading-relaxed whitespace-pre-wrap">
                {course.description}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Course Content</h2>
              
              {course.modules && course.modules.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {course.modules.map((module, index) => (
                    <div key={module._id} className="border border-slate-200 rounded-xl p-5 mb-1 transition-all">
                      {/* Module Header */}
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 text-[16px]">
                          Module {index + 1}: {module.title}
                        </h3>
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[13px] font-medium">
                          {module.lessons?.length || 0} lessons
                        </span>
                      </div>
                      
                       {/* Sub Items (Lessons) */}
                      <div className="flex flex-col gap-0.5 mt-2">
                        {module.lessons && module.lessons.map((lesson) => (
                          <div key={lesson._id} className="flex items-center justify-between py-2 text-slate-600">
                            <div className="flex items-center gap-3 flex-grow">
                              <Clock size={16} className="text-slate-400 flex-shrink-0" />
                              <span className="text-[14.5px] font-medium text-slate-600">{lesson.title}</span>
                            </div>
                            {/* Duration mock */}
                            <span className="text-[14px] text-slate-500 font-medium pl-4">{lesson.duration ? `${Math.floor(lesson.duration)}:00` : '15:30'}</span>
                          </div>
                        ))}

                        {/* Assignments */}
                        {module.assignments && module.assignments.length > 0 && (
                          <div className="mt-2 flex flex-col gap-2">
                            {module.assignments.map((assignment) => (
                              <div key={assignment._id} className="flex items-center gap-3 ml-2">
                                <span className="flex items-center gap-2.5 text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold border border-amber-100/50 w-max tracking-tight">
                                  <FileText size={15} /> {assignment.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quizzes */}
                        {module.quizzes && module.quizzes.length > 0 && (
                          <div className="mt-2 flex flex-col gap-2">
                            {module.quizzes.map((quiz) => (
                              <div key={quiz._id} className="flex items-center gap-3 ml-2">
                                <span className="flex items-center gap-2.5 text-purple-600 bg-purple-50 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold border border-purple-100/50 w-max tracking-tight">
                                  <HelpCircle size={15} /> {quiz.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-[15px]">No modules available for this course.</p>
              )}
            </div>

          </div>

          <div className="lg:w-[30%] relative">
             <div className="sticky top-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  {/* Thumbnail Cover Image */}
                  <div className="w-full h-[220px] bg-slate-100 relative rounded-xl overflow-hidden mb-6">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-400">
                        <BookOpen size={48} className="opacity-20" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Layout */}
                  <div className="px-2 pb-2 mt-2">
                     <button 
                       onClick={handleBuyCourse}
                       disabled={enrolling}
                       className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all mb-8 text-[15px]"
                     >
                       {enrolling ? 'Processing...' : (course.isPaid ? 'Buy Now' : 'Enroll Now')}
                     </button>
                     
                     <div className="mb-2">
                        <h4 className="font-bold text-slate-800 text-[15px] mb-4">This course includes:</h4>
                        
                        <div className="flex flex-col gap-3.5">
                           <div className="flex items-center gap-3 text-slate-600">
                             <BookOpen size={18} className="text-blue-500 flex-shrink-0" />
                             <span className="text-[14px] font-medium">{course.modules?.length || 0} modules with video lessons</span>
                           </div>
                           
                           <div className="flex items-center gap-3 text-slate-600">
                             <FileText size={18} className="text-amber-500 flex-shrink-0" />
                             <span className="text-[14px] font-medium">Assignments with feedback</span>
                           </div>
                           
                           <div className="flex items-center gap-3 text-slate-600">
                             <HelpCircle size={18} className="text-purple-500 flex-shrink-0" />
                             <span className="text-[14px] font-medium">Quizzes to test your knowledge</span>
                           </div>
                           
                           <div className="flex items-center gap-3 text-slate-600 pb-2">
                             <div className="bg-[#118A51] text-white text-[12px] font-bold px-2 py-1 rounded w-max flex-shrink-0 tracking-wide">
                               Certificate
                             </div>
                             <span className="text-[14px] font-medium">upon completion</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;
