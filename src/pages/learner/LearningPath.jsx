import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getLearningState } from '../../utils/auth.js';
import { COURSE_STATUS, courses as fallbackCourses, getCourseProgress } from '../../data/mockCourses.js';
import { getLearnerCourses } from '../../api/services/courses.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { PageSkeleton } from '../../components/common/Skeleton.jsx';
import { useI18n } from '../../i18n/index.jsx';

const STATE_SYNC_EVENT = 'starlent:state-sync';
const STATE_SYNC_KEY = 'starlent_state_sync_v1';

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

function buildStatus(t) {
  return {
    DONE: { label: t('learnerPages.learningPath.done'), color: 'var(--color-success)', icon: '✅' },
    INPROGRESS: { label: t('learnerPages.learningPath.inProgress'), color: 'var(--color-secondary)', icon: '📖' },
    NEXT: { label: t('learnerPages.learningPath.next'), color: 'var(--color-primary)', icon: '🚀' },
    LOCKED: { label: t('learnerPages.learningPath.upcoming'), color: 'var(--color-text-muted)', icon: '🔒' },
  };
}

function getStatus(progress, isNext) {
  if (progress === 100) return 'DONE';
  if (progress > 0) return 'INPROGRESS';
  if (isNext) return 'NEXT';
  return 'LOCKED';
}

function CourseMilestone({ course, progress, status, onClick, isLast, statusMap, t, locale }) {
  const s = statusMap[status];
  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      <div className="roadmap-rail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <div className="roadmap-rail__circle" style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: status === 'LOCKED' ? 'var(--color-divider)' : s.color, color: '#fff', boxShadow: status === 'NEXT' ? '0 0 0 4px rgba(255,107,53,0.2)' : 'none' }}>{s.icon}</div>
        {!isLast && <div style={{ flex: 1, width: 2, background: 'var(--color-divider)', marginTop: 4, minHeight: 24 }} />}
      </div>

      <div className="card card--hoverable" style={{ flex: 1, marginBottom: 16, opacity: status === 'LOCKED' ? 0.7 : 1, borderLeft: status === 'NEXT' ? '3px solid var(--color-primary)' : 'none' }} onClick={onClick}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: s.color, color: '#fff' }}>{s.label}</span>
              {course.required && <span className="badge badge--warning">{t('learnerPages.learningPath.required')}</span>}
              {status === 'NEXT' && <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700 }}>📍 {t('learnerPages.learningPath.here')}</span>}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{course.title}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>⏱ {course.duration}p · 📚 {course.moduleCount} module · ⭐ {course.rating}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar__fill" style={{ width: `${progress}%`, background: s.color }} /></div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{progress}%</span>
        </div>
        {course.dueDate && status !== 'DONE' && (<div style={{ fontSize: 11, color: 'var(--color-warning)', marginTop: 6 }}>⏰ {new Date(course.dueDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}</div>)}
      </div>
    </div>
  );
}

