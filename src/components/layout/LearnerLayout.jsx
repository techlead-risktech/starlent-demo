import { useLocation } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useToast.js';
import { useLessonGuard } from '../../hooks/useLessonGuard.jsx';
import { useI18n } from '../../i18n/index.jsx';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';

const ICON = {
  home: '🏠',
  courses: '📚',
  review: '🔄',
  chats: '💬',
  profile: '👤',
  explore: '🔍',
  leaderboard: '🏆',
  offline: '📥',
  notifications: '🔔',
  settings: '⚙️',
  logo: '📚',
  warning: '⚠️',
};

function isActivePath(pathname, to) {
  return pathname === to || pathname.startsWith(to + '/');
}

export function LearnerBottomNav() {
  const loc = useLocation();
  const { requestNavigate } = useLessonGuard();
  const { t } = useI18n();

  const nav = [
    { to: '/learner/dashboard', icon: ICON.home, label: t('nav.learner.home') },
    { to: '/learner/courses', icon: ICON.courses, label: t('nav.learner.courses') },
    { to: '/learner/daily-review', icon: ICON.review, label: t('nav.learner.review') },
    { to: '/learner/chats', icon: ICON.chats, label: t('nav.learner.chats') },
    { to: '/learner/profile', icon: ICON.profile, label: t('nav.learner.profile') },
  ];

  return (
    <nav className="bottom-nav">
      {nav.map((item) => {
        const active = isActivePath(loc.pathname, item.to);
        return (
          <button
            type="button"
            key={item.to}
            onClick={() => {
              if (!active) requestNavigate(item.to);
            }}
            className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
          >
            <span className="bottom-nav__item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function LearnerSidebar() {
  const loc = useLocation();
  const { requestNavigate } = useLessonGuard();
  const { t } = useI18n();

  const sections = [
    {
      section: t('nav.learner.learn'),
      items: [
        { to: '/learner/dashboard', icon: ICON.home, label: t('nav.learner.home') },
        { to: '/learner/courses', icon: ICON.courses, label: t('nav.learner.path') },
        { to: '/learner/explore', icon: ICON.explore, label: t('nav.learner.explore') },
        { to: '/learner/daily-review', icon: ICON.review, label: t('nav.learner.daily') },
        { to: '/learner/leaderboard', icon: ICON.leaderboard, label: t('nav.learner.leaderboard') },
        { to: '/learner/offline', icon: ICON.offline, label: t('nav.learner.offline') },
      ],
    },
    {
      section: t('nav.learner.connect'),
      items: [
        { to: '/learner/chats', icon: ICON.chats, label: t('nav.learner.chats') },
        { to: '/learner/notifications', icon: ICON.notifications, label: t('nav.learner.notifications') },
      ],
    },
    {
      section: t('nav.learner.other'),
      items: [
        { to: '/learner/profile', icon: ICON.profile, label: t('nav.learner.profile') },
        { to: '/learner/settings', icon: ICON.settings, label: t('nav.learner.settings') },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">{ICON.logo} Starlent</div>
      <div style={{ padding: '0 16px 12px' }}>
        <LanguageSwitcher />
      </div>
      <nav className="sidebar__nav">
        {sections.map((sec) => (
          <div key={sec.section}>
            <div className="sidebar__section-title">{sec.section}</div>
            {sec.items.map((item) => {
              const active = isActivePath(loc.pathname, item.to);
              return (
                <button
                  type="button"
                  key={item.to}
                  onClick={() => {
                    if (!active) requestNavigate(item.to);
                  }}
                  className={`sidebar__link${active ? ' sidebar__link--active' : ''}`}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function LearnerLayout({ children, topBar }) {
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  return (
    <div className="page">
      {!isOnline && <div className="offline-banner">{ICON.warning} {t('nav.offlineBannerLearner')}</div>}
      {topBar}
      <LearnerSidebar />
      <div className="page__body">{children}</div>
      <LearnerBottomNav />
    </div>
  );
}



