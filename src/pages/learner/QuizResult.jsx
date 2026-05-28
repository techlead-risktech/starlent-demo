import { useLocation, useNavigate } from 'react-router-dom';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

const ICON_RESULT = '📊';
const ICON_PASS = '🎉';
const ICON_FAIL = '😔';
const ICON_OK = '✅';
const ICON_NO = '❌';

function formatText(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function QuizResult() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { quizTitle, score, total, answers, questions } = loc.state || {};

  if (!quizTitle) {
    return (
      <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.quizResult.title')}</div></div>}>
        <div className="empty-state"><div className="empty-state__icon">{ICON_RESULT}</div><div className="empty-state__title">{t('learnerPages.quizResult.noData')}</div></div>
      </LearnerLayout>
    );
  }

  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.quizResult.title')}</div></div>}>
      <div style={{ padding: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}><div style={{ fontSize: 72 }}>{passed ? ICON_PASS : ICON_FAIL}</div><h2 style={{ fontSize: 24, fontWeight: 800, margin: '4px 0' }}>{passed ? t('learnerPages.quizResult.passedTitle') : t('learnerPages.quizResult.failedTitle')}</h2><p style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>{quizTitle}</p></div>
        <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: passed ? 'var(--color-success)' : 'var(--color-danger)' }}>{score}/{total}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{pct}%</div>
          <div className="progress-bar" style={{ marginTop: 12 }}><div className="progress-bar__fill" style={{ width: `${pct}%`, background: passed ? 'var(--color-success)' : 'var(--color-danger)' }} /></div>
        </div>
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-card__label">{ICON_OK} {t('learnerPages.quizResult.correct')}</div><div className="stat-card__value" style={{ color: 'var(--color-success)' }}>{score}</div></div>
          <div className="stat-card"><div className="stat-card__label">{ICON_NO} {t('learnerPages.quizResult.wrong')}</div><div className="stat-card__value" style={{ color: 'var(--color-danger)' }}>{total - score}</div></div>
        </div>
        {questions && <div style={{ marginBottom: 20 }}><h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t('learnerPages.quizResult.details')}</h4>
          {questions.map((q, i) => {
            const ans = answers.find((a) => a.questionId === q.id);
            return (
              <div key={q.id} className="card" style={{ marginBottom: 8, padding: 12, background: ans?.correct ? 'var(--color-success-light)' : 'var(--color-danger-light)', borderColor: ans?.correct ? 'var(--color-success)' : 'var(--color-danger)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{i + 1}. {q.question}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {formatText(t('learnerPages.quizResult.answered'), { selected: q.options[ans?.selected], status: ans?.correct ? ICON_OK : ICON_NO })}
                  {!ans?.correct && <span> - {formatText(t('learnerPages.quizResult.correctAnswer'), { correct: q.options[q.correctIndex] })}</span>}
                </div>
              </div>
            );
          })}
        </div>}
        <button className="btn btn--primary btn--lg btn--full" onClick={() => navigate(-1)}>{t('learnerPages.common.back')}</button>
        {!passed && <button className="btn btn--secondary btn--lg btn--full" style={{ marginTop: 8 }} onClick={() => navigate(-1)}>{t('learnerPages.quizResult.retry')}</button>}
      </div>
    </LearnerLayout>
  );
}



