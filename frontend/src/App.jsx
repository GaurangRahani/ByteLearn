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
import Login from './pages/auth/Login';
import Header from './components/layout/Header';
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourse from './pages/student/BrowseCourse';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CourseDetailsPage from './pages/student/CourseDetails';
import UpdateProfile from './pages/student/UpdateProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import EducatorApprovals from './pages/admin/EducatorApprovals';
import CourseApprovals from './pages/admin/CourseApprovals';
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
    location.pathname.startsWith('/update-profile');

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
          </Route>

          <Route path="/register-student" element={<StudentRegister />} />
          <Route path="/apply-educator" element={<EducatorRegister />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/educator-status" element={<EducatorStatus />} />
          <Route path="/educator-dashboard" element={<EducatorDashboard />} />
          <Route path="/educator/courses" element={<MyCourses />} />
          <Route path="/course/create" element={<CreateCourse />} />
          <Route path="/course/:id/curriculum" element={<CurriculumBuilder />} />
          <Route path="/course/:id" element={<CourseDetailsPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/browse" element={<BrowseCourse />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
