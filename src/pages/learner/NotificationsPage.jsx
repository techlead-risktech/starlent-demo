import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getNotificationsForUser } from '../../data/mockChats.js';
import { getNotifications } from '../../api/services/engagement.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

const ICONS = { reminder: '🔔', review: '🔄', achievement: '🎉', badge: '🏅', deadline: '⏰', chat: '💬' };

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notis, setNotis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getNotifications();
        if (!mounted) return;
        setNotis(response.items || []);
      } catch {
        if (!mounted) return;
        setNotis(getNotificationsForUser(user?.id));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Thông báo</div></div>}>
      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="skeleton skeleton-card" />
        ) : notis.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">🔔</div><div className="empty-state__title">Không có thông báo</div></div>
        ) : notis.map((n) => (
          <div key={n.id} className="card" style={{ marginBottom: 8, padding: 12, opacity: n.read ? 0.5 : 1 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{ICONS[n.type] || '📌'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{n.body}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{new Date(n.timestamp).toLocaleString('vi-VN')}</div>
              </div>
              {!n.read && <span className="badge badge--danger" style={{ alignSelf: 'flex-start' }}>Mới</span>}
            </div>
          </div>
        ))}
      </div>
    </LearnerLayout>
  );
}

