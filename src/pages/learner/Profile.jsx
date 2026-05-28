import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getLearningState } from '../../utils/auth.js';
import { badges, getCertificatesForUser } from '../../data/mockChats.js';
import { getLearnerProfile } from '../../api/services/engagement.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getLearnerProfile();
        if (!mounted) return;
        setProfile(response);
      } catch {
        if (!mounted) return;
        const ls = getLearningState();
        const certs = getCertificatesForUser(user?.id);
        const level = Math.floor((ls?.xp || user?.xp || 0) / 500) + 1;
        const unlocked = badges.filter((b) => b.unlockedAt !== null || ls?.unlockedBadges?.includes(b.id));
        setProfile({
          user,
          stats: {
            streak: ls?.streak || user?.streak || 0,
            xp: ls?.xp || user?.xp || 0,
            level,
            completedCourses: ls?.completedCourses?.length || 0,
          },
          badges: unlocked,
          certificates: certs,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const profileUser = profile?.user || user;
  const stats = profile?.stats || {};
  const unlocked = profile?.badges || [];
  const certs = profile?.certificates || [];

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.profile.title')}</div></div>}>
      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="skeleton skeleton-card" />
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="avatar avatar--lg" style={{ margin: '0 auto 12px', fontSize: 32, background: 'var(--color-primary)', color: '#fff' }}>{profileUser?.name?.charAt(0)}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{profileUser?.name}</h2><p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{profileUser?.department}</p>
              <span className="badge badge--primary">{f(t('learnerPages.profile.level'), { level: stats.level || 1 })}</span>
            </div>
            <div className="grid-3" style={{ marginBottom: 24 }}>
              <div className="stat-card"><div className="stat-card__label">🔥 {t('learnerPages.profile.streak')}</div><div className="stat-card__value">{stats.streak || 0}</div></div>
              <div className="stat-card"><div className="stat-card__label">⭐ {t('learnerPages.profile.totalXp')}</div><div className="stat-card__value">{(stats.xp || 0).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}</div></div>
              <div className="stat-card"><div className="stat-card__label">📚 {t('learnerPages.profile.courses')}</div><div className="stat-card__value">{stats.completedCourses || 0}</div></div>
            </div>
            {unlocked.length > 0 && <div style={{ marginBottom: 24 }}><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🏅 {f(t('learnerPages.profile.badges'), { count: unlocked.length })}</h3><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{unlocked.map((b) => <div key={b.id} className="card" style={{ padding: 12, textAlign: 'center', minWidth: 80 }}><div style={{ fontSize: 28 }}>{b.icon}</div><div style={{ fontSize: 11, fontWeight: 600 }}>{b.name}</div></div>)}</div></div>}
            {certs.length > 0 && <div style={{ marginBottom: 24 }}><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🎓 {t('learnerPages.profile.certificates')}</h3>{certs.map((c) => <div key={c.id} className="card" style={{ marginBottom: 8 }} onClick={() => navigate(`/learner/certificate/${c.id}`)}><div style={{ fontWeight: 700, fontSize: 14 }}>{c.courseName}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{f(t('learnerPages.profile.certScore'), { date: new Date(c.completionDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN'), score: c.score })}</div></div>)}</div>}
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <button className="btn btn--secondary btn--full" onClick={() => navigate('/learner/leaderboard')}>🏆 {t('learnerPages.profile.leaderboard')}</button>
              <button className="btn btn--secondary btn--full" onClick={() => navigate('/learner/offline')}>📥 {t('learnerPages.profile.offline')}</button>
            </div>
            <button className="btn btn--secondary btn--full" style={{ marginBottom: 8 }} onClick={() => navigate('/learner/explore')}>🔍 {t('learnerPages.profile.explore')}</button>
            <button className="btn btn--secondary btn--full" style={{ marginBottom: 8 }} onClick={() => navigate('/learner/settings')}>⚙️ {t('learnerPages.profile.settings')}</button>
            <button className="btn btn--ghost btn--full" style={{ color: 'var(--color-danger)' }} onClick={() => { logout(); navigate('/login'); }}>🚪 {t('common.logout')}</button>
          </>
        )}
      </div>
    </LearnerLayout>
  );
}

