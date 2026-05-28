import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { users as fallbackUsers } from '../../data/mockUsers.js';
import { progressByDepartment as fallbackProgressByDepartment } from '../../data/mockReports.js';
import { getDepartmentDashboard, sendDepartmentReminder } from '../../api/services/assignmentManagement.js';
import { useI18n } from '../../i18n/index.jsx';

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function DepartmentView() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const { t } = useI18n();
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
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const notifyMember = async (userId, customMessage = '') => {
    const payload = {
      userId,
      message: customMessage || t('learnerPages.departmentPages.defaultReminder'),
    };
    try {
      await sendDepartmentReminder(payload);
      showToast(`📬 ${t('learnerPages.departmentPages.toastReminderOk')}`);
    } catch {
      showToast(`📬 ${t('learnerPages.departmentPages.toastReminderMock')}`);
    }
  };

  const tabs = [
    { key: 'overview', label: `📊 ${t('learnerPages.departmentPages.tabOverview')}` },
    { key: 'members', label: `👥 ${t('learnerPages.departmentPages.tabMembers')}` },
    { key: 'reminders', label: `📬 ${t('learnerPages.departmentPages.tabReminders')}` },
  ];

  if (loading) return <AdminLayout title={t('learnerPages.departmentPages.title')}><div className="skeleton skeleton-card" /></AdminLayout>;

  return (
    <AdminLayout title={t('learnerPages.departmentPages.title')}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{f(t('learnerPages.departmentPages.departmentTitle'), { department: user?.department || '' })}</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>{t('learnerPages.departmentPages.role')}</p>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {tabs.map((item) => <button key={item.key} className={`tab${tab === item.key ? ' tab--active' : ''}`} onClick={() => setParams({ tab: item.key })}>{item.label}</button>)}
      </div>

      {tab === 'overview' && <>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-card__label">{t('learnerPages.departmentPages.statMembers')}</div><div className="stat-card__value">{members.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">{t('learnerPages.departmentPages.statCompletion')}</div><div className="stat-card__value">{stats?.completionRate || 0}%</div></div>
          <div className="stat-card"><div className="stat-card__label">{t('learnerPages.departmentPages.statActive')}</div><div className="stat-card__value">{stats?.activeLearners || 0}</div></div>
        </div>
        {members.length === 0 ? <div className="empty-state"><div className="empty-state__icon">👥</div><div className="empty-state__title">{t('learnerPages.departmentPages.emptyMembers')}</div></div>
          : members.map((m) => <div key={m.id} className="card" style={{ marginBottom: 8 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div className="avatar">{m.name.charAt(0)}</div><div><div style={{ fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{f(t('learnerPages.departmentPages.memberMeta'), { level: Math.floor(m.xp / 500) + 1, streak: m.streak, xp: m.xp })}</div></div></div><button className="btn btn--ghost btn--sm" onClick={() => notifyMember(m.id)}>📬 {t('learnerPages.departmentPages.remind')}</button></div></div>)}
      </>}

      {tab === 'members' && <div className="table-wrapper"><table className="table"><thead><tr><th>{t('learnerPages.departmentPages.colName')}</th><th>{t('learnerPages.departmentPages.colLevel')}</th><th>{t('learnerPages.departmentPages.colXp')}</th><th>{t('learnerPages.departmentPages.colStreak')}</th><th>{t('learnerPages.departmentPages.colJoined')}</th><th>{t('learnerPages.departmentPages.colAction')}</th></tr></thead><tbody>{members.map((m) => <tr key={m.id}><td><strong>{m.name}</strong></td><td>{Math.floor(m.xp / 500) + 1}</td><td>{m.xp}</td><td>🔥{m.streak}</td><td>{m.joinedAt}</td><td><button className="btn btn--ghost btn--sm" onClick={() => notifyMember(m.id)}>📬</button></td></tr>)}</tbody></table></div>}

      {tab === 'reminders' && <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 12 }}><label className="input-label">{t('learnerPages.departmentPages.recipient')}</label><select className="input" id="recipient">{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div className="input-group" style={{ marginBottom: 12 }}><label className="input-label">{t('learnerPages.departmentPages.message')}</label><textarea className="input" rows={3} placeholder={t('learnerPages.departmentPages.messagePlaceholder')} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <button className="btn btn--primary btn--full" onClick={() => {
            const select = document.getElementById('recipient');
            notifyMember(select?.value || null, message);
            setMessage('');
          }}>📬 {t('learnerPages.departmentPages.sendReminder')}</button>
        </div>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{t('learnerPages.departmentPages.history')}</h4>
        <div className="card" style={{ marginBottom: 8 }}><div style={{ fontWeight: 700 }}>{f(t('learnerPages.departmentPages.departmentTitle'), { department: user?.department || '' })}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t('learnerPages.departmentPages.sampleHistory')}</div></div>
      </div>}
      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
