import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcards } from '../../data/mockContent.js';
import { saveCardReview, completeItem, getDueCards } from '../../utils/auth.js';
import { completeLearningItem, saveCardReviewApi } from '../../api/services/learning.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function DailyReview() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [xp, setXp] = useState(0);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const all = Object.values(flashcards).flatMap((item) => item.cards);
      const due = getDueCards(all);
      setCards(due.length > 0 ? due.slice(0, 15) : all.slice(0, 5));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const persistCardReview = async (cardId, rating) => {
    try { await saveCardReviewApi({ cardId, rating }); } catch { saveCardReview(cardId, rating); }
  };

  const completeReviewSession = async (count) => {
    const totalXp = count * 2;
    try { await completeLearningItem({ itemId: 'daily_review', xpAmount: totalXp }); } catch { completeItem('daily_review', totalXp); }
    setXp(totalXp);
    setDone(true);
    showToast(`✅ ${f(t('learnerPages.dailyReview.toastDone'), { count, xp: totalXp })}`);
  };

  const rate = async (rating) => {
    const card = cards[idx];
    await persistCardReview(card.id, rating);
    const nextReviewed = reviewed + 1;
    setReviewed(nextReviewed);
    if (idx < cards.length - 1) {
      setIdx(idx + 1);
      setFlipped(false);
      return;
    }
    await completeReviewSession(nextReviewed);
  };

  if (loading) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.dailyReview.title')}</div></div>}><div style={{ padding: 16 }}><div className="skeleton skeleton-card" /></div></LearnerLayout>;
  if (done) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.dailyReview.doneTitle')}</div></div>}><div style={{ textAlign: 'center', padding: 40 }}><div style={{ fontSize: 64 }}>✅</div><h2 style={{ fontSize: 24, fontWeight: 800, margin: 8 }}>{t('learnerPages.dailyReview.done')}</h2><p style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>{f(t('learnerPages.dailyReview.reviewed'), { count: reviewed })}</p><p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0 24px' }}>+{xp} điểm</p><button className="btn btn--primary btn--lg btn--full" onClick={() => navigate('/learner/dashboard')}>{t('learnerPages.dailyReview.backHome')}</button></div></LearnerLayout>;
  if (cards.length === 0) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.dailyReview.reviewTitle')}</div></div>}><div className="empty-state"><div className="empty-state__icon">✅</div><div className="empty-state__title">{t('learnerPages.dailyReview.empty')}</div><button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/learner/dashboard')}>{t('learnerPages.dailyReview.backHome')}</button></div></LearnerLayout>;

  const card = cards[idx];
  const cardBack = card.options ? card.options[card.correctIndex] : '';

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.dailyReview.reviewTitle')}</div><div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{idx + 1}/{cards.length}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="progress-bar" style={{ marginBottom: 16 }}><div className="progress-bar__fill" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} /></div>
        <div className={`flashcard${flipped ? ' flashcard--flipped' : ''}`} onClick={() => setFlipped(!flipped)}><div className="flashcard__inner"><div className="flashcard__face"><span className="flashcard__text">{card.front}</span></div><div className="flashcard__face flashcard__back"><span className="flashcard__text">{cardBack}</span></div></div></div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>{t('learnerPages.dailyReview.tapFlip')}</p>
        {flipped && (<div style={{ marginTop: 20 }}><p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t('learnerPages.dailyReview.rememberLevel')}</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>{[{ label: t('learnerPages.dailyReview.forgot'), key: 'forgot', color: '#EF4444' }, { label: t('learnerPages.dailyReview.hard'), key: 'hard', color: '#F59E0B' }, { label: t('learnerPages.dailyReview.ok'), key: 'ok', color: '#3B82F6' }, { label: t('learnerPages.dailyReview.easy'), key: 'easy', color: '#10B981' }].map((button) => <button key={button.key} className="btn" style={{ background: button.color, color: '#fff' }} onClick={() => rate(button.key)}>{button.label}</button>)}</div></div>)}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}



