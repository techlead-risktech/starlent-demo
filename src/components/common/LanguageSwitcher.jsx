import { useI18n } from '../../i18n/index.jsx';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        type="button"
        className={`btn btn--sm ${locale === 'vi' ? 'btn--primary' : 'btn--secondary'}`}
        onClick={() => setLocale('vi')}
      >
        VI
      </button>
      <button
        type="button"
        className={`btn btn--sm ${locale === 'en' ? 'btn--primary' : 'btn--secondary'}`}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  );
}

