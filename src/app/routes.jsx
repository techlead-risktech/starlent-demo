import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLE_ROUTES } from '../data/mockUsers.js';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';

// Auth
import LoginPage from '../pages/auth/LoginPage.jsx';
import OnboardingPage from '../pages/auth/OnboardingPage.jsx';

// Learner
import LearnerDashboard from '../pages/learner/LearnerDashboard.jsx';
import LearningPath from '../pages/learner/LearningPath.jsx';
import ExploreLibrary from '../pages/learner/ExploreLibrary.jsx';
import CourseDetail from '../pages/learner/CourseDetail.jsx';
import FlashcardScreen from '../pages/learner/FlashcardScreen.jsx';
import VideoLesson from '../pages/learner/VideoLesson.jsx';
import AudioLesson from '../pages/learner/AudioLesson.jsx';
import QuizScreen from '../pages/learner/QuizScreen.jsx';
import RoleplayScreen from '../pages/learner/RoleplayScreen.jsx';
import ReadingLesson from '../pages/learner/ReadingLesson.jsx';
import AssignmentLesson from '../pages/learner/AssignmentLesson.jsx';
import SurveyLesson from '../pages/learner/SurveyLesson.jsx';
import LiveSessionLesson from '../pages/learner/LiveSessionLesson.jsx';
import QuizResult from '../pages/learner/QuizResult.jsx';
import DailyReview from '../pages/learner/DailyReview.jsx';
import SearchResult from '../pages/learner/SearchResult.jsx';
import ChatList from '../pages/learner/ChatList.jsx';
import ChatTrainer from '../pages/learner/ChatTrainer.jsx';
import Profile from '../pages/learner/Profile.jsx';
import Leaderboard from '../pages/learner/Leaderboard.jsx';
import CertificatePage from '../pages/learner/CertificatePage.jsx';
import OfflineLibrary from '../pages/learner/OfflineLibrary.jsx';
import SettingsPage from '../pages/learner/SettingsPage.jsx';
import NotificationsPage from '../pages/learner/NotificationsPage.jsx';

// Trainer
import TrainerDashboard from '../pages/trainer/TrainerDashboard.jsx';

// Editor
import EditorDashboard from '../pages/editor/EditorDashboard.jsx';
import EditorCourseBuilderPage from '../pages/editor/EditorCourseBuilderPage.jsx';

// Manager
import ManagerDashboard from '../pages/manager/ManagerDashboard.jsx';
import DepartmentView from '../pages/manager/DepartmentView.jsx';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminCourseBuilderPage from '../pages/admin/AdminCourseBuilderPage.jsx';

function RedirectByRole() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={ROLE_ROUTES[user.role] || '/login'} />;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <RedirectByRole /> : <LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Learner routes */}
      <Route path="/learner/dashboard" element={<ProtectedRoute roles={['learner']}><LearnerDashboard /></ProtectedRoute>} />
      <Route path="/learner/courses" element={<ProtectedRoute roles={['learner']}><LearningPath /></ProtectedRoute>} />
      <Route path="/learner/explore" element={<ProtectedRoute roles={['learner']}><ExploreLibrary /></ProtectedRoute>} />
      <Route path="/learner/course/:courseId" element={<ProtectedRoute roles={['learner']}><CourseDetail /></ProtectedRoute>} />
      <Route path="/learner/flashcard/:contentId" element={<ProtectedRoute roles={['learner']}><FlashcardScreen /></ProtectedRoute>} />
      <Route path="/learner/video/:contentId" element={<ProtectedRoute roles={['learner']}><VideoLesson /></ProtectedRoute>} />
      <Route path="/learner/audio/:contentId" element={<ProtectedRoute roles={['learner']}><AudioLesson /></ProtectedRoute>} />
      <Route path="/learner/quiz/:contentId" element={<ProtectedRoute roles={['learner']}><QuizScreen /></ProtectedRoute>} />
      <Route path="/learner/roleplay/:contentId" element={<ProtectedRoute roles={['learner']}><RoleplayScreen /></ProtectedRoute>} />
      <Route path="/learner/reading/:contentId" element={<ProtectedRoute roles={['learner']}><ReadingLesson /></ProtectedRoute>} />
      <Route path="/learner/assignment/:contentId" element={<ProtectedRoute roles={['learner']}><AssignmentLesson /></ProtectedRoute>} />
      <Route path="/learner/survey/:contentId" element={<ProtectedRoute roles={['learner']}><SurveyLesson /></ProtectedRoute>} />
      <Route path="/learner/live-session/:contentId" element={<ProtectedRoute roles={['learner']}><LiveSessionLesson /></ProtectedRoute>} />
      <Route path="/learner/quiz-result" element={<ProtectedRoute roles={['learner']}><QuizResult /></ProtectedRoute>} />
      <Route path="/learner/daily-review" element={<ProtectedRoute roles={['learner']}><DailyReview /></ProtectedRoute>} />
      <Route path="/learner/search" element={<ProtectedRoute roles={['learner']}><SearchResult /></ProtectedRoute>} />
      <Route path="/learner/chats" element={<ProtectedRoute roles={['learner']}><ChatList /></ProtectedRoute>} />
      <Route path="/learner/chat/:convId" element={<ProtectedRoute roles={['learner']}><ChatTrainer /></ProtectedRoute>} />
      <Route path="/learner/profile" element={<ProtectedRoute roles={['learner']}><Profile /></ProtectedRoute>} />
      <Route path="/learner/leaderboard" element={<ProtectedRoute roles={['learner']}><Leaderboard /></ProtectedRoute>} />
      <Route path="/learner/certificate/:certId" element={<ProtectedRoute roles={['learner']}><CertificatePage /></ProtectedRoute>} />
      <Route path="/learner/offline" element={<ProtectedRoute roles={['learner']}><OfflineLibrary /></ProtectedRoute>} />
      <Route path="/learner/settings" element={<ProtectedRoute roles={['learner']}><SettingsPage /></ProtectedRoute>} />
      <Route path="/learner/notifications" element={<ProtectedRoute roles={['learner']}><NotificationsPage /></ProtectedRoute>} />

      {/* Trainer */}
      <Route path="/trainer/dashboard" element={<ProtectedRoute roles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />

      {/* Editor */}
      <Route path="/editor/dashboard" element={<ProtectedRoute roles={['editor']}><EditorDashboard /></ProtectedRoute>} />
      <Route path="/editor/courses/:courseId/builder" element={<ProtectedRoute roles={['editor']}><EditorCourseBuilderPage /></ProtectedRoute>} />

      {/* Manager */}
      <Route path="/manager/dashboard" element={<ProtectedRoute roles={['learning_manager']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/department" element={<ProtectedRoute roles={['dept_manager','learning_manager']}><DepartmentView /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/courses/:courseId/builder" element={<ProtectedRoute roles={['admin']}><AdminCourseBuilderPage /></ProtectedRoute>} />

      <Route path="*" element={<RedirectByRole />} />
    </Routes>
  );
}
