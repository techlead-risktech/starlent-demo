import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function AssignmentLesson() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [answer, setAnswer] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setContent(getContentById(contentId));
  }, [contentId]);

  const handleBack = () => navigate(courseId ? `/learner/course/${courseId}` : -1);

  const submitAssignment = async () => {
    const earnedXp = 15;
    const resolvedItemId = itemId || content.id;
    try {
      await completeLearningItem({ itemId: resolvedItemId, moduleId, courseId, xpAmount: earnedXp });
    } catch {
      completeItem(resolvedItemId, earnedXp);
    }
    setDone(true);
    showToast(`✅ Đã nộp bài (mock)! +${earnedXp} điểm`);
  };

  if (!content) {
    return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;
  }

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{content.title}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <h4 style={{ marginBottom: 8, fontSize: 16, fontWeight: 700 }}>📌 Yêu cầu bài tập</h4>
          <p style={{ marginBottom: 10 }}>{content.instruction || ''}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>Hình thức nộp: {content.submissionType || 'text'} · Điểm tối đa: {content.maxScore || 100}</p>
        </div>
        <div className="input-group" style={{ marginBottom: 12 }}>
          <label className="input-label">Câu trả lời</label>
          <textarea className="input" rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Nhập nội dung bài làm..." />
        </div>
        {!done ? <button className="btn btn--primary btn--lg btn--full" onClick={submitAssignment} disabled={!answer.trim()}>Nộp bài (mock)</button> : <button className="btn btn--success btn--lg btn--full" onClick={handleBack}>Đã nộp, quay lại khóa học</button>}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
