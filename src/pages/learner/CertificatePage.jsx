import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findCertificateById } from '../../data/mockChats.js';
import { getCertificateById } from '../../api/services/engagement.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

const ICON_SEARCH = '\u{1F50D}';
const ICON_BACK = '\u{2190}';
const ICON_SEAL = '\u{1F393}';
const ICON_DATE = '\u{1F4C5}';
const ICON_SCORE = '\u{2B50}';
const ICON_DURATION = '\u{23F1}';
const ICON_DOWNLOAD = '\u{1F4E5}';
const ICON_SHARE = '\u{1F4E4}';

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function CertificatePage() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { t, locale } = useI18n();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getCertificateById(certId);
        if (!mounted) return;
        setCert(response.certificate || null);
      } catch {
        if (!mounted) return;
        setCert(findCertificateById(certId));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [certId]);

  if (loading) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.certificate.title')}</div></div>}><div style={{ padding: 16 }}><div className="skeleton skeleton-card" /></div></LearnerLayout>;
  if (!cert) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.certificate.title')}</div></div>}><div className="empty-state"><div className="empty-state__icon">{ICON_SEARCH}</div><div className="empty-state__title">{t('learnerPages.certificate.notFound')}</div></div></LearnerLayout>;

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>{ICON_BACK} {t('learnerPages.common.back')}</button><div className="page__title">{t('learnerPages.certificate.title')}</div></div>}>
      <div style={{ padding: 16 }}>
        <div className="certificate"><div className="certificate__seal">{ICON_SEAL}</div>
          <div className="certificate__title">{t('learnerPages.certificate.header')}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('learnerPages.certificate.issuedBy')}</div>
          <div className="certificate__name">{cert.userName}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{t('learnerPages.certificate.completed')}</div>
          <div className="certificate__course">{cert.courseName}</div>
          <div className="certificate__meta">
            <div><div style={{ fontWeight: 700 }}>{ICON_DATE} {t('learnerPages.certificate.date')}</div>{new Date(cert.completionDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}</div>
            <div><div style={{ fontWeight: 700 }}>{ICON_SCORE} {t('learnerPages.certificate.score')}</div>{cert.score}/100</div>
            <div><div style={{ fontWeight: 700 }}>{ICON_DURATION} {t('learnerPages.certificate.duration')}</div>{f(t('learnerPages.certificate.durationMinutes'), { minutes: cert.duration })}</div>
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--color-text-muted)' }}>{t('learnerPages.certificate.verifyCode')}: <strong>{cert.verificationCode}</strong></div>
        </div>
        <div className="grid-2" style={{ marginTop: 20 }}>
          <button className="btn btn--primary btn--full" onClick={() => showToast(`${ICON_DOWNLOAD} ${t('learnerPages.certificate.downloadMock')}`)}>{ICON_DOWNLOAD} {t('learnerPages.certificate.downloadPdf')}</button>
          <button className="btn btn--secondary btn--full" onClick={() => showToast(`${ICON_SHARE} ${t('learnerPages.certificate.shareMock')}`)}>{ICON_SHARE} {t('learnerPages.certificate.share')}</button>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
