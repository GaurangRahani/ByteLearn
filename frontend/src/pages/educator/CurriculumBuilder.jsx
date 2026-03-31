import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowLeft,
  Loader2,
  BookOpen,
  CheckCircle2,
  Video,
  FileText,
  Paperclip,
  X,
  Type,
  UploadCloud,
  FileUp,
  Check
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';

const CurriculumBuilder = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  // App States
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [educatorName, setEducatorName] = useState('Educator');

  // UI States
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [moduleLessons, setModuleLessons] = useState({}); // { moduleId: [lessons] }
  const [loadingLessons, setLoadingLessons] = useState(false);

  // States for adding module
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isSavingModule, setIsSavingModule] = useState(false);

  // States for adding lesson
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null);
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    content: '',
    video: null,
    attachment: null
  });
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const profileRes = await axios.get('/api/auth/profile', config);
        setEducatorName(profileRes.data?.name || 'Educator');

        const courseRes = await axios.get(`/api/courses/${courseId}`, config);
        setCourse(courseRes.data?.data || courseRes.data);

        const modulesRes = await axios.get(`/api/courses/${courseId}/modules`, config);
        const modulesData = modulesRes.data?.data || modulesRes.data || [];
        setModules(Array.isArray(modulesData) ? modulesData : []);

      } catch (err) {
        console.error("Error fetching curriculum data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  const toggleModule = async (moduleId) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }

    setExpandedModuleId(moduleId);

    // Fetch lessons if not already loaded or if forced
    if (!moduleLessons[moduleId]) {
      try {
        setLoadingLessons(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/courses/${courseId}/modules/${moduleId}/lessons`, config);
        const lessonsData = res.data?.data || res.data || [];
        setModuleLessons(prev => ({ ...prev, [moduleId]: Array.isArray(lessonsData) ? lessonsData : [] }));
      } catch (err) {
        console.error("Error fetching lessons:", err);
      } finally {
        setLoadingLessons(false);
      }
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      setIsSavingModule(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        title: newModuleTitle.trim(),
        order: modules.length + 1
      };

      const res = await axios.post(`/api/courses/${courseId}/modules`, payload, config);
      const newModule = res.data?.data || res.data;

      setModules(prev => [...prev, newModule]);
      setNewModuleTitle('');
      setIsAddingModule(false);
    } catch (err) {
      console.error("Error adding module:", err);
      alert("Failed to add module.");
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!newLessonData.title.trim()) return;

    try {
      setIsSavingLesson(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newLessonData.title.trim());
      formData.append('content', newLessonData.content.trim());
      formData.append('order', (moduleLessons[activeModuleForLesson]?.length || 0) + 1);

      if (newLessonData.video) formData.append('video', newLessonData.video);
      if (newLessonData.attachment) formData.append('attachment', newLessonData.attachment);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.post(`/api/courses/${courseId}/modules/${activeModuleForLesson}/lessons`, formData, config);
      const newLesson = res.data?.data || res.data;

      // Update local state
      setModuleLessons(prev => ({
        ...prev,
        [activeModuleForLesson]: [...(prev[activeModuleForLesson] || []), newLesson]
      }));

      // Reset
      setIsAddingLesson(false);
      setActiveModuleForLesson(null);
      setNewLessonData({ title: '', content: '', video: null, attachment: null });

    } catch (err) {
      console.error("Error saving lesson:", err);
      alert("Failed to save lesson. Ensure title is present and file sizes are within limits.");
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleSubmitReview = async () => {
    const confirmSubmit = window.confirm("Are you sure you want to submit this course for review? You won't be able to edit it until it's reviewed.");
    if (!confirmSubmit) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/courses/${courseId}/submit-review`, {}, config);
      alert("Course submitted successfully! Redirecting to dashboard...");
      navigate('/educator/courses');
    } catch (err) {
      console.error("Error submitting course:", err);
      alert(err.response?.data?.message || "Failed to submit course for review. Ensure you have at least one module.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium tracking-tight">Accessing Curriculum...</p>
      </div>
    );
  }

  const courseTitle = course?.title || 'Course Builder';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <EducatorHeader educatorName={educatorName} activePage="/educator/courses" />

      {/* Sticky Top Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-[64px] z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/educator/courses" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="max-w-[300px] md:max-w-md">
              <h1 className="text-sm font-bold text-slate-800 truncate">{courseTitle}</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Phase 2: Construction</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-white"><Check size={14} /></div>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white ring-4 ring-white font-bold text-xs">2</div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 ring-4 ring-white font-bold text-xs">3</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12 pb-40">

        {/* Module Area Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Curriculum Map</h2>
            <p className="text-slate-500 font-medium">Build your modules and upload your lesson videos.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Modules</p>
                <p className="text-xl font-black text-slate-800 leading-none">{modules.length}</p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={18} /></div>
            </div>
          </div>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-4">
          {modules.map((module, index) => {
            const isExpanded = expandedModuleId === module._id;
            const lessons = moduleLessons[module._id] || [];

            return (
              <div key={module._id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-200 shadow-xl shadow-blue-500/5' : 'border-slate-100 shadow-sm'}`}>

                {/* Module Bar */}
                <div
                  onClick={() => toggleModule(module._id)}
                  className={`p-6 flex items-center justify-between cursor-pointer group transition-colors ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Module {index + 1}</p>
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{module.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full mr-2">{lessons.length} Lessons</span>
                    <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Lessons Content and Addition */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-white p-6 animate-in slide-in-from-top-2 duration-300">

                    {loadingLessons ? (
                      <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-blue-600/30" /></div>
                    ) : lessons.length === 0 ? (
                      <div className="py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 mb-6">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">No lessons yet in this module</p>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6">
                        {lessons.map((lesson, lIndex) => (
                          <div key={lesson._id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                {lesson.videoUrl ? <Video size={18} className="text-blue-500" /> : <FileText size={18} />}
                              </div>
                              <div>
                                <h4 className="text-[15px] font-bold text-slate-700">{lesson.title}</h4>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                  {lesson.videoUrl && <span>Video Content</span>}
                                  {lesson.content && <span> • </span>}
                                  {lesson.content && <span>Reading material</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 shadow-sm bg-white"><Paperclip size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 shadow-sm bg-white"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Lesson UI */}
                    {isAddingLesson && activeModuleForLesson === module._id ? (
                      <div className="bg-slate-50/80 rounded-2xl p-6 border border-blue-100 shadow-inner">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">New Lesson Detail</h4>
                          <button onClick={() => setIsAddingLesson(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleLessonSubmit} className="space-y-6">
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Lesson Title</label>
                            <input
                              type="text"
                              autoFocus
                              required
                              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                              placeholder="e.g. Introduction to component states"
                              value={newLessonData.title}
                              onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Lesson Video</label>
                              <label className="flex flex-col items-center justify-center w-full min-h-[140px] bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                                {newLessonData.video ? (
                                  <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={24} /></div>
                                    <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{newLessonData.video.name}</p>
                                    <button type="button" onClick={(e) => { e.preventDefault(); setNewLessonData({ ...newLessonData, video: null }) }} className="text-[10px] text-red-500 font-bold uppercase mt-2 hover:underline">Change</button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    <p className="text-xs font-bold text-slate-500">Video Content</p>
                                    <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wider">MP4, WebM (Max 100MB)</p>
                                  </div>
                                )}
                                <input type="file" className="hidden" accept="video/*" onChange={(e) => setNewLessonData({ ...newLessonData, video: e.target.files[0] })} />
                              </label>
                            </div>

                            <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Attachment (PDF/Docs)</label>
                              <label className="flex flex-col items-center justify-center w-full min-h-[140px] bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                                {newLessonData.attachment ? (
                                  <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={24} /></div>
                                    <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{newLessonData.attachment.name}</p>
                                    <button type="button" onClick={(e) => { e.preventDefault(); setNewLessonData({ ...newLessonData, attachment: null }) }} className="text-[10px] text-red-500 font-bold uppercase mt-2 hover:underline">Change</button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-10 h-10 mb-3 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    <p className="text-xs font-bold text-slate-500">Resources</p>
                                    <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wider">PDF, ZIP, DOCX</p>
                                  </div>
                                )}
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.zip" onChange={(e) => setNewLessonData({ ...newLessonData, attachment: e.target.files[0] })} />
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Lesson Description / Reading Text</label>
                            <textarea
                              rows="4"
                              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-300 text-sm leading-relaxed"
                              placeholder="You can add full text lessons here if not using video..."
                              value={newLessonData.content}
                              onChange={(e) => setNewLessonData({ ...newLessonData, content: e.target.value })}
                            ></textarea>
                          </div>

                          <div className="flex justify-end pt-4 gap-4">
                            <button
                              type="button"
                              onClick={() => setIsAddingLesson(false)}
                              className="px-6 py-2.5 font-bold text-slate-500 hover:bg-white rounded-xl transition-all"
                            >
                              Discard
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingLesson || !newLessonData.title.trim()}
                              className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-70"
                            >
                              {isSavingLesson ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  Uploading Media...
                                </>
                              ) : (
                                <>
                                  <Save size={18} />
                                  Save Lesson
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveModuleForLesson(module._id);
                          setIsAddingLesson(true);
                        }}
                        className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-blue-600 font-bold text-sm tracking-tight hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={18} /> Add Lesson Content
                      </button>
                    )}

                  </div>
                )}
              </div>
            );
          })}

          {/* Module Addition Bar */}
          {isAddingModule ? (
            <div className="bg-white rounded-3xl border-2 border-blue-500/50 p-8 shadow-2xl shadow-blue-500/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Plus size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Create New Module</h3>
              </div>
              <form onSubmit={handleAddModule}>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Advanced State Management in React"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-lg font-bold text-slate-800 placeholder:text-slate-300 mb-8"
                />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddingModule(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                  <button
                    type="submit"
                    disabled={isSavingModule || !newModuleTitle.trim()}
                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
                  >
                    {isSavingModule ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Module
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingModule(true)}
              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3 group"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
              Add Module Container
            </button>
          )}
        </div>

        {/* Global Progress Action */}
        <div className="mt-24 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><CheckCircle2 size={18} /></div>
            <p className="text-[13px] font-medium italic max-w-[280px]">Your build progress is automatically synchronized with our secure draft vault.</p>
          </div>
          <button
            onClick={handleSubmitReview}
            className="w-full sm:w-auto px-12 py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-900 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95"
          >
            Submit Course for Review
          </button>
        </div>

      </main>
    </div>
  );
};

export default CurriculumBuilder;
