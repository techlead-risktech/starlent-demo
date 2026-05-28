import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

function fmtDateTime(value, locale) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function LiveSessionLesson() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { t, locale } = useI18n();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setContent(getContentById(contentId));
  }, [contentId]);

  const handleBack = () => navigate(courseId ? `/learner/course/${courseId}` : -1);

  const markAttended = async () => {
    const earnedXp = 10;
    const resolvedItemId = itemId || content.id;
    try {
      await completeLearningItem({ itemId: resolvedItemId, moduleId, courseId, xpAmount: earnedXp });
    } catch {
      completeItem(resolvedItemId, earnedXp);
    }
    setDone(true);
    showToast(`✅ ${f(t('learnerPages.liveSession.attendedToast'), { xp: earnedXp })}`);
  };

  if (!content) {
    return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('common.loading')}</div></div>}><div className="empty-state">{t('common.loading')}</div></LearnerLayout>;
  }

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← {t('learnerPages.common.back')}</button><div className="page__title">{content.title}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-96dp/logo_meet_2020q4_color_2x_web_96dp.png" alt="Google Meet" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10, background: '#F8FAFC', padding: 6 }} />
            <div><div style={{ fontWeight: 700 }}>Google Meet</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t('learnerPages.liveSession.roomDesc')}</div></div>
          </div>

          <div style={{ marginBottom: 6 }}><strong>{t('learnerPages.liveSession.time')}:</strong> {fmtDateTime(content.startAt, locale)} đến {fmtDateTime(content.endAt, locale)}</div>
          <div style={{ marginBottom: 6 }}><strong>{t('learnerPages.liveSession.host')}:</strong> {content.host || '-'}</div>
          <div style={{ marginBottom: 10 }}><strong>{t('learnerPages.liveSession.note')}:</strong> {content.notes || '-'}</div>

          <a className="btn btn--secondary btn--full" href={content.meetingUrl || '#'} target="_blank" rel="noreferrer">{t('learnerPages.liveSession.openMeet')}</a>
        </div>

        {!done ? <button className="btn btn--success btn--lg btn--full" onClick={markAttended}>{t('learnerPages.liveSession.attended')}</button> : <button className="btn btn--primary btn--lg btn--full" onClick={handleBack}>{t('learnerPages.liveSession.backCourse')}</button>}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
