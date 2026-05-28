import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setOnboarded } from '../../utils/auth.js';
import { useI18n } from '../../i18n/index.jsx';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.jsx';

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { t } = useI18n();

  const slides = t('onboarding.slides', []);
  const cur = slides[step] || slides[0];

  const finish = () => {
    setOnboarded();
    navigate('/learner/dashboard');
  };

  return (
    <div className="onboarding">
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', justifyContent: 'flex-end' }}>
        <LanguageSwitcher />
      </div>
      <div className="onboarding__illustration">{cur?.illustration}</div>
      <h1 className="onboarding__title">{cur?.title}</h1>
      <p className="onboarding__desc">{cur?.desc}</p>
      <div className="onboarding__dots">
        {slides.map((_, i) => (
          <div key={i} className={`onboarding__dot${i === step ? ' onboarding__dot--active' : ''}`} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 320 }}>
        {step > 0 && (
          <button className="btn btn--secondary btn--lg btn--full" onClick={() => setStep(step - 1)}>
            {t('onboarding.back')}
          </button>
        )}
        {step < slides.length - 1 ? (
          <button className="btn btn--primary btn--lg btn--full" onClick={() => setStep(step + 1)}>
            {t('onboarding.next')}
          </button>
        ) : (
          <button className="btn btn--primary btn--lg btn--full" onClick={finish}>
            {t('onboarding.start')}
          </button>
        )}
      </div>
      {step < slides.length - 1 && (
        <button style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: 14 }} onClick={finish}>
          {t('onboarding.skip')}
        </button>
      )}
    </div>
  );
}
