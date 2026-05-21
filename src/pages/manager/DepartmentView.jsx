import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { users as fallbackUsers } from '../../data/mockUsers.js';
import { progressByDepartment as fallbackProgressByDepartment } from '../../data/mockReports.js';
import { getDepartmentDashboard, sendDepartmentReminder } from '../../api/services/assignmentManagement.js';

export default function DepartmentView() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getDepartmentDashboard();
        if (!mounted) return;
        setMembers(response.members || []);
        setStats(response.stats || null);
      } catch {
        if (!mounted) return;
        setMembers(fallbackUsers.filter((u) => u.department === user?.department && u.role === 'learner'));
        setStats(fallbackProgressByDepartment.find((d) => d.department === user?.department) || null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const notifyMember = async (userId, customMessage = '') => {
    const payload = {
      userId,
      message: customMessage || 'Nhắc hoàn thành khoá học đúng hạn.',
    };
    try {
      await sendDepartmentReminder(payload);
      showToast('📬 Đã gửi nhắc nhở');
    } catch {
      showToast('📬 Đã gửi nhắc nhở (mock)');
    }
  };

  if (loading) return <AdminLayout title="Quản lý phòng ban"><div className="skeleton skeleton-card" /></AdminLayout>;

  return (
    <AdminLayout title="Quản lý phòng ban">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Phòng {user?.department}</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>Vai trò: Quản lý phòng ban</p>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[{ key: 'overview', label: '📊 Tổng quan' }, { key: 'members', label: '👥 Thành viên' }, { key: 'reminders', label: '📬 Nhắc nhở' }].map((t) => <button key={t.key} className={`tab${tab === t.key ? ' tab--active' : ''}`} onClick={() => setParams({ tab: t.key })}>{t.label}</button>)}
      </div>

      {tab === 'overview' && <>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-card__label">Thành viên</div><div className="stat-card__value">{members.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">Hoàn thành</div><div className="stat-card__value">{stats?.completionRate || 0}%</div></div>
          <div className="stat-card"><div className="stat-card__label">Đang học</div><div className="stat-card__value">{stats?.activeLearners || 0}</div></div>
        </div>
        {members.length === 0 ? <div className="empty-state"><div className="empty-state__icon">👥</div><div className="empty-state__title">Chưa có thành viên</div></div>
          : members.map((m) => <div key={m.id} className="card" style={{ marginBottom: 8 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div className="avatar">{m.name.charAt(0)}</div><div><div style={{ fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Cấp {Math.floor(m.xp / 500) + 1} · 🔥{m.streak} · {m.xp} điểm</div></div></div><button className="btn btn--ghost btn--sm" onClick={() => notifyMember(m.id)}>📬 Nhắc</button></div></div>)}
      </>}

      {tab === 'members' && <div className="table-wrapper"><table className="table"><thead><tr><th>Tên</th><th>Cấp</th><th>Điểm kinh nghiệm</th><th>Số ngày học liên tiếp</th><th>Tham gia</th><th>Hành động</th></tr></thead><tbody>{members.map((m) => <tr key={m.id}><td><strong>{m.name}</strong></td><td>{Math.floor(m.xp / 500) + 1}</td><td>{m.xp}</td><td>🔥{m.streak}</td><td>{m.joinedAt}</td><td><button className="btn btn--ghost btn--sm" onClick={() => notifyMember(m.id)}>📬</button></td></tr>)}</tbody></table></div>}

      {tab === 'reminders' && <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 12 }}><label className="input-label">Người nhận</label><select className="input" id="recipient">{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div className="input-group" style={{ marginBottom: 12 }}><label className="input-label">Nội dung</label><textarea className="input" rows={3} placeholder="Nhập nội dung nhắc nhở..." value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <button className="btn btn--primary btn--full" onClick={() => {
            const select = document.getElementById('recipient');
            notifyMember(select?.value || null, message);
            setMessage('');
          }}>📬 Gửi nhắc nhở</button>
        </div>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Lịch sử</h4>
        <div className="card" style={{ marginBottom: 8 }}><div style={{ fontWeight: 700 }}>Phòng {user?.department}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>17/05/2026 - Hoàn thành khoá An toàn thông tin trước 30/05</div></div>
      </div>}
      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
