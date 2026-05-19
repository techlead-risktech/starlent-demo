import { AuthProvider } from '../hooks/useAuth.jsx';
import { LessonGuardProvider } from '../hooks/useLessonGuard.jsx';
import AppRoutes from './routes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <LessonGuardProvider>
        <AppRoutes />
      </LessonGuardProvider>
    </AuthProvider>
  );
}
