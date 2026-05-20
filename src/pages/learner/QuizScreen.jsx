import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { courses } from '../../data/mockCourses.js';
import { completeItem, saveQuizAttempt, completeModule, completeCourse, getLearningState } from '../../utils/auth.js';
import { completeLearningItem, saveQuizAttemptApi } from '../../api/services/learning.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';

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
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const quiz = getContentById(contentId);
    setContent(quiz);
    if (quiz?.timeLimit) setTimeLeft(quiz.timeLimit);
  }, [contentId]);

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

  if (!content) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải câu hỏi...</div></LearnerLayout>;

  const question = content.questions[qIdx];
  const fmt = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const ans = (idx) => {
    const correct = idx === question.correctIndex;
    setSelected(idx);
    setShowResult(true);
    setAnswers((prev) => [...prev, { questionId: question.id, selected: idx, correct }]);
  };

  const finishQuiz = async () => {
    const score = answers.filter((item) => item.correct).length;
    const total = content.questions.length;
    const passed = score >= Math.ceil(total * 0.7);
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
        quizTitle: content.title,
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
      setSelected(null);
      setShowResult(false);
      return;
    }
    await finishQuiz();
  };

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{content.title}</div><div style={{ fontSize: 13, color: timeLeft < 30 ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: timeLeft < 30 ? 700 : 400 }}>⏱ {fmt(timeLeft)}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="progress-bar" style={{ marginBottom: 20 }}><div className="progress-bar__fill" style={{ width: `${((qIdx + (showResult ? 1 : 0)) / content.questions.length) * 100}%` }} /></div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>Câu {qIdx + 1}/{content.questions.length}</p>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, lineHeight: 1.5 }}>{question.question}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((opt, i) => {
            let bg = 'var(--color-surface)';
            let border = '1.5px solid var(--color-border)';
            if (showResult) {
              if (i === question.correctIndex) { bg = 'var(--color-success-light)'; border = '1.5px solid var(--color-success)'; }
              else if (i === selected) { bg = 'var(--color-danger-light)'; border = '1.5px solid var(--color-danger)'; }
            } else if (i === selected) { bg = 'var(--color-primary-light)'; border = '1.5px solid var(--color-primary)'; }
            return (
              <button key={i} className="btn" style={{ background: bg, border, justifyContent: 'flex-start', fontSize: 14, fontWeight: 500, textAlign: 'left', padding: '12px 16px', borderRadius: 'var(--radius-md)', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}
                onClick={() => !showResult && ans(i)} disabled={showResult}>
                <span style={{ marginRight: 8, fontWeight: 700 }}>{['A', 'B', 'C', 'D'][i]}.</span> {opt}
                {showResult && i === question.correctIndex && <span style={{ marginLeft: 'auto', color: 'var(--color-success)' }}>✓</span>}
                {showResult && i === selected && i !== question.correctIndex && <span style={{ marginLeft: 'auto', color: 'var(--color-danger)' }}>✕</span>}
              </button>
            );
          })}
        </div>
        {showResult && <div style={{ marginTop: 16, padding: 12, background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-text-secondary)' }}>{question.explanation}</div>}
        {showResult && <button className="btn btn--primary btn--lg btn--full" style={{ marginTop: 20 }} onClick={next}>{qIdx < content.questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}</button>}
      </div>
      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}

