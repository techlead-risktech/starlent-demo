import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return <div className="empty-state" style={{minHeight:'100vh'}}><div className="empty-state__icon">🔒</div><div className="empty-state__title">Không có quyền truy cập</div></div>;
  }
  return children;
}
