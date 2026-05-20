import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { getLearningState, setDailyGoal } from '../../utils/auth.js';
import { getLearnerSettings, syncLearnerData, updateLearnerSettings } from '../../api/services/engagement.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

const GOAL_CHOICES = [1, 3, 5, 10];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(true);
  const [noti, setNoti] = useState(true);
  const [sound, setSound] = useState(false);
  const [goal, setGoal] = useState(getLearningState().dailyGoal);
  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getLearnerSettings();
        if (!mounted) return;
        const settings = response.settings || {};
        setOffline(settings.autoDownloadOffline ?? true);
        setNoti(settings.notificationsEnabled ?? true);
        setSound(settings.soundEffectsEnabled ?? false);
        setGoal(settings.dailyGoal ?? getLearningState().dailyGoal);
        setAppVersion(response.app?.version || '1.0.0');
      } catch {
        if (!mounted) return;
        const ls = getLearningState();
        setGoal(ls.dailyGoal);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const persistSettings = async (patch) => {
    try {
      await updateLearnerSettings(patch);
      return true;
    } catch {
      return false;
    }
  };

  const handleGoal = async (n) => {
    const old = goal;
    setGoal(n);
    setDailyGoal(n);
    const ok = await persistSettings({ dailyGoal: n });
    if (!ok) setGoal(old);
    showToast(`🎯 Mục tiêu hằng ngày: ${n} bài`);
  };

  const handleToggle = async (key, current, setter) => {
    const next = !current;
    setter(next);
    const ok = await persistSettings({ [key]: next });
    if (!ok) setter(current);
  };

  const handleSyncData = async () => {
    try {
      await syncLearnerData();
      showToast('🔄 Đã đồng bộ dữ liệu');
    } catch {
      showToast('🔄 Đã đồng bộ (mock)');
    }
  };

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">Cài đặt</div></div>}>
      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="skeleton skeleton-card" />
        ) : (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>🎯 Mục tiêu hằng ngày</h4>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Số bài học bạn muốn hoàn thành mỗi ngày</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {GOAL_CHOICES.map((n) => (
                  <button key={n} className={`btn btn--sm ${goal === n ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleGoal(n)}>{n} bài</button>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🔔 Thông báo</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span>Nhận thông báo đẩy</span>
                <button className={`btn btn--sm ${noti ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleToggle('notificationsEnabled', noti, setNoti)}>{noti ? 'Bật' : 'Tắt'}</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📥 Ngoại tuyến</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span>Tự động tải nội dung</span>
                <button className={`btn btn--sm ${offline ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleToggle('autoDownloadOffline', offline, setOffline)}>{offline ? 'Bật' : 'Tắt'}</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🔊 Âm thanh</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span>Hiệu ứng âm thanh</span>
                <button className={`btn btn--sm ${sound ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleToggle('soundEffectsEnabled', sound, setSound)}>{sound ? 'Bật' : 'Tắt'}</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📊 Dữ liệu</h4>
              <button className="btn btn--secondary btn--full" style={{ marginBottom: 8 }} onClick={handleSyncData}>🔄 Đồng bộ dữ liệu</button>
              <button className="btn btn--secondary btn--full" onClick={() => { localStorage.clear(); logout(); navigate('/login'); }}>🗑️ Xoá dữ liệu cục bộ</button>
            </div>

            <div className="card">
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>ℹ️ Thông tin</h4>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Starlent MicroLearn v{appVersion}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{user?.name}</div>
            </div>
          </>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
