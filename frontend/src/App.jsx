import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import StudentRegister from './pages/auth/StudentRegister';
import EducatorRegister from './pages/auth/EducatorRegister';
import VerifyOtp from './pages/auth/VerifyOtp';
import EducatorStatus from './pages/auth/EducatorStatus';
import EducatorDashboard from './pages/educator/EducatorDashboard';
import CreateCourse from './pages/educator/CreateCourse';
import MyCourses from './pages/educator/MyCourses';
import CurriculumBuilder from './pages/educator/CurriculumBuilder';
import StudentManagement from './pages/educator/StudentManagement';
import AssignmentReview from './pages/educator/AssignmentReview';
import Login from './pages/auth/Login';
import Header from './components/layout/Header';
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourse from './pages/student/BrowseCourse';
import MyCourse from './pages/student/MyCourse';
import ContinueLearning from './pages/student/continueLearning';
import CourseDetailsPage from './pages/student/CourseDetails';
import UpdateProfile from './pages/student/UpdateProfile';
import ActiveQuiz from './pages/student/ActiveQuiz';
import QuizResultPage from './pages/student/QuizResultPage';
import Assignments from './pages/student/Assignments';
import Quizzes from './pages/student/Quizzes';
import CertificatesPage from './pages/student/CertificatesPage';




import AdminDashboard from './pages/admin/AdminDashboard';
import EducatorApprovals from './pages/admin/EducatorApprovals';
import CourseApprovals from './pages/admin/CourseApprovals';
import UserManagement from './pages/admin/UserManagement';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

const AppContent = () => {
  const location = useLocation();
  const hideGlobalHeader =
    location.pathname.startsWith('/educator') ||
    location.pathname.startsWith('/student-dashboard') ||
    location.pathname.startsWith('/browse') ||
    location.pathname.startsWith('/my-courses') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname.startsWith('/course/') ||
    location.pathname.startsWith('/learn/') ||
    location.pathname.startsWith('/update-profile') ||
    location.pathname.startsWith('/quiz/') ||
    location.pathname.startsWith('/quiz-result') ||
    location.pathname.startsWith('/assignments') ||
    location.pathname.startsWith('/quizzes') ||
    location.pathname.startsWith('/certificates');




  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {!hideGlobalHeader && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Admin Infrastructure */}
          <Route element={<AdminProtectedRoute />}>
             <Route path="/admin-dashboard" element={<AdminDashboard />} />
             <Route path="/admin/educators" element={<EducatorApprovals />} />
             <Route path="/admin/courses" element={<CourseApprovals />} />
             <Route path="/admin/users" element={<UserManagement />} />
          </Route>

          <Route path="/register-student" element={<StudentRegister />} />
          <Route path="/apply-educator" element={<EducatorRegister />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/educator-status" element={<EducatorStatus />} />
          <Route path="/educator-dashboard" element={<EducatorDashboard />} />
          <Route path="/educator/courses" element={<MyCourses />} />
          <Route path="/educator/student-management" element={<StudentManagement />} />
          <Route path="/educator/review/:submissionId" element={<AssignmentReview />} />
          <Route path="/course/create" element={<CreateCourse />} />
          <Route path="/course/:id/curriculum" element={<CurriculumBuilder />} />
          <Route path="/course/:id" element={<CourseDetailsPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/browse" element={<BrowseCourse />} />
          <Route path="/my-courses" element={<MyCourse />} />
          <Route path="/course/:id/learn" element={<ContinueLearning />} />
          <Route path="/learn/:id" element={<ContinueLearning />} />
          <Route path="/quiz/:id" element={<ActiveQuiz />} />
          <Route path="/quiz-result" element={<QuizResultPage />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/certificates" element={<CertificatesPage />} />


          <Route path="/login" element={<Login />} />

        </Routes>
      </main>
    </div>
  );
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
