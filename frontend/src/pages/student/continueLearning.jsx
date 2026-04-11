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
import LessonViewer from '../../components/common/LessonViewer';


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
  const [submissions, setSubmissions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);

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
        const subData = res.data.data.submissions || [];
        const quizAttemptData = res.data.data.quizAttempts || [];

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
        setSubmissions(subData);
        setQuizAttempts(quizAttemptData);
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

  const toggleCompletion = async (itemId, extraData = null) => {
    try {
      const { currentItem } = getActiveItemDetails();
      if (!currentItem) return;

      const token = localStorage.getItem('token');
      
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
        if (extraData?.progress) {
            const progressData = extraData.progress;
            const newCompletions = {};
            if (progressData.completedLessons) progressData.completedLessons.forEach(cId => newCompletions[cId] = true);
            if (progressData.completedAssignments) progressData.completedAssignments.forEach(cId => newCompletions[cId] = true);
            if (progressData.completedQuizzes) progressData.completedQuizzes.forEach(cId => newCompletions[cId] = true);
            
            setCompletions(newCompletions);
            if (extraData.submission) {
               setSubmissions(prev => [...prev, extraData.submission]);
            }
            if (extraData.quizAttempt) {
               setQuizAttempts(prev => [...prev, extraData.quizAttempt]);
            }
            
            setCourse(prev => ({
                ...prev,
                modules: enrichCourseWithLocks(prev.modules, newCompletions)
            }));
        } else {
            const newCompletions = { ...completions, [itemId]: true };
            setCompletions(newCompletions);
            setCourse(prev => ({
                ...prev,
                modules: enrichCourseWithLocks(prev.modules, newCompletions)
            }));
        }
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

  const flattenedItems = course?.modules.reduce((acc, mod) => {
    return [...acc, ...mod.items];
  }, []) || [];

  const currentIndex = flattenedItems.findIndex(it => it.id === activeItemId);

  const handleNext = () => {
    if (currentIndex < flattenedItems.length - 1) {
      const nextItem = flattenedItems[currentIndex + 1];
      if (nextItem.isUnlocked) {
        setActiveItemId(nextItem.id);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevItem = flattenedItems[currentIndex - 1];
      setActiveItemId(prevItem.id);
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
                <LessonViewer 
                  currentItem={currentItem}
                  handleNext={handleNext}
                  handlePrev={handlePrev}
                  toggleCompletion={toggleCompletion}
                  isCompleted={completions[currentItem.id]}
                  isDownloading={isDownloading}
                  handleDownloadPDF={handleDownloadPDF}
                  hasPrev={currentIndex > 0}
                  hasNext={currentIndex < flattenedItems.length - 1}
                  nextUnlocked={flattenedItems[currentIndex + 1]?.isUnlocked}
                />
              )}

              {currentItem?.type === 'assignment' && (
                <AssignmentViewer
                  assignment={currentItem}
                  courseId={course._id}
                  existingSubmission={submissions.find(sub => sub.assignmentId === currentItem.id)}
                  onComplete={(data) => toggleCompletion(currentItem.id, data)}
                />
              )}

              {currentItem?.type === 'quiz' && (
                <QuizViewer 
                  quizId={currentItem.id} 
                  courseId={course._id}
                  existingAttempt={quizAttempts.find(att => att.quizId === currentItem.id)}
                  onComplete={(data) => toggleCompletion(currentItem.id, { progress: data.progress, quizAttempt: data.data })}
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
