import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { users as fallbackUsers } from '../../data/mockUsers.js';
import {
  learnerProgressDetail as fallbackLearnerProgress,
  courseProgressReport as fallbackCourseProgress,
  quizResults as fallbackQuizResults,
  reportSummary as fallbackSummary,
} from '../../data/mockReports.js';
import { conversations as fallbackConversations } from '../../data/mockChats.js';
import { getTrainerReportingDashboard } from '../../api/services/reporting.js';
import { useI18n } from '../../i18n/index.jsx';

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    users: fallbackUsers,
    learnerProgressDetail: fallbackLearnerProgress,
    courseProgressReport: fallbackCourseProgress,
    quizResults: fallbackQuizResults,
    reportSummary: fallbackSummary,
    conversations: fallbackConversations,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getTrainerReportingDashboard();
        if (!mounted) return;
        setData({
          users: response.learners || fallbackUsers,
          learnerProgressDetail: response.learnerProgressDetail || fallbackLearnerProgress,
          courseProgressReport: response.courseProgressReport || fallbackCourseProgress,
          quizResults: response.quizResults || fallbackQuizResults,
          reportSummary: response.reportSummary || fallbackSummary,
          conversations: response.conversations || fallbackConversations,
        });
      } catch {
        // keep fallback
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <AdminLayout title={t('learnerPages.trainerDashboard.title')}><div className="skeleton skeleton-card" /></AdminLayout>;

  const learners = data.users.filter((u) => u.role === 'learner' || !u.role);

  return (
    <AdminLayout title={t('learnerPages.trainerDashboard.title')}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{f(t('learnerPages.trainerDashboard.hello'), { name: user?.name })}</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>{t('learnerPages.trainerDashboard.role')}</p>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[
          { key: 'overview', label: t('learnerPages.trainerDashboard.overview') },
          { key: 'learners', label: t('learnerPages.trainerDashboard.learners') },
          { key: 'chats', label: t('learnerPages.trainerDashboard.chats') },
          { key: 'stats', label: t('learnerPages.trainerDashboard.stats') },
        ].map((tabItem) => <button key={tabItem.key} className={`tab${tab === tabItem.key ? ' tab--active' : ''}`} onClick={() => setParams({ tab: tabItem.key })}>{tabItem.label}</button>)}
      </div>

      {tab === 'overview' && <>
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-card__label">{t('learnerPages.trainerDashboard.learners')}</div><div className="stat-card__value">{learners.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">{t('learnerPages.trainerDashboard.completion')}</div><div className="stat-card__value">{data.reportSummary.completionRate}%</div></div>
          <div className="stat-card"><div className="stat-card__label">{t('learnerPages.trainerDashboard.avgScore')}</div><div className="stat-card__value">{data.reportSummary.averageScore}</div></div>
          <div className="stat-card"><div className="stat-card__label">{t('learnerPages.trainerDashboard.chatSla')}</div><div className="stat-card__value">{data.reportSummary.chatResponseSLA}%</div></div>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t('learnerPages.trainerDashboard.recentLearners')}</h3>
        {data.learnerProgressDetail.slice(0, 5).map((l) => <div key={l.userId} className="card" style={{ marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div className="avatar avatar--sm">{l.userName.charAt(0)}</div><div><div style={{ fontWeight: 700 }}>{l.userName}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{l.department} · {f(t('learnerPages.trainerDashboard.streakDays'), { count: l.streak })}</div></div></div><div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700 }}>{l.avgScore}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{f(t('learnerPages.trainerDashboard.coursesShort'), { done: l.coursesCompleted, total: l.coursesEnrolled })}</div></div></div></div>)}
      </>}

      {tab === 'learners' && <div className="table-wrapper"><table className="table"><thead><tr><th>{t('learnerPages.trainerDashboard.learnersTableName')}</th><th>{t('learnerPages.trainerDashboard.learnersTableDept')}</th><th>{t('learnerPages.trainerDashboard.learnersTableCourses')}</th><th>{t('learnerPages.trainerDashboard.learnersTableScore')}</th><th>{t('learnerPages.trainerDashboard.learnersTableStreak')}</th><th>{t('learnerPages.trainerDashboard.learnersTableLastActive')}</th></tr></thead><tbody>{data.learnerProgressDetail.map((l) => <tr key={l.userId}><td><strong>{l.userName}</strong></td><td>{l.department}</td><td>{l.coursesCompleted}/{l.coursesEnrolled}</td><td>{l.avgScore}</td><td>{f(t('learnerPages.trainerDashboard.streakDays'), { count: l.streak })}</td><td>{l.lastActive}</td></tr>)}</tbody></table></div>}

      {tab === 'chats' && data.conversations.map((conv) => {
        const lid = conv.participants.find((p) => p !== user?.id);
        const l = fallbackUsers.find((u) => u.id === lid);
        const last = conv.messages[conv.messages.length - 1];
        return (
          <div key={conv.id} className="card" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div className="avatar">{l?.name?.charAt(0) || '?'}</div><div><div style={{ fontWeight: 700 }}>{l?.name || conv.groupName}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{last?.text?.slice(0, 60)}</div></div></div>
              <div>{conv.unread > 0 && <span className="badge badge--danger">{conv.unread}</span>} {conv.resolved ? <span className="badge badge--success">{t('learnerPages.trainerDashboard.resolved')}</span> : <span className="badge badge--warning">{t('learnerPages.trainerDashboard.unresolved')}</span>} <button className="btn btn--ghost btn--sm">{t('learnerPages.trainerDashboard.reply')}</button></div>
            </div>
          </div>
        );
      })}

      {tab === 'stats' && <div><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t('learnerPages.trainerDashboard.courseProgress')}</h3>{data.courseProgressReport.map((c) => <div key={c.courseId} className="chart-bar-row"><div className="chart-bar-label">{c.courseName}</div><div className="chart-bar-track"><div className="chart-bar-fill" style={{ width: `${c.avgScore}%`, background: 'var(--color-secondary)' }} /></div><div className="chart-bar-value">{c.avgScore}%</div></div>)}<h3 style={{ fontSize: 16, fontWeight: 700, margin: '20px 0 12px' }}>{t('learnerPages.trainerDashboard.quizResults')}</h3>{data.quizResults.map((q) => <div key={q.quizId} className="chart-bar-row"><div className="chart-bar-label">{q.quizName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{ width: `${q.passRate}%` }} /></div><div className="chart-bar-value">{q.passRate}%</div></div>)}</div>}
    </AdminLayout>
  );
}
