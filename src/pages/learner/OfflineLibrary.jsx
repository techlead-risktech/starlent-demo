import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningState } from '../../utils/auth.js';
import { courses } from '../../data/mockCourses.js';
import { getOfflineLibrary, syncOfflineLibrary } from '../../api/services/engagement.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

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
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleSync = async () => {
    try {
      await syncOfflineLibrary();
      showToast('🔄 Đã đồng bộ hoá');
    } catch {
      showToast('🔄 Đồng bộ hoá... (mock)');
    }
  };

  const downloads = data.items || [];
  const storageMB = data.summary?.storageMB || 0;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Thư viện ngoại tuyến</div></div>}>
      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="skeleton skeleton-card" />
        ) : (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 700, fontSize: 16 }}>📥 {downloads.length} nội dung</div><div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{storageMB.toFixed(1)} MB đã tải</div></div>
                <button className="btn btn--primary btn--sm" onClick={handleSync}>🔄 Đồng bộ</button>
              </div>
            </div>
            {downloads.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">📥</div><div className="empty-state__title">Chưa có nội dung tải về</div><div className="empty-state__desc">Tải nội dung từ khoá học để học ngoại tuyến.</div><button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/learner/explore')}>Khám phá khoá học</button></div>
            ) : (
              downloads.map((d) => (
                <div key={d.id} className="card" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>📖</span>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{d.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Đã tải · {d.moduleCount} module</div></div>
                    <span className="badge badge--success">Đã tải</span>
                  </div>
                </div>
              ))
            )}
            {downloads.length > 0 && <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>⚠️ Một số nội dung có thể cần đồng bộ lại</div>}
          </>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}

