import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useOnlineStatus } from '../../hooks/useToast.js';
import { getLearningState, getLast7DaysStreak, getDailyProgress, getDueCards, isOnboarded } from '../../utils/auth.js';
import { COURSE_STATUS, courses, getCourseProgress } from '../../data/mockCourses.js';
import { flashcards } from '../../data/mockContent.js';
import { getNotificationsForUser } from '../../data/mockChats.js';
import { getLearnerHome } from '../../api/services/learner.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { SkeletonText, SkeletonCard } from '../../components/common/Skeleton.jsx';

function Greeting({ name }) {
  const h = new Date().getHours();
  let g = 'Chào buổi sáng';
  if (h >= 12 && h < 17) g = 'Chào buổi chiều';
  else if (h >= 17) g = 'Chào buổi tối';
  return <span>{g}, <strong>{name}</strong>!</span>;
}

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function StreakStrip({ days }) {
  return (
    <div className="card" style={{ padding: 14, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>🗓️ 7 ngày gần nhất</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{days.filter((d) => d.studied).length}/7 ngày học</div>
      </div>
      <div className="streak-strip">
        {days.map((d, i) => {
          const dt = new Date(`${d.date}T00:00:00`);
          const dow = (dt.getDay() + 6) % 7;
          const isToday = i === days.length - 1;
          return (
            <div key={d.date} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>{DAY_LABELS[dow]}</div>
              <div
                className="streak-dot"
                style={{
                  background: d.studied ? 'var(--color-primary)' : 'var(--color-divider)',
                  color: d.studied ? '#fff' : 'var(--color-text-muted)',
                  border: isToday ? '2px solid var(--color-secondary)' : 'none',
                }}
              >
                {d.studied ? '🔥' : dt.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyGoalCard({ done, goal, onPick }) {
  const pct = Math.min(100, Math.round((done / goal) * 100));
  const reached = done >= goal;
  return (
    <div className="card" style={{ padding: 14, marginBottom: 20, background: reached ? 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' : 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>🎯 Mục tiêu hôm nay</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {reached ? '🎉 Đạt mục tiêu! Tiếp tục phát huy.' : `${done}/${goal} bài đã hoàn thành`}
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: reached ? 'var(--color-success)' : 'var(--color-secondary)' }}>{pct}%</div>
      </div>
      <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${pct}%`, background: reached ? 'var(--color-success)' : 'var(--color-secondary)' }} /></div>
      {!reached && <button className="btn btn--primary btn--full btn--sm" style={{ marginTop: 10 }} onClick={onPick}>⚡ Học nhanh 5 phút</button>}
    </div>
  );
}

function pickQuickFlashcardId() {
  const allCards = Object.values(flashcards).flatMap((f) => f.cards);
  const due = getDueCards(allCards);
  const pool = due.length > 0 ? due : allCards;
  const c = pool[Math.floor(Math.random() * pool.length)];
  const fc = Object.values(flashcards).find((f) => f.cards.some((x) => x.id === c?.id));
  return fc?.id;
}

export default function LearnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(true);
  const [home, setHome] = useState(null);
  const [ls, setLs] = useState(null);

  useEffect(() => {
    if (!isOnboarded()) {
      navigate('/onboarding');
      return;
    }

    let mounted = true;
    async function loadHome() {
      try {
        const response = await getLearnerHome();
        if (!mounted) return;
        setHome(response);
      } catch {
        // Fallback local-state mode for screens not migrated yet.
      } finally {
        if (!mounted) return;
        setLs(getLearningState());
        setLoading(false);
      }
    }

    loadHome();
    return () => { mounted = false; };
  }, [navigate]);

  const handleQuickStart = () => {
    const quickStartContentId = home?.actions?.quickStart?.contentId;
    const fallbackId = pickQuickFlashcardId();
    const contentId = quickStartContentId || fallbackId;
    if (contentId) navigate(`/learner/flashcard/${contentId}`);
    else navigate('/learner/daily-review');
  };

  if (loading) {
    return (
      <LearnerLayout>
        <div style={{ padding: 16 }}>
          <SkeletonText width="60%" /><SkeletonText width="40%" />
          <div style={{ height: 16 }} /><SkeletonCard />
          <div style={{ height: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </div>
      </LearnerLayout>
    );
  }

  const fallbackState = ls || getLearningState();
  const fallbackUserNotis = getNotificationsForUser(user?.id).filter((n) => !n.read);
  const fallbackPublishedCourses = courses.filter((course) => course.status === COURSE_STATUS.PUBLISHED);
  const fallbackInProgress = fallbackPublishedCourses
    .map((course) => ({ ...course, progress: getCourseProgress(course, fallbackState.completedItems || []) }))
    .filter((course) => course.progress > 0 && course.progress < 100);
  const fallbackRequired = fallbackPublishedCourses
    .map((course) => ({ ...course, progress: getCourseProgress(course, fallbackState.completedItems || []) }))
    .filter((course) => course.required);

  const streak = home?.stats?.streak ?? fallbackState.streak ?? user?.streak ?? 0;
  const xp = home?.stats?.xp ?? fallbackState.xp ?? user?.xp ?? 0;
  const level = home?.stats?.level ?? (Math.floor(xp / 500) + 1);
  const xpToNext = home?.stats?.xpToNext ?? (500 - (xp % 500 || 0));
  const unreadCount = home?.notifications?.unreadCount ?? fallbackUserNotis.length;
  const userNotis = home?.notifications?.items ?? fallbackUserNotis.slice(0, 3);
  const inProgress = home?.sections?.inProgressCourses ?? fallbackInProgress;
  const required = home?.sections?.requiredCourses ?? fallbackRequired;
  const days = home?.stats?.last7Days ?? getLast7DaysStreak();
  const daily = {
    done: home?.stats?.dailyDone ?? getDailyProgress().done,
    goal: home?.stats?.dailyGoal ?? getDailyProgress().goal,
  };
  const dueCount = home?.stats?.dueCount ?? getDueCards(Object.values(flashcards).flatMap((f) => f.cards)).length;

  return (
    <LearnerLayout
      topBar={(
        <div className="page__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}><Greeting name={user?.name?.split(' ').pop()} /></div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>Hôm nay bạn muốn học gì?</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/learner/notifications')} style={{ position: 'relative' }}>
              🔔 {unreadCount > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />}
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/learner/search')}>🔍</button>
          </div>
        </div>
      )}
    >
      <DailyGoalCard done={daily.done} goal={daily.goal} onPick={handleQuickStart} />
      <StreakStrip days={days} />

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-card__label">🔥 Số ngày học liên tiếp</div><div className="stat-card__value">{streak} <span style={{ fontSize: 14 }}>ngày</span></div></div>
        <div className="stat-card"><div className="stat-card__label">⭐ Tổng điểm kinh nghiệm</div><div className="stat-card__value">{xp.toLocaleString()}</div><div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-bar__fill" style={{ width: `${(xp % 500) / 5}%` }} /></div><div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>Còn {xpToNext} điểm nữa lên cấp {level + 1}</div></div>
        <div className="stat-card"><div className="stat-card__label">🎯 Cấp độ</div><div className="stat-card__value">{level}</div><div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>{xp.toLocaleString()} điểm</div></div>
        <div className="stat-card"><div className="stat-card__label">📝 Hôm nay</div><div className="stat-card__value">{daily.done} <span style={{ fontSize: 14 }}>bài</span></div><div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>đã hoàn thành</div></div>
      </div>

      {inProgress.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📖 Tiếp tục học</h3>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {inProgress.map((course) => {
              const prog = course.progress ?? getCourseProgress(course, fallbackState.completedItems || []);
              return (
                <div key={course.id} className="card card--hoverable course-mini-card" style={{ minWidth: 260, flexShrink: 0 }} onClick={() => navigate(`/learner/course/${course.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>📖</span>
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{course.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{course.moduleCount || course.modules?.length || 0} module</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar__fill" style={{ width: `${prog}%` }} /></div><span style={{ fontSize: 12, fontWeight: 600 }}>{prog}%</span></div>
                  {course.dueDate && <div style={{ fontSize: 11, color: 'var(--color-warning)', marginTop: 4 }}>⏰ Hạn: {new Date(course.dueDate).toLocaleDateString('vi-VN')}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {required.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🎯 Khoá học bắt buộc</h3>
          <div className="grid-2">
            {required.map((course) => {
              const prog = course.progress ?? getCourseProgress(course, fallbackState.completedItems || []);
              return (
                <div key={course.id} className="card card--hoverable" onClick={() => navigate(`/learner/course/${course.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}><div style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{course.title}</div><span className="badge badge--warning">Bắt buộc</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar__fill" style={{ width: `${prog}%` }} /></div><span style={{ fontSize: 12, fontWeight: 600 }}>{prog}%</span></div>
                  <button className="btn btn--primary btn--sm btn--full" style={{ marginTop: 12 }} onClick={(e) => { e.stopPropagation(); navigate(`/learner/course/${course.id}`); }}>{prog === 0 ? '🚀 Bắt đầu học' : 'Tiếp tục'}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FFF0EB)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 36 }}>🔄</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  Ôn tập hàng ngày
                  {dueCount > 0 && <span className="badge badge--danger">{dueCount} đến hạn</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {dueCount > 0 ? `Có ${dueCount} thẻ cần ôn hôm nay` : 'Không có thẻ đến hạn. Học tiếp để tích luỹ thẻ ôn tập!'}
                </div>
              </div>
            </div>
            <button className="btn btn--primary" onClick={() => navigate('/learner/daily-review')}>Ôn tập</button>
          </div>
        </div>
      </div>

      {userNotis.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 700 }}>🔔 Thông báo</h3><button style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }} onClick={() => navigate('/learner/notifications')}>Xem tất cả</button></div>
          {userNotis.slice(0, 3).map((n) => <div key={n.id} className="card" style={{ marginBottom: 8, padding: 12 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div><div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{n.body}</div></div>)}
        </div>
      )}

      <button aria-label="Học nhanh 5 phút" onClick={handleQuickStart} className="fab-quick">⚡</button>
      {!isOnline && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>Chế độ offline: đang dùng dữ liệu cục bộ.</div>}
    </LearnerLayout>
  );
}

