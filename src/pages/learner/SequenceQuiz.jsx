import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';

function normalizeVietnameseText(value) {
  const text = String(value || '');
  if (!/Ã|Â|Ä|Æ|á»|âœ|â€|ðŸ|�/.test(text)) return text;
  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 0xff));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return text;
  }
}

function shuffle(arr) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export default function SequenceQuiz() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [items, setItems] = useState([]);
  const [done, setDone] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const payload = getContentById(contentId);
    setContent(payload);
    if (payload) setItems(shuffle(payload.items || []));
  }, [contentId]);

  const isDirty = attempts > 0 && !done;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const handleBack = () => { if (isDirty) { setShowLeaveModal(true); return; } navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleLeave = () => { setShowLeaveModal(false); navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleStay = () => { setShowLeaveModal(false); };

  const move = (idx, dir) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  };

  const check = async () => {
    setAttempts((v) => v + 1);
    const solved = items.every((it, i) => it.order === i + 1);
    if (!solved) {
      showToast('❌ Chưa đúng, thử lại!');
      return;
    }

    const resolvedItemId = itemId || content.id;
    try {
      await completeLearningItem({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: 15,
      });
    } catch {
      completeItem(resolvedItemId, 15);
    }
    setDone(true);
    showToast('✅ Chính xác! +15 điểm');
  };

  if (!content) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;
  if (done) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{normalizeVietnameseText(content.title)}</div></div>}><div style={{ textAlign: 'center', padding: 40 }}><div style={{ fontSize: 64 }}>🎉</div><h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0' }}>Hoàn thành!</h2><p style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>Số lần thử: {attempts}</p><button className="btn btn--primary btn--lg btn--full" style={{ marginTop: 24 }} onClick={handleBack}>Quay lại</button></div></LearnerLayout>;

  return (
    <LearnerLayout topBar={<div className="page__header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ flexShrink: 0 }}>← Quay lại</button><div style={{ flex: 1 }}><div className="page__title">{normalizeVietnameseText(content.title)}</div><div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Lần thử: {attempts}</div></div></div>}>
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>{normalizeVietnameseText(content.description)}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {items.map((item, i) => (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-muted)', width: 24 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14 }}>{normalizeVietnameseText(item.text)}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button className="btn btn--ghost btn--sm" style={{ minHeight: 28, padding: '2px 8px' }} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button className="btn btn--ghost btn--sm" style={{ minHeight: 28, padding: '2px 8px' }} onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn--primary btn--lg btn--full" onClick={check}>Kiểm tra</button>
        <button className="btn btn--ghost btn--full" style={{ marginTop: 8 }} onClick={() => setItems(shuffle(content.items || []))}>Xáo trộn lại</button>
      </div>
      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}
