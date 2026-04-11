import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Download } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';

const LessonViewer = ({ 
  currentItem, 
  handleNext, 
  handlePrev, 
  toggleCompletion, 
  isCompleted, 
  isDownloading, 
  handleDownloadPDF,
  hasPrev,
  hasNext,
  nextUnlocked
}) => {
  if (!currentItem) return null;

  const isImage = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className="flex flex-col h-full">
      {currentItem.type === 'video' && (
        <CustomVideoPlayer videoUrl={currentItem.videoUrl} title={currentItem.title} />
      )}

      <div className="p-8 flex-grow flex flex-col">
        <h2 className="text-[32px] font-bold text-slate-800 mb-6 tracking-tight leading-tight">
          {currentItem.title}
        </h2>
        
        <div 
          className="text-slate-600 leading-relaxed text-[17px] space-y-4 prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: currentItem.content }}
        />

        {currentItem.notesUrl && (
          <div className="mt-10 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">
              {currentItem.type === 'video' ? 'Lecture Notes' : 'Lesson Visuals'}
            </h3>
            {isImage(currentItem.notesUrl) ? (
              <div className="flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <img 
                  src={currentItem.notesUrl} 
                  alt={currentItem.title} 
                  className="max-w-full h-auto rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              </div>
            ) : (
              <button 
                onClick={() => handleDownloadPDF(currentItem.notesUrl, currentItem.title)}
                disabled={isDownloading}
                className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 hover:bg-white hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-700 rounded-xl transition-all font-semibold shadow-sm group disabled:opacity-50"
              >
                <Download size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span>{isDownloading ? 'Downloading...' : `Download ${currentItem.type === 'video' ? 'Notes' : 'Resources'}`}</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-auto pt-10 flex border-t border-slate-100 items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={!hasPrev}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <button
            onClick={() => toggleCompletion(currentItem.id)}
            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
          >
            {isCompleted ? <><CheckCircle size={18} /> Completed</> : 'Mark as Complete'}
          </button>

          <button 
            onClick={handleNext}
            disabled={!hasNext || !nextUnlocked}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
