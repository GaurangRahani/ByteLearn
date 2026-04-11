import React, { useState } from 'react';
import axios from 'axios';
import { Clock, Download, Upload, CheckCircle, Loader2 } from 'lucide-react';

const AssignmentViewer = ({ assignment, courseId, onComplete, existingSubmission }) => {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(existingSubmission ? "success" : "idle");

  const handleDownloadPDF = (url) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Assignment_File');
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setSubmissionStatus("idle");

    const formData = new FormData();
    formData.append('assignmentId', assignment._id || assignment.id);
    formData.append('courseId', courseId);
    formData.append('file', file);

    if (!courseId || !(assignment._id || assignment.id)) {
      setSubmissionStatus("Missing Course ID or Assignment ID");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/submissions', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSubmissionStatus("success");
      if (onComplete) onComplete({ submission: res.data.data, progress: res.data.progress });
    } catch (error) {
      console.error("Error submitting assignment:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to submit assignment. Please try again.";
      setSubmissionStatus(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 flex flex-col h-full">
      <div className="mb-2">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Assignment Details</span>
      </div>
      <h2 className="text-[32px] font-bold text-slate-800 tracking-tight leading-tight mb-4">
        {assignment.title}
      </h2>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Clock size={16} />
          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Due Date'}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
           Marks: {assignment.totalMarks || 'N/A'}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 flex-shrink-0">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Instructions</h3>
        <p className="text-slate-600 text-[15px] leading-relaxed mb-6 whitespace-pre-wrap">
          {assignment.instructions}
        </p>
        {assignment.questionPdfUrl && (
          <button 
            onClick={() => handleDownloadPDF(assignment.questionPdfUrl)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-semibold transition-all text-[15px] border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
            <Download size={18} />
            Download Assignment PDF
          </button>
        )}
      </div>

      {(existingSubmission?.status === 'graded') ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
             <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
               <span className="text-xl">🎉</span>
             </div>
             <div className="flex-grow">
               <h3 className="font-bold text-emerald-900 text-lg">Graded!</h3>
               <p className="text-emerald-700 font-semibold mb-2">
                 Marks Obtained: {existingSubmission.marksObtained} / {assignment.totalMarks}
               </p>
               {existingSubmission.feedback && (
                 <div className="bg-white/50 p-4 rounded-xl border border-emerald-100 mt-3 text-emerald-800 italic">
                   " {existingSubmission.feedback} "
                 </div>
               )}
               <button 
                  onClick={() => handleDownloadPDF(existingSubmission.fileUrl)}
                  className="mt-4 text-sm font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Download size={14} /> View My Submission
                </button>
             </div>
          </div>
        </div>
      ) : (existingSubmission?.status === 'submitted' || submissionStatus === "success") ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-blue-500 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-blue-900 text-lg">✅ Assignment Submitted</h3>
              <p className="text-blue-700 text-sm mt-1">
                Pending evaluation by educator.
              </p>
              { (existingSubmission?.fileUrl) && (
                <button 
                  onClick={() => handleDownloadPDF(existingSubmission.fileUrl)}
                  className="mt-3 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download size={14} /> View Your Uploaded File
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-100 hover:border-blue-400 mt-auto">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Upload size={28} className="text-blue-600" />
          </div>
          <h3 className="text-[17px] font-bold text-slate-800 mb-2">Upload Completed File</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-6">
            Choose your PDF or Word document to submit.
          </p>
          
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="mb-4 block w-full max-w-xs text-sm text-slate-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-100 file:text-blue-700
              hover:file:bg-blue-200 cursor-pointer"
          />

          {submissionStatus && submissionStatus !== "idle" && submissionStatus !== "success" && (
            <p className="text-red-500 text-sm mb-4 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-100 italic">
              {submissionStatus}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                 Submitting...
              </>
            ) : (
              "Submit Assignment"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignmentViewer;
