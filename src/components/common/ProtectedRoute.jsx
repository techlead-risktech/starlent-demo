import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useI18n } from '../../i18n/index.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="empty-state" style={{ minHeight: '100vh' }}>
        <div className="empty-state__icon">🔒</div>
        <div className="empty-state__title">{t('common.forbidden')}</div>
      </div>
    );
  }

  return children;
}
