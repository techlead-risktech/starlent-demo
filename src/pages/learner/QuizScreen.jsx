import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { courses } from '../../data/mockCourses.js';
import { completeCourse, completeItem, completeModule, getLearningState, saveQuizAttempt } from '../../utils/auth.js';
import { completeLearningItem, saveQuizAttemptApi } from '../../api/services/learning.js';
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

function fallbackCompleteByCourse({ itemId, moduleId, courseId, xpAmount }) {
  completeItem(itemId, xpAmount);
  if (!moduleId || !courseId) return;

  const course = courses.find((item) => item.id === courseId);
  const module = course?.modules.find((item) => item.id === moduleId);
  if (!course || !module) return;

  const state = getLearningState();
  const allModuleItemsDone = module.items.every((item) => state.completedItems.includes(item.id) || state.completedItems.includes(item.contentId));
  if (allModuleItemsDone) {
    completeModule(moduleId);
    const latestState = getLearningState();
    const allModulesDone = course.modules.every((item) => latestState.completedModules.includes(item.id));
    if (allModulesDone) completeCourse(courseId);
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

function isQuestionCorrect(question, selectedOption, textAnswer, orderingItems) {
  const qType = String(question?.questionType || 'single_choice');
  if (qType === 'multiple_select') {
    const selected = Array.isArray(selectedOption) ? [...selectedOption].sort() : [];
    const expected = Array.isArray(question?.correctIndices) && question.correctIndices.length > 0
      ? [...question.correctIndices].sort()
      : [Number(question?.correctIndex || 0)];
    return expected.length === selected.length && expected.every((value, idx) => value === selected[idx]);
  }

  if (qType === 'short_answer') {
    const expected = String(question?.sampleAnswer || '').trim().toLowerCase();
    const actual = String(textAnswer || '').trim().toLowerCase();
    if (!expected) return actual.length > 0;
    return actual === expected;
  }

  if (qType === 'ordering') {
    const expected = Array.isArray(question?.correctOrder) ? question.correctOrder.map((id) => String(id)) : [];
    const selectedOrder = (orderingItems || []).map((item) => String(item?.id || ''));
    return expected.length > 0 && expected.length === selectedOrder.length && expected.every((value, idx) => value === selectedOrder[idx]);
  }

  return Number(selectedOption) === Number(question?.correctIndex || 0);
}

export default function QuizScreen() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [orderingItems, setOrderingItems] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const quiz = getContentById(contentId);
    setContent(quiz);
    if (quiz?.timeLimit) setTimeLeft(quiz.timeLimit);
  }, [contentId]);

  const question = content?.questions?.[qIdx];
  const qType = String(question?.questionType || 'single_choice');

  useEffect(() => {
    if (!question) return;
    setSelected(null);
    setTextAnswer('');
    setShowResult(false);

    if (qType === 'ordering') {
      const items = Array.isArray(question.items) ? question.items.map((item, idx) => ({
        id: String(item?.id || `s${idx + 1}`),
        text: String(item?.text || ''),
      })) : [];
      setOrderingItems(shuffle(items));
    } else {
      setOrderingItems([]);
    }
  }, [qIdx, contentId]);

  const isDirty = qIdx > 0;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const handleBack = () => { if (isDirty) { setShowLeaveModal(true); return; } navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleLeave = () => { setShowLeaveModal(false); navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleStay = () => { setShowLeaveModal(false); };

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeLeft > 0 && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft((seconds) => {
          if (seconds <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, showResult]);

  if (!content || !question) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải câu hỏi...</div></LearnerLayout>;

  const fmt = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const submitAnswer = () => {
    const correct = isQuestionCorrect(question, selected, textAnswer, orderingItems);
    const answerPayload = qType === 'ordering'
      ? { selected: orderingItems.map((item) => item.id) }
      : { selected, textAnswer };
    setShowResult(true);
    setAnswers((prev) => [...prev, { questionId: question.id, ...answerPayload, correct }]);
  };

  const toggleOption = (idx) => {
    if (showResult) return;
    if (qType === 'multiple_select') {
      const current = Array.isArray(selected) ? selected : [];
      setSelected(current.includes(idx) ? current.filter((value) => value !== idx) : [...current, idx]);
      return;
    }
    setSelected(idx);
    submitAnswer();
  };

  const moveOrdering = (idx, direction) => {
    if (showResult) return;
    const target = idx + direction;
    if (target < 0 || target >= orderingItems.length) return;
    const next = [...orderingItems];
    [next[idx], next[target]] = [next[target], next[idx]];
    setOrderingItems(next);
  };

  const finishQuiz = async () => {
    const score = answers.filter((item) => item.correct).length;
    const total = content.questions.length;
    const passThreshold = Number(content.passScore ?? 70) / 100;
    const passed = score >= Math.ceil(total * passThreshold);
    const earnedXp = passed ? 20 : 5;
    const resolvedItemId = itemId || content.id;

    try {
      await saveQuizAttemptApi({ quizId: content.id, score, total });
    } catch {
      saveQuizAttempt(content.id, score, total);
    }

    try {
      await completeLearningItem({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: earnedXp,
      });
    } catch {
      fallbackCompleteByCourse({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: earnedXp,
      });
    }

    navigate('/learner/quiz-result', {
      state: {
        quizTitle: normalizeVietnameseText(content.title),
        score,
        total,
        answers,
        questions: content.questions,
        itemId,
        moduleId,
        courseId,
      },
    });
  };

  const next = async () => {
    if (qIdx < content.questions.length - 1) {
      setQIdx(qIdx + 1);
      return;
    }
    await finishQuiz();
  };

  const expectedMultiple = Array.isArray(question?.correctIndices) && question.correctIndices.length > 0
    ? question.correctIndices
    : [Number(question?.correctIndex || 0)];

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{normalizeVietnameseText(content.title)}</div><div style={{ fontSize: 13, color: timeLeft < 30 ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: timeLeft < 30 ? 700 : 400 }}>⏱ {fmt(timeLeft)}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="progress-bar" style={{ marginBottom: 20 }}><div className="progress-bar__fill" style={{ width: `${((qIdx + (showResult ? 1 : 0)) / content.questions.length) * 100}%` }} /></div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>Câu {qIdx + 1}/{content.questions.length}</p>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, lineHeight: 1.5 }}>{normalizeVietnameseText(question.question || question.prompt)}</h3>

        {qType !== 'short_answer' && qType !== 'ordering' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(question.options || []).map((opt, i) => {
              let bg = 'var(--color-surface)';
              let border = '1.5px solid var(--color-border)';
              const selectedArr = Array.isArray(selected) ? selected : [];
              const selectedSingle = Number(selected);
              if (showResult) {
                const isCorrect = qType === 'multiple_select' ? expectedMultiple.includes(i) : i === Number(question.correctIndex || 0);
                const isWrongSelected = qType === 'multiple_select' ? (selectedArr.includes(i) && !expectedMultiple.includes(i)) : (i === selectedSingle && i !== Number(question.correctIndex || 0));
                if (isCorrect) { bg = 'var(--color-success-light)'; border = '1.5px solid var(--color-success)'; }
                else if (isWrongSelected) { bg = 'var(--color-danger-light)'; border = '1.5px solid var(--color-danger)'; }
              } else {
                const isSelected = qType === 'multiple_select' ? selectedArr.includes(i) : i === selectedSingle;
                if (isSelected) { bg = 'var(--color-primary-light)'; border = '1.5px solid var(--color-primary)'; }
              }
              return (
                <button key={i} className="btn" style={{ background: bg, border, justifyContent: 'flex-start', fontSize: 14, fontWeight: 500, textAlign: 'left', padding: '12px 16px', borderRadius: 'var(--radius-md)', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}
                  onClick={() => toggleOption(i)} disabled={showResult}>
                  <span style={{ marginRight: 8, fontWeight: 700 }}>{['A', 'B', 'C', 'D'][i] || `${i + 1}`}. </span> {normalizeVietnameseText(opt)}
                </button>
              );
            })}
          </div>
        )}

        {qType === 'ordering' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {orderingItems.map((item, idx) => (
              <div key={item.id} className="card" style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto auto', gap: 8, alignItems: 'center', padding: 10 }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>{idx + 1}</span>
                <span>{normalizeVietnameseText(item.text)}</span>
                <button className="btn btn--ghost btn--sm" onClick={() => moveOrdering(idx, -1)} disabled={showResult || idx === 0}>↑</button>
                <button className="btn btn--ghost btn--sm" onClick={() => moveOrdering(idx, 1)} disabled={showResult || idx === orderingItems.length - 1}>↓</button>
              </div>
            ))}
          </div>
        )}

        {qType === 'short_answer' && (
          <div className="input-group">
            <label className="input-label">Câu trả lời</label>
            <textarea className="input" rows={4} value={textAnswer} onChange={(event) => setTextAnswer(event.target.value)} disabled={showResult} />
          </div>
        )}

        {!showResult && (qType === 'multiple_select' || qType === 'short_answer' || qType === 'ordering') && (
          <button className="btn btn--secondary btn--full" style={{ marginTop: 14 }} onClick={submitAnswer} disabled={qType === 'multiple_select' ? !Array.isArray(selected) || selected.length === 0 : qType === 'short_answer' ? !textAnswer.trim() : orderingItems.length === 0}>
            Kiểm tra đáp án
          </button>
        )}

        {showResult && <div style={{ marginTop: 16, padding: 12, background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-text-secondary)' }}>{normalizeVietnameseText(question.explanation)}</div>}
        {showResult && <button className="btn btn--primary btn--lg btn--full" style={{ marginTop: 20 }} onClick={next}>{qIdx < content.questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}</button>}
      </div>
      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}
