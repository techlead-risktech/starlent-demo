import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { getLearningState, setDailyGoal } from '../../utils/auth.js';
import { getLearnerSettings, syncLearnerData, updateLearnerSettings } from '../../api/services/engagement.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

const GOAL_CHOICES = [1, 3, 5, 10];
const ICON_BACK = '←';
const ICON_TARGET = '🎯';
const ICON_BELL = '🔔';
const ICON_OFFLINE = '📥';
const ICON_SOUND = '🔊';
const ICON_DATA = '📊';
const ICON_SYNC = '🔄';
const ICON_TRASH = '🗑️';
const ICON_INFO = 'ℹ️';

function formatText(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { t } = useI18n();
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
    showToast(`${ICON_TARGET} ${formatText(t('learnerPages.settings.goalToast'), { count: n })}`);
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
      showToast(`${ICON_SYNC} ${t('learnerPages.settings.syncSuccess')}`);
    } catch {
      showToast(`${ICON_SYNC} ${t('learnerPages.settings.syncMock')}`);
    }
  };

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>{ICON_BACK} {t('learnerPages.common.back')}</button><div className="page__title">{t('learnerPages.settings.title')}</div></div>}>
      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="skeleton skeleton-card" />
        ) : (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{ICON_TARGET} {t('learnerPages.settings.dailyGoalTitle')}</h4>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>{t('learnerPages.settings.dailyGoalDesc')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {GOAL_CHOICES.map((n) => (
                  <button key={n} className={`btn btn--sm ${goal === n ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleGoal(n)}>
                    {formatText(t('learnerPages.settings.lessonsPerDay'), { count: n })}
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{ICON_BELL} {t('learnerPages.settings.notificationsTitle')}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span>{t('learnerPages.settings.pushNoti')}</span>
                <button className={`btn btn--sm ${noti ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleToggle('notificationsEnabled', noti, setNoti)}>{noti ? t('learnerPages.settings.on') : t('learnerPages.settings.off')}</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{ICON_OFFLINE} {t('learnerPages.settings.offlineTitle')}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span>{t('learnerPages.settings.autoDownload')}</span>
                <button className={`btn btn--sm ${offline ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleToggle('autoDownloadOffline', offline, setOffline)}>{offline ? t('learnerPages.settings.on') : t('learnerPages.settings.off')}</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{ICON_SOUND} {t('learnerPages.settings.soundTitle')}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span>{t('learnerPages.settings.soundEffects')}</span>
                <button className={`btn btn--sm ${sound ? 'btn--primary' : 'btn--secondary'}`} onClick={() => handleToggle('soundEffectsEnabled', sound, setSound)}>{sound ? t('learnerPages.settings.on') : t('learnerPages.settings.off')}</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{ICON_DATA} {t('learnerPages.settings.dataTitle')}</h4>
              <button className="btn btn--secondary btn--full" style={{ marginBottom: 8 }} onClick={handleSyncData}>{ICON_SYNC} {t('learnerPages.settings.syncData')}</button>
              <button className="btn btn--secondary btn--full" onClick={() => { localStorage.clear(); logout(); navigate('/login'); }}>{ICON_TRASH} {t('learnerPages.settings.clearLocalData')}</button>
            </div>

            <div className="card">
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{ICON_INFO} {t('learnerPages.settings.infoTitle')}</h4>
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



