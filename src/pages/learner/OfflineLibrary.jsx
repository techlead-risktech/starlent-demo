import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningState } from '../../utils/auth.js';
import { courses } from '../../data/mockCourses.js';
import { getOfflineLibrary, syncOfflineLibrary } from '../../api/services/engagement.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

function fallbackOffline() {
  const ls = getLearningState();
  const downloads = ls?.offlineDownloads || [];
  const items = downloads.map((id) => {
    const course = courses.find((c) => c.id === id);
    return {
      id,
      title: course?.title || id,
      moduleCount: course?.moduleCount || 0,
    };
  });
  return {
    items,
    summary: {
      total: items.length,
      storageMB: Number((items.length * 4.2).toFixed(1)),
    },
  };
}

export default function OfflineLibrary() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], summary: { total: 0, storageMB: 0 } });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getOfflineLibrary();
        if (!mounted) return;
        setData({
          items: response.items || [],
          summary: response.summary || { total: 0, storageMB: 0 },
        });
      } catch {
        if (!mounted) return;
        setData(fallbackOffline());
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleSync = async () => {
    try {
      await syncOfflineLibrary();
      showToast(`🔄 ${t('learnerPages.offline.syncOk')}`);
    } catch {
      showToast(`🔄 ${t('learnerPages.offline.syncMock')}`);
    }
  };

  const downloads = data.items || [];
  const storageMB = data.summary?.storageMB || 0;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.offline.title')}</div></div>}>
      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="skeleton skeleton-card" />
        ) : (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 700, fontSize: 16 }}>📥 {f(t('learnerPages.offline.summary'), { count: downloads.length })}</div><div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{f(t('learnerPages.offline.downloadedSize'), { size: storageMB.toFixed(1) })}</div></div>
                <button className="btn btn--primary btn--sm" onClick={handleSync}>🔄 {t('learnerPages.offline.sync')}</button>
              </div>
            </div>
            {downloads.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">📥</div><div className="empty-state__title">{t('learnerPages.offline.empty')}</div><div className="empty-state__desc">{t('learnerPages.offline.emptyDesc')}</div><button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/learner/explore')}>{t('learnerPages.offline.exploreCourses')}</button></div>
            ) : (
              downloads.map((d) => (
                <div key={d.id} className="card" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>📖</span>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{d.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{f(t('learnerPages.offline.downloadedModules'), { count: d.moduleCount })}</div></div>
                    <span className="badge badge--success">{t('learnerPages.offline.downloaded')}</span>
                  </div>
                </div>
              ))
            )}
            {downloads.length > 0 && <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>⚠️ {t('learnerPages.offline.needSyncHint')}</div>}
          </>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}

