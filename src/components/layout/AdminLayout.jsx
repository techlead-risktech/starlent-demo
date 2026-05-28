import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useOnlineStatus } from '../../hooks/useToast.js';
import { useI18n } from '../../i18n/index.jsx';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';

const ICON = {
  overview: '📊',
  users: '👥',
  courses: '📚',
  reports: '📈',
  certificates: '🎓',
  audit: '📋',
  settings: '⚙️',
  chats: '💬',
  content: '📝',
  publish: '✅',
  reminders: '📬',
  logo: '📚',
  warning: '⚠️',
  logout: '🚪',
};

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  const sidebars = {
    admin: [
      { to: '/admin/dashboard', icon: ICON.overview, label: t('nav.roles.overview') },
      { to: '/admin/dashboard?tab=users', icon: ICON.users, label: t('nav.roles.users') },
      { to: '/admin/dashboard?tab=courses', icon: ICON.courses, label: t('nav.learner.courses') },
      { to: '/admin/dashboard?tab=distribution', icon: '📤', label: t('nav.roles.distribution') },
      { to: '/admin/dashboard?tab=tenants', icon: '🏢', label: t('nav.roles.tenants') },
      { to: '/admin/dashboard?tab=reports', icon: ICON.reports, label: t('nav.roles.reports') },
      { to: '/admin/dashboard?tab=certificates', icon: ICON.certificates, label: t('nav.roles.certificates') },
      { to: '/admin/dashboard?tab=audit', icon: ICON.audit, label: t('nav.roles.audit') },
      { to: '/admin/dashboard?tab=settings', icon: ICON.settings, label: t('nav.learner.settings') },
    ],
    trainer: [
      { to: '/trainer/dashboard', icon: ICON.overview, label: t('nav.roles.overview') },
      { to: '/trainer/dashboard?tab=learners', icon: ICON.users, label: t('auth.learner') },
      { to: '/trainer/dashboard?tab=chats', icon: ICON.chats, label: t('nav.roles.chats') },
      { to: '/trainer/dashboard?tab=stats', icon: ICON.reports, label: t('nav.roles.stats') },
    ],
    editor: [
      { to: '/editor/dashboard', icon: ICON.overview, label: t('nav.roles.overview') },
      { to: '/editor/dashboard?tab=courses', icon: ICON.courses, label: t('nav.learner.courses') },
      { to: '/editor/dashboard?tab=content', icon: ICON.content, label: t('nav.roles.content') },
      { to: '/editor/dashboard?tab=publish', icon: ICON.publish, label: t('nav.roles.publish') },
    ],
    learning_manager: [
      { to: '/manager/dashboard', icon: ICON.overview, label: t('nav.roles.overview') },
      { to: '/manager/dashboard?tab=assign', icon: ICON.audit, label: t('nav.roles.assign') },
      { to: '/manager/dashboard?tab=reports', icon: ICON.reports, label: t('nav.roles.reports') },
      { to: '/manager/dashboard?tab=certificates', icon: ICON.certificates, label: t('nav.roles.certificates') },
      { to: '/manager/dashboard?tab=groups', icon: ICON.users, label: t('nav.roles.groups') },
    ],
    dept_manager: [
      { to: '/manager/department', icon: ICON.overview, label: t('nav.roles.overview') },
      { to: '/manager/department?tab=members', icon: ICON.users, label: t('nav.roles.members') },
      { to: '/manager/department?tab=reminders', icon: ICON.reminders, label: t('nav.roles.reminders') },
    ],
  };

  const items = sidebars[user?.role] || [];

  return (
    <div className="admin-layout">
      {!isOnline && <div className="offline-banner">{ICON.warning} {t('nav.offlineBannerAdmin')}</div>}

      <aside className="sidebar">
        <div className="sidebar__logo">{ICON.logo} Starlent</div>
        <nav className="sidebar__nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={!item.to.includes('?')} className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>
              <span className="sidebar__link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 16, display: 'grid', gap: 8 }}>
          <LanguageSwitcher />
          <button className="btn btn--ghost btn--full" onClick={() => { logout(); navigate('/login'); }}>
            {ICON.logout} {t('common.logout')}
          </button>
        </div>
      </aside>

      <div className="topbar hide-desktop">
        <div className="topbar__title">{title || 'Starlent'}</div>
        <div className="topbar__actions">
          <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{user?.name}</span>
          <button className="btn btn--ghost btn--sm" onClick={() => { logout(); navigate('/login'); }} style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
            {ICON.logout}
          </button>
        </div>
      </div>

      <div className="admin-layout__content">{children}</div>

      <nav className="bottom-nav">
        {items.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} className="bottom-nav__item">
            <span className="bottom-nav__item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}



