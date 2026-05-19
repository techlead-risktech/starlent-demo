import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useOnlineStatus } from '../../hooks/useToast.js';

const SIDEBARS = {
  admin: [
    { to:'/admin/dashboard', icon:'📊', label:'Tổng quan' },
    { to:'/admin/dashboard?tab=users', icon:'👥', label:'Người dùng' },
    { to:'/admin/dashboard?tab=courses', icon:'📚', label:'Khoá học' },
    { to:'/admin/dashboard?tab=reports', icon:'📈', label:'Báo cáo' },
    { to:'/admin/dashboard?tab=certificates', icon:'🎓', label:'Chứng chỉ' },
    { to:'/admin/dashboard?tab=audit', icon:'📋', label:'Nhật ký' },
    { to:'/admin/dashboard?tab=settings', icon:'⚙️', label:'Cài đặt' },
  ],
  trainer: [
    { to:'/trainer/dashboard', icon:'📊', label:'Tổng quan' },
    { to:'/trainer/dashboard?tab=learners', icon:'👥', label:'Học viên' },
    { to:'/trainer/dashboard?tab=chats', icon:'💬', label:'Trò chuyện' },
    { to:'/trainer/dashboard?tab=stats', icon:'📈', label:'Thống kê' },
  ],
  editor: [
    { to:'/editor/dashboard', icon:'📊', label:'Tổng quan' },
    { to:'/editor/dashboard?tab=courses', icon:'📚', label:'Khoá học' },
    { to:'/editor/dashboard?tab=content', icon:'📝', label:'Nội dung' },
    { to:'/editor/dashboard?tab=publish', icon:'✅', label:'Xuất bản' },
  ],
  learning_manager: [
    { to:'/manager/dashboard', icon:'📊', label:'Tổng quan' },
    { to:'/manager/dashboard?tab=assign', icon:'📋', label:'Gán khoá học' },
    { to:'/manager/dashboard?tab=reports', icon:'📈', label:'Báo cáo' },
    { to:'/manager/dashboard?tab=certificates', icon:'🎓', label:'Chứng chỉ' },
    { to:'/manager/dashboard?tab=groups', icon:'👥', label:'Nhóm học' },
  ],
  dept_manager: [
    { to:'/manager/department', icon:'📊', label:'Tổng quan' },
    { to:'/manager/department?tab=members', icon:'👥', label:'Thành viên' },
    { to:'/manager/department?tab=reminders', icon:'📬', label:'Nhắc nhở' },
  ],
};

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const items = SIDEBARS[user?.role] || [];

  return (
    <div className="admin-layout">
      {!isOnline && <div className="offline-banner">⚠️ Bạn đang ngoại tuyến</div>}

      <aside className="sidebar">
        <div className="sidebar__logo">📚 Starlent</div>
        <nav className="sidebar__nav">
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end={!item.to.includes('?')} className={({isActive})=>`sidebar__link${isActive?' sidebar__link--active':''}`}>
              <span className="sidebar__link-icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{padding:16}}>
          <button className="btn btn--ghost btn--full" onClick={()=>{logout();navigate('/login');}}>🚪 Đăng xuất</button>
        </div>
      </aside>

      <div className="topbar hide-desktop">
        <div className="topbar__title">{title||'Starlent'}</div>
        <div className="topbar__actions">
          <span style={{fontSize:14,color:'var(--color-text-muted)'}}>{user?.name}</span>
          <button className="btn btn--ghost btn--sm" onClick={()=>{logout();navigate('/login');}} style={{color:'var(--color-danger)',fontWeight:600}}>🚪</button>
        </div>
      </div>

      <div className="admin-layout__content">{children}</div>

      <nav className="bottom-nav">
        {items.slice(0,5).map(item => (
          <NavLink key={item.to} to={item.to} className="bottom-nav__item">
            <span className="bottom-nav__item-icon">{item.icon}</span><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
