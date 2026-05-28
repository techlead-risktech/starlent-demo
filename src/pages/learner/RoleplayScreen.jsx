import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';
import { useI18n } from '../../i18n/index.jsx';

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

export default function RoleplayScreen() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { t } = useI18n();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { setContent(getContentById(contentId)); }, [contentId]);

  const isDirty = (recording || recorded) && !submitted;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const handleBack = () => { if (isDirty) { setShowLeaveModal(true); return; } navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleLeave = () => { setShowLeaveModal(false); navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleStay = () => { setShowLeaveModal(false); };

  const start = () => {
    setRecording(true);
    setRecTime(0);
    timerRef.current = setInterval(() => setRecTime((value) => value + 1), 1000);
  };

  const stop = () => {
    setRecording(false);
    setRecorded(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const submit = async () => {
    const resolvedItemId = itemId || content?.id;
    try {
      await completeLearningItem({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: 20,
      });
    } catch {
      completeItem(resolvedItemId, 20);
    }
    setSubmitted(true);
    showToast(`✅ ${t('learnerPages.roleplay.submitToast').replace('{xp}', '20')}`);
  };

  if (!content) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('common.loading')}</div></div>}><div className="empty-state">{t('common.loading')}</div></LearnerLayout>;

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← {t('learnerPages.common.back')}</button><div className="page__title">{normalizeVietnameseText(content.title)}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="card" style={{ marginBottom: 16, background: '#FFF7ED', borderColor: '#FCD34D' }}><h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#92400E' }}>📋 {t('learnerPages.roleplay.scenario')}</h4><p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{normalizeVietnameseText(content.scenario)}</p></div>
        <div className="card" style={{ marginBottom: 16 }}><h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>💡 {t('learnerPages.roleplay.hint')}</h4><p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{normalizeVietnameseText(content.suggestedResponse)}</p>
          {content.tips && <div style={{ marginTop: 12 }}><p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>{t('learnerPages.roleplay.tips')}</p>{content.tips.map((tip, i) => <div key={i} style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '2px 0' }}>• {normalizeVietnameseText(tip)}</div>)}</div>}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {recording ? (
            <>
              {recording ? (
                <div>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-danger)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite' }}><span style={{ fontSize: 32 }}>🎤</span></div>
                  <p style={{ fontSize: 14, color: 'var(--color-danger)', fontWeight: 600 }}>{t('learnerPages.roleplay.recording').replace('{seconds}', String(recTime))}</p>
                  <button className="btn btn--secondary" style={{ marginTop: 8 }} onClick={stop}>⏹️ {t('learnerPages.roleplay.stop')}</button>
                </div>
              ) : (
                <div>
                  <button className="btn" style={{ width: 80, height: 80, borderRadius: '50%', background: recorded ? 'var(--color-success)' : 'var(--color-primary)', color: '#fff', fontSize: 32, margin: '0 auto 12px' }} onClick={recorded ? () => { setRecorded(false); setRecTime(0); } : start}>{recorded ? '🔄' : '🎤'}</button>
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{recorded ? t('learnerPages.roleplay.recordedTap').replace('{seconds}', String(recTime)) : t('learnerPages.roleplay.tapToStart')}</p>
                </div>
              )}
              {recorded && <button className="btn btn--primary btn--lg btn--full" style={{ marginTop: 16 }} onClick={submit}>📤 {t('learnerPages.roleplay.submit')}</button>}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 20 }}><div style={{ fontSize: 64 }}>🎉</div><h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0' }}>{t('learnerPages.roleplay.submitted')}</h2><p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('learnerPages.roleplay.submittedDesc')}</p><button className="btn btn--primary btn--lg btn--full" style={{ marginTop: 16 }} onClick={handleBack}>{t('learnerPages.common.back')}</button></div>
          )}
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
      <style>{'@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 20px rgba(239,68,68,0)}}'}</style>
    </LearnerLayout>
  );
}
