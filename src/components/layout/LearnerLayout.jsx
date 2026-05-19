import { useLocation } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useToast.js';
import { useLessonGuard } from '../../hooks/useLessonGuard.jsx';

const NAV = [
  { to:'/learner/dashboard', icon:'🏠', label:'Trang chủ' },
  { to:'/learner/courses', icon:'📚', label:'Khoá học' },
  { to:'/learner/daily-review', icon:'🔄', label:'Ôn tập' },
  { to:'/learner/chats', icon:'💬', label:'Trò chuyện' },
  { to:'/learner/profile', icon:'👤', label:'Cá nhân' },
];

function isActivePath(pathname, to) {
  return pathname === to || pathname.startsWith(to + '/');
}

export function LearnerBottomNav() {
  const loc = useLocation();
  const { requestNavigate } = useLessonGuard();
  return (
    <nav className="bottom-nav">
      {NAV.map(item => {
        const active = isActivePath(loc.pathname, item.to);
        return (
          <button
            type="button"
            key={item.to}
            onClick={() => { if (!active) requestNavigate(item.to); }}
            className={`bottom-nav__item${active?' bottom-nav__item--active':''}`}
          >
            <span className="bottom-nav__item-icon">{item.icon}</span><span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const SIDEBAR_ITEMS = [
  { section:'Học tập', items:[
    { to:'/learner/dashboard', icon:'🏠', label:'Trang chủ' },
    { to:'/learner/courses', icon:'📚', label:'Lộ trình học' },
    { to:'/learner/explore', icon:'🔍', label:'Khám phá' },
    { to:'/learner/daily-review', icon:'🔄', label:'Ôn tập hàng ngày' },
    { to:'/learner/leaderboard', icon:'🏆', label:'Bảng xếp hạng' },
    { to:'/learner/offline', icon:'📥', label:'Thư viện ngoại tuyến' },
  ]},
  { section:'Kết nối', items:[
    { to:'/learner/chats', icon:'💬', label:'Trò chuyện' },
    { to:'/learner/notifications', icon:'🔔', label:'Thông báo' },
  ]},
  { section:'Khác', items:[
    { to:'/learner/profile', icon:'👤', label:'Hồ sơ' },
    { to:'/learner/settings', icon:'⚙️', label:'Cài đặt' },
  ]},
];

export function LearnerSidebar() {
  const loc = useLocation();
  const { requestNavigate } = useLessonGuard();
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">📚 Starlent</div>
      <nav className="sidebar__nav">
        {SIDEBAR_ITEMS.map(sec => (
          <div key={sec.section}>
            <div className="sidebar__section-title">{sec.section}</div>
            {sec.items.map(item => {
              const active = isActivePath(loc.pathname, item.to);
              return (
                <button
                  type="button"
                  key={item.to}
                  onClick={() => { if (!active) requestNavigate(item.to); }}
                  className={`sidebar__link${active?' sidebar__link--active':''}`}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>{item.label}
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
  return (
    <div className="page">
      {!isOnline && <div className="offline-banner">⚠️ Bạn đang ngoại tuyến — Nội dung đã tải vẫn có thể truy cập</div>}
      {topBar}
      <LearnerSidebar />
      <div className="page__body">{children}</div>
      <LearnerBottomNav />
    </div>
  );
}
