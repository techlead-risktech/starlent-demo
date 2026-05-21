import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function SurveyLesson() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    setContent(getContentById(contentId));
  }, [contentId]);

  const handleBack = () => navigate(courseId ? `/learner/course/${courseId}` : -1);

  const submitSurvey = async () => {
    const earnedXp = 5;
    const resolvedItemId = itemId || content.id;
    try {
      await completeLearningItem({ itemId: resolvedItemId, moduleId, courseId, xpAmount: earnedXp });
    } catch {
      completeItem(resolvedItemId, earnedXp);
    }
    setDone(true);
    showToast(`✅ Cảm ơn phản hồi của bạn! +${earnedXp} điểm`);
  };

  if (!content) {
    return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;
  }

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{content.title}</div></div>}>
      <div style={{ padding: 16 }}>
        {(content.questions || []).map((question) => (
          <div key={question.id} className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{question.prompt}</div>
            <input className="input" value={answers[question.id] || ''} onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))} />
          </div>
        ))}
        {!done ? <button className="btn btn--primary btn--lg btn--full" onClick={submitSurvey}>Gửi khảo sát</button> : <button className="btn btn--success btn--lg btn--full" onClick={handleBack}>Hoàn tất khảo sát</button>}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
