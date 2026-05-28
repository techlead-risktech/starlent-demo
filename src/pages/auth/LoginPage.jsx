import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ROLE_ROUTES } from '../../data/mockUsers.js';
import { useI18n } from '../../i18n/index.jsx';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.jsx';

const DEMO_ACCOUNTS = [
  { key: 'auth.learner', email: 'learner@starlent.demo' },
  { key: 'auth.trainer', email: 'trainer@starlent.demo' },
  { key: 'auth.editor', email: 'editor@starlent.demo' },
  { key: 'auth.learningManager', email: 'learning.manager@starlent.demo' },
  { key: 'auth.departmentManager', email: 'dept.manager@starlent.demo' },
  { key: 'auth.admin', email: 'admin@starlent.demo' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('learner@starlent.demo');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) navigate(ROLE_ROUTES[result.user.role] || '/learner/dashboard');
    else setError(result.error || t('auth.loginFailed'));
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <LanguageSwitcher />
        </div>
        <div className="login-card__logo">
          <div className="login-card__logo-icon">📚</div>
          <div className="login-card__logo-text">{t('auth.appTitle')}</div>
          <div className="login-card__subtitle">{t('auth.tagline')}</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label" htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              className={`input${error ? ' input--error' : ''}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@starlent.demo"
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: 8 }}>
            <label className="input-label" htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className={`input${error ? ' input--error' : ''}`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
              required
            />
          </div>
          {error && <p className="input-error-msg" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 8 }}>{t('auth.demoAccounts')}</p>
          <div style={{ display: 'grid', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.email} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{t(account.key)}</span>
                <span>{account.email} / 123456</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