export default function LearningPath() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [view, setView] = useState('roadmap');
  const [filter, setFilter] = useState('all');
  const [reloadTick, setReloadTick] = useState(0);
  const lastSyncAtRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getLearnerCourses();
        if (!mounted) return;
        setCourses(response.items || []);
      } catch {
        // fallback below
      } finally {
        if (!mounted) return;
        const localState = getLearningState();
        if (!courses.length) {
          const fallback = fallbackCourses.filter((course) => course.status === COURSE_STATUS.PUBLISHED).map((course) => ({ ...course, progress: getCourseProgress(course, localState.completedItems || []) }));
          setCourses(fallback);
        }
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [reloadTick]);

  useEffect(() => {
    const triggerSync = () => {
      const now = Date.now();
      if (now - lastSyncAtRef.current < 800) return;
      lastSyncAtRef.current = now;
      setReloadTick((value) => value + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') triggerSync();
    };
    const handleStorageSync = (event) => {
      if (event.key === STATE_SYNC_KEY) triggerSync();
    };

    window.addEventListener('focus', triggerSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(STATE_SYNC_EVENT, triggerSync);
    window.addEventListener('storage', handleStorageSync);

    return () => {
      window.removeEventListener('focus', triggerSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(STATE_SYNC_EVENT, triggerSync);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  if (loading) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.learningPath.title')}</div></div>}><PageSkeleton /></LearnerLayout>;

  const sorted = [...courses].sort((a, b) => {
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(a.createdAt || '2000-01-01') - new Date(b.createdAt || '2000-01-01');
  });

  const withStatus = sorted.map((course) => ({ course, progress: course.progress ?? 0 }));
  const nextIdx = withStatus.findIndex((x) => x.progress < 100);
  const totalDone = withStatus.filter((x) => x.progress === 100).length;
  const totalPct = withStatus.length ? Math.round((totalDone / withStatus.length) * 100) : 0;
  const suggested = courses.filter((course) => (course.progress ?? 0) === 0 && !course.required).slice(0, 3);

  const filtered = withStatus.filter(({ course, progress }) => {
    if (filter === 'required') return course.required;
    if (filter === 'optional') return !course.required;
    if (filter === 'completed') return progress === 100;
    if (filter === 'inprogress') return progress > 0 && progress < 100;
    return true;
  });

  const statusMap = buildStatus(t);

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.learningPath.title')}</div></div>}>
      <div className="card" style={{ marginBottom: 16, padding: 16, background: 'linear-gradient(135deg,#FFF0EB,#FFF7ED)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>📊 {t('learnerPages.learningPath.totalProgress')}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>{f(t('learnerPages.learningPath.completedSummary'), { done: totalDone, total: withStatus.length })}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)' }}>{totalPct}%</div>
        </div>
        <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${totalPct}%` }} /></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={`btn btn--sm ${view === 'roadmap' ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setView('roadmap')}>🗺️ {t('learnerPages.learningPath.roadmap')}</button>
        <button className={`btn btn--sm ${view === 'grid' ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setView('grid')}>📋 {t('learnerPages.learningPath.list')}</button>
      </div>

      {view === 'roadmap' ? (
        <>
          <div style={{ marginBottom: 8 }}>
            {withStatus.map(({ course, progress }, idx) => {
              const status = getStatus(progress, idx === nextIdx);
              return <CourseMilestone key={course.id} course={course} progress={progress} status={status} isLast={idx === withStatus.length - 1} onClick={() => navigate(`/learner/course/${course.id}`)} statusMap={statusMap} t={t} locale={locale} />;
            })}
          </div>

          {suggested.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>💡 {t('learnerPages.learningPath.suggestion')}</h3>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>{f(t('learnerPages.learningPath.suggestionDesc'), { department: user?.department || 'your department' })}</div>
              <div className="grid-2">
                {suggested.map((course) => (
                  <div key={course.id} className="card card--hoverable" onClick={() => navigate(`/learner/course/${course.id}`)}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{course.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(course.tags || []).slice(0, 2).map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>⏱ {course.duration}p · ⭐ {course.rating}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="tabs" style={{ marginBottom: 16 }}>
            {[{ key: 'all', label: t('learnerPages.learningPath.all') }, { key: 'required', label: t('learnerPages.learningPath.required') }, { key: 'optional', label: t('learnerPages.learningPath.optional') }, { key: 'inprogress', label: t('learnerPages.learningPath.inProgress') }, { key: 'completed', label: t('learnerPages.learningPath.done') }].map((tab) => (
              <button key={tab.key} className={`tab${filter === tab.key ? ' tab--active' : ''}`} onClick={() => setFilter(tab.key)}>{tab.label}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">📭</div><div className="empty-state__title">{t('learnerPages.learningPath.noCourses')}</div></div>
          ) : (
            <div className="grid-2">
              {filtered.map(({ course, progress }) => (
                <div key={course.id} className="card card--hoverable" onClick={() => navigate(`/learner/course/${course.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 36 }}>📚</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{course.title}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                        {(course.tags || []).map((tag) => <span key={tag} className="chip">{tag}</span>)}
                        {course.required && <span className="badge badge--warning">{t('learnerPages.learningPath.required')}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar__fill" style={{ width: `${progress}%` }} /></div><span style={{ fontSize: 12, fontWeight: 600 }}>{progress}%</span></div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}><span>⏱ {course.duration}p</span><span>📚 {course.moduleCount} module</span><span>⭐ {course.rating}</span></div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </LearnerLayout>
  );
}



