import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AudioLesson() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => { setContent(getContentById(contentId)); }, [contentId]);

  const isDirty = time > 0 && !done;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const handleBack = () => { if (isDirty) { setShowLeaveModal(true); return; } navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleLeave = () => { setShowLeaveModal(false); navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleStay = () => { setShowLeaveModal(false); };

  useEffect(() => {
    if (!playing || time >= (content?.duration || 0)) return undefined;
    timerRef.current = setInterval(() => setTime((value) => Math.min(value + speed, content?.duration || 0)), 500);
    return () => clearInterval(timerRef.current);
  }, [playing, time, content, speed]);

  const markDone = async () => {
    const earnedXp = 10;
    const resolvedItemId = itemId || content.id;
    try {
      await completeLearningItem({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: earnedXp,
      });
    } catch {
      completeItem(resolvedItemId, earnedXp);
    }
    setDone(true);
    showToast(`✅ Hoàn thành! +${earnedXp} XP`);
  };

  if (!content) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;
  const pct = content.duration ? (time / content.duration) * 100 : 0;

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{content.title}</div></div>}>
      <div style={{ padding: 16 }}>
        <div style={{ background: 'linear-gradient(135deg,#FFF0EB,#FFF7ED)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎧</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(Math.floor(time))}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>/ {fmt(content.duration)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar__fill" style={{ width: `${pct}%` }} /></div></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <button className="btn btn--secondary btn--sm" onClick={() => setTime((value) => Math.max(0, value - 15))}>⏪ -15s</button>
          <button className="btn btn--primary" style={{ minWidth: 64, height: 48, borderRadius: 'var(--radius-full)' }} onClick={() => setPlaying(!playing)}>{playing ? '⏸️' : '▶️'}</button>
          <button className="btn btn--secondary btn--sm" onClick={() => setTime((value) => Math.min(content.duration, value + 15))}>+15s ⏩</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {[0.5, 1, 1.5, 2].map((value) => <button key={value} className={`btn btn--sm ${speed === value ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setSpeed(value)}>{value}x</button>)}
        </div>
        <div className="card" style={{ marginBottom: 16 }}><h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📝 Lời thoại</h4><p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{content.transcript}</p></div>
        {!done ? (
          <button className="btn btn--success btn--lg btn--full" onClick={markDone} disabled={pct < 80}>✅ Đánh dấu hoàn thành{pct < 80 ? ' (nghe 80%)' : ''}</button>
        ) : (
          <div style={{ textAlign: 'center', padding: 20 }}><div style={{ fontSize: 36 }}>🎉</div><p style={{ fontSize: 16, fontWeight: 600 }}>Đã hoàn thành!</p><button className="btn btn--primary" style={{ marginTop: 12 }} onClick={handleBack}>Quay lại</button></div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}

