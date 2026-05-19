import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { courses } from '../../data/mockCourses.js';
import { completeItem, completeModule, completeCourse, getLearningState } from '../../utils/auth.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';

export default function FlashcardScreen() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  // Lấy itemId, moduleId, courseId từ URL để theo dõi tiến trình khoá học
  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const [xp, setXp] = useState(0);

  useEffect(() => { setContent(getContentById(contentId)); }, [contentId]);

  // Cảnh báo khi đang học dở mà rời đi
  const isDirty = idx > 0 && !done;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const handleBack = () => { if (isDirty) { setShowLeaveModal(true); return; } navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleLeave = () => { setShowLeaveModal(false); navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleStay = () => { setShowLeaveModal(false); };

  if (!content) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;

  const card = content.cards[idx];

  const handleSelect = (optIdx) => {
    if (showResult) return;
    setSelected(optIdx);
    setShowResult(true);
    const correct = optIdx === card.correctIndex;
    setAnswers([...answers, { cardId: card.id, correct }]);
  };

  // Theo dõi tiến trình khoá học: đánh dấu item → module → course
  const updateCourseProgress = (totalCorrect, totalCards) => {
    // 1. Đánh dấu item đã hoàn thành (dùng itemId từ URL)
    if (itemId) {
      const earnedXp = Math.round((totalCorrect / totalCards) * 20);
      completeItem(itemId, earnedXp);
      setXp(earnedXp);
      showToast(`✅ ${totalCorrect}/${totalCards} đúng! +${earnedXp} XP`);

      // 2. Kiểm tra nếu tất cả item trong module đã hoàn thành → đánh dấu module hoàn thành
      if (moduleId && courseId) {
        const course = courses.find(c => c.id === courseId);
        const module = course?.modules.find(m => m.id === moduleId);
        if (module) {
          const ls = getLearningState();
          const allModuleItemsDone = module.items.every(item =>
            (ls.completedItems.includes(item.id) || ls.completedItems.includes(item.contentId))
          );
          if (allModuleItemsDone) {
            completeModule(moduleId);

            // 3. Kiểm tra nếu tất cả module đã hoàn thành → đánh dấu khoá học hoàn thành
            const allModulesDone = course.modules.every(m =>
              ls.completedModules.includes(m.id) || m.id === moduleId
            );
            if (allModulesDone) {
              completeCourse(courseId);
            }
          }
        }
      }
    } else {
      // Fallback nếu không có itemId (truy cập trực tiếp, không từ course)
      const earnedXp = Math.round((totalCorrect / totalCards) * 20);
      completeItem(content.id, earnedXp);
      setXp(earnedXp);
      showToast(`✅ ${totalCorrect}/${totalCards} đúng! +${earnedXp} XP`);
    }
  };

  const handleNext = () => {
    if (idx < content.cards.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      const totalCorrect = answers.filter(a => a.correct).length + (selected === card.correctIndex ? 1 : 0);
      const totalCards = content.cards.length;
      updateCourseProgress(totalCorrect, totalCards);
      setDone(true);
    }
  };

  if (done) {
    const totalCorrect = answers.filter(a => a.correct).length + (selected === card.correctIndex ? 1 : 0);
    const totalCards = content.cards.length;
    const pct = Math.round((totalCorrect / totalCards) * 100);
    return (
      <LearnerLayout topBar={<div className="page__header"><div className="page__title">{content.title}</div></div>}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 70 ? '🎉' : '📚'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0' }}>Hoàn thành!</h2>
          <p style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>
            Bạn trả lời đúng <strong>{totalCorrect}/{totalCards}</strong> câu
          </p>
          <div className="progress-bar" style={{ maxWidth: 280, margin: '12px auto' }}>
            <div className="progress-bar__fill" style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--color-success)' : 'var(--color-warning)' }} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0 24px' }}>+{xp} XP</p>
          <button className="btn btn--primary btn--lg btn--full" onClick={handleBack}>
            {courseId ? '← Về khoá học' : 'Quay lại'}
          </button>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{content.title}</div><div style={{fontSize:13,color:'var(--color-text-muted)'}}>Thẻ {idx+1}/{content.cards.length}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="progress-bar" style={{ marginBottom: 20 }}>
          <div className="progress-bar__fill progress-bar__fill--secondary" style={{ width: `${((idx + 1) / content.cards.length) * 100}%` }} />
        </div>

        <div className="card" style={{ marginBottom: 20, background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
          <p style={{ fontSize: 13, color: 'var(--color-primary-dark)', fontWeight: 600, marginBottom: 8 }}>📝 Chọn đáp án đúng:</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>{card.front}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {card.options.map((opt, i) => {
            let bg = 'var(--color-surface)';
            let border = '1.5px solid var(--color-border)';
            let textColor = 'var(--color-text-primary)';

            if (showResult) {
              if (i === card.correctIndex) {
                bg = 'var(--color-success-light)'; border = '1.5px solid var(--color-success)'; textColor = '#065F46';
              } else if (i === selected && i !== card.correctIndex) {
                bg = 'var(--color-danger-light)'; border = '1.5px solid var(--color-danger)'; textColor = '#991B1B';
              }
            } else if (i === selected) {
              bg = 'var(--color-primary-light)'; border = '1.5px solid var(--color-primary)';
            }

            return (
              <button key={i} className="btn" onClick={() => handleSelect(i)} disabled={showResult}
                style={{ background: bg, border, color: textColor, justifyContent: 'flex-start', textAlign: 'left', padding: '14px 16px', fontSize: 14, fontWeight: 500, borderRadius: 'var(--radius-md)', minHeight: 52, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}>
                <span style={{ marginRight: 10, fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 12 }}>{['A','B','C','D'][i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {showResult && i === card.correctIndex && <span style={{ fontSize: 18 }}>✓</span>}
                {showResult && i === selected && i !== card.correctIndex && <span style={{ fontSize: 18 }}>✗</span>}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="card" style={{ marginBottom: 20, background: selected === card.correctIndex ? 'var(--color-success-light)' : 'var(--color-danger-light)', borderColor: selected === card.correctIndex ? 'var(--color-success)' : 'var(--color-danger)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: selected === card.correctIndex ? '#065F46' : '#991B1B' }}>
              {selected === card.correctIndex ? '✅ Chính xác!' : '❌ Chưa đúng'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{card.explanation}</p>
          </div>
        )}

        {showResult && (
          <button className="btn btn--primary btn--lg btn--full" onClick={handleNext}>
            {idx < content.cards.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}
          </button>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}
