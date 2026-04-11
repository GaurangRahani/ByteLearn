import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardHeader from '../../components/layout/DashboardHeader';
import {
  PlayCircle,
  CheckCircle,
  Circle,
  FileText,
  HelpCircle,
  Download,
  Upload,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import AssignmentViewer from '../../components/common/AssignmentViewer';
import CustomVideoPlayer from '../../components/common/CustomVideoPlayer';
import QuizViewer from '../../components/common/QuizViewer';


const isImage = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const enrichCourseWithLocks = (modules, completions) => {
  let globalLockActive = false; 

  return modules.map((mod) => {
    const sortedItems = [...mod.items].sort((a, b) => (a.order || 0) - (b.order || 0));

    const enrichedItems = sortedItems.map((item) => {
      const isUnlocked = !globalLockActive;
      
      const isCompleted = !!completions[item.id];
      

      if (!isCompleted) {
        globalLockActive = true;
      }
      
      return { ...item, isUnlocked, isCompleted };
    });

    return { 
      ...mod, 
      items: enrichedItems, 
      isUnlocked: enrichedItems.length > 0 ? enrichedItems[0].isUnlocked : !globalLockActive 
    };
  });
};

const ContinueLearning = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [completions, setCompletions] = useState({});
  const [activeItemId, setActiveItemId] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get(`/api/courses/learn/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const courseData = res.data.data.course;
        const progressData = res.data.data.progress;

        const formattedModules = (courseData.modules || []).map((mod) => {
          const items = [];
          if (mod.lessons) {
             mod.lessons.forEach(l => items.push({ ...l, type: l.videoUrl ? 'video' : 'text', id: l._id }));
          }
          if (mod.assignments) {
             mod.assignments.forEach(a => items.push({ ...a, type: 'assignment', id: a._id }));
          }
          if (mod.quizzes) {
             mod.quizzes.forEach(q => items.push({ ...q, type: 'quiz', id: q._id }));
          }
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          return {
             id: mod._id,
             title: mod.title,
             items
          };
        });

        courseData.modules = formattedModules;
        setCourse(courseData);

        const newCompletions = {};
        if (progressData) {
            if (progressData.completedLessons) {
                progressData.completedLessons.forEach(cId => newCompletions[cId] = true);
            }
            if (progressData.completedAssignments) {
                progressData.completedAssignments.forEach(cId => newCompletions[cId] = true);
            }
            if (progressData.completedQuizzes) {
                progressData.completedQuizzes.forEach(cId => newCompletions[cId] = true);
            }
        }
        setCompletions(newCompletions);

        // Apply Unlocking Algorithm
        courseData.modules = enrichCourseWithLocks(formattedModules, newCompletions);
        setCourse(courseData);

        let firstItemId = null;
        for (const mod of formattedModules) {
          if (mod.items && mod.items.length > 0) {
            firstItemId = mod.items[0].id;
            break;
          }
        }
        if (firstItemId) {
          setActiveItemId(firstItemId);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.response?.data?.message || 'Failed to fetch course content.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
       fetchCourseData();
    }
  }, [id, navigate]);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      const { currentItem } = getActiveItemDetails();
      if (!currentItem || currentItem.type !== 'quiz') {
        setQuizHistory([]);
        return;
      }

      try {
        setIsHistoryLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/quiz-attempts/history/${currentItem.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizHistory(res.data);
      } catch (err) {
        console.error("Error fetching quiz history:", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchQuizHistory();
  }, [activeItemId]);

  useEffect(() => {
    if (!course) return;

    let totalItems = 0;
    let completedItems = 0;

    course.modules.forEach(mod => {
      mod.items.forEach(item => {
        totalItems++;
        if (completions[item.id]) {
          completedItems++;
        }
      });
    });

    const calculatedProgress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    setProgressPercentage(calculatedProgress);

  }, [completions, course]);

  const toggleCompletion = async (itemId) => {
    try {
      const { currentItem } = getActiveItemDetails();
      if (!currentItem) return;

      const token = localStorage.getItem('token');
      
      // If it's a lesson (text/video), we mark it complete on the backend
      if (currentItem.type === 'text' || currentItem.type === 'video') {
        const res = await axios.patch(`/api/courses/learn/${id}/complete-lesson`, 
          { lessonId: itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
           const progressData = res.data.progress;
           const newCompletions = {};
           if (progressData.completedLessons) progressData.completedLessons.forEach(cId => newCompletions[cId] = true);
           if (progressData.completedAssignments) progressData.completedAssignments.forEach(cId => newCompletions[cId] = true);
           if (progressData.completedQuizzes) progressData.completedQuizzes.forEach(cId => newCompletions[cId] = true);
           
           setCompletions(newCompletions);
           setCourse(prev => ({
             ...prev,
             modules: enrichCourseWithLocks(prev.modules, newCompletions)
           }));
        }
      } else {
        // For Quizzes and Assignments, the respective components handle backend sync
        // and tell us to update our local state via onComplete
        const newCompletions = { ...completions, [itemId]: true };
        setCompletions(newCompletions);
        setCourse(prev => ({
          ...prev,
          modules: enrichCourseWithLocks(prev.modules, newCompletions)
        }));
      }
    } catch (err) {
      console.error("Error updating completion status:", err);
      alert("Failed to update progress. Please try again.");
    }
  };

  const getActiveItemDetails = () => {
    if (!course) return null;
    let currentModule = null;
    let currentItem = null;
    let itemIndex = -1;
    let moduleIndex = -1;

    for (let i = 0; i < course.modules.length; i++) {
      const mod = course.modules[i];
      const idx = mod.items.findIndex(it => it.id === activeItemId);
      if (idx !== -1) {
        currentModule = mod;
        currentItem = mod.items[idx];
        itemIndex = idx;
        moduleIndex = i;
        break;
      }
    }

    return { currentModule, currentItem, moduleIndex, itemIndex };
  };

  const handleDownloadPDF = async (url, title) => {
    if (!url) {
      alert('No PDF available for this assignment.');
      return;
    }
    
    try {
      setIsDownloading(true);
      
      let downloadUrl = url;
      if (url.includes('cloudinary.com')) {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/courses/download-url', 
          { fileUrl: url },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data && res.data.downloadUrl) {
          downloadUrl = res.data.downloadUrl;
        }
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${title?.replace(/\s+/g, '_')}_Assignment.pdf` || 'Assignment.pdf');
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error initiating download:', err);
      alert('Failed to authorize PDF download. Please try again or contact support.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || (!course && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DashboardHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DashboardHeader />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const { currentModule, currentItem } = getActiveItemDetails();

  const getIconForType = (type, isCompleted, isActive) => {
    if (isCompleted) {
      return <CheckCircle size={18} className={`${isActive ? 'text-white' : 'text-emerald-500'}`} />;
    }
    if (type === 'text' || type === 'video') {
      return type === 'video' ? <PlayCircle size={18} className={`${isActive ? 'text-white' : 'text-slate-400'}`} /> : <FileText size={18} className={`${isActive ? 'text-white' : 'text-slate-400'}`} />;
    }
    if (type === 'assignment') {
      return <FileText size={18} className={`${isActive ? 'text-white' : 'text-amber-500'}`} />;
    }
    if (type === 'quiz') {
      return <HelpCircle size={18} className={`${isActive ? 'text-white' : 'text-purple-500'}`} />;
    }
    return <Circle size={18} className="text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-16">
      <DashboardHeader />

      <main className="flex-grow max-w-[1400px] w-full mx-auto px-6 py-8">

        {/* Course Title and Progress Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-slate-800 mb-4 tracking-tight">
            {course.title}
          </h1>
          <div className="flex items-center gap-4 max-w-2xl">
            <div className="flex-grow h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-600 w-24">
              {progressPercentage}% Complete
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="lg:w-[32%] flex-shrink-0">
            <div className="bg-white border text-base border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-6">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 text-lg">Course Content</h2>
              </div>

              <div className="max-h-[calc(100vh-250px)] overflow-y-auto hidden-scrollbar pb-4 p-2">
                {course.modules.map((mod, index) => (
                  <div key={mod.id} className="mb-4 last:mb-0">
                    <h3 className="font-semibold text-slate-800 text-[15px] px-3 py-2 mb-1">
                      Module {index + 1}: {mod.title}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {mod.items.map((item) => {
                        const isActive = activeItemId === item.id;
                        const isCompleted = completions[item.id];
                        const isUnlocked = item.isUnlocked;

                        return (
                          <button
                            key={item.id}
                            onClick={() => isUnlocked && setActiveItemId(item.id)}
                            disabled={!isUnlocked}
                            className={`w-full text-left flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : isUnlocked 
                                  ? 'hover:bg-slate-50 text-slate-700' 
                                  : 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/50'
                              } ${!isUnlocked ? 'pointer-events-none' : ''}`}
                          >
                            <div className="flex items-center gap-3 pr-2">
                              <div className="flex-shrink-0">
                                {!isUnlocked ? (
                                  <Lock size={16} className="text-slate-400" />
                                ) : (
                                  getIconForType(item.type, isCompleted, isActive)
                                )}
                              </div>
                              <span className={`text-[14.5px] font-medium truncate ${isActive ? 'text-white' : isUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                                {item.title}
                              </span>
                            </div>

                            {isUnlocked && (item.type === 'text' || item.type === 'video') && item.duration && (
                              <span className={`text-[12px] font-medium flex-shrink-0 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                {item.duration}
                              </span>
                            )}
                            
                            {!isUnlocked && (
                               <div className="flex-shrink-0">
                                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                               </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-[68%] flex flex-col gap-6">

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">

              {(currentItem?.type === 'text' || currentItem?.type === 'video') && (
                <>
                  {currentItem.type === 'video' && (
                    <CustomVideoPlayer videoUrl={currentItem.videoUrl} title={currentItem.title} />
                  )}

                  {/* Lesson Content details */}
                  <div className="p-8 flex-grow flex flex-col">
                    <h2 className="text-[32px] font-bold text-slate-800 mb-6 tracking-tight leading-tight">
                      {currentItem.title}
                    </h2>
                    
                    <div 
                      className="text-slate-600 leading-relaxed text-[17px] space-y-4 prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentItem.content }}
                    />

                    {currentItem.attachmentUrl && (
                      <div className="mt-10 pt-8 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">
                          Lesson Attachment
                        </h3>
                        {isImage(currentItem.attachmentUrl) ? (
                          <div className="flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <img 
                              src={currentItem.attachmentUrl} 
                              alt={currentItem.title} 
                              className="max-w-full h-auto rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                            />
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleDownloadPDF(currentItem.attachmentUrl, currentItem.title)}
                            className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 hover:bg-white hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-700 rounded-xl transition-all font-semibold shadow-sm group"
                          >
                            <Download size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <span>Download Resource Materials</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-10 flex border-t border-slate-100 items-center justify-between">
                      <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
                        <ChevronLeft size={16} /> Previous
                      </button>
                      <button
                        onClick={() => toggleCompletion(currentItem.id)}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${completions[currentItem.id]
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                          }`}
                      >
                        {completions[currentItem.id] ? <><CheckCircle size={18} /> Completed</> : 'Mark as Complete'}
                      </button>
                      <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {currentItem?.type === 'assignment' && (
                <AssignmentViewer
                  assignment={currentItem}
                  courseId={course._id}
                  onComplete={() => toggleCompletion(currentItem.id)}
                />
              )}

              {currentItem?.type === 'quiz' && (
                <QuizViewer 
                  quizId={currentItem.id} 
                  onComplete={() => toggleCompletion(currentItem.id)}
                />
              )}


            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ContinueLearning;
