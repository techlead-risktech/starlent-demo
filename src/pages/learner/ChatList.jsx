import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getConversationsForUser } from '../../data/mockChats.js';
import { users } from '../../data/mockUsers.js';
import { getChatList } from '../../api/services/engagement.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

function mapFallback(conv, currentUserId) {
  const last = conv.messages[conv.messages.length - 1];
  const name = conv.groupName || users.find((u) => u.id === conv.participants.find((p) => p !== currentUserId))?.name || 'Người dùng';
  return {
    id: conv.id,
    type: conv.type,
    name,
    unread: conv.unread || 0,
    resolved: !!conv.resolved,
    lastMessage: last || null,
  };
}

export default function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [convs, setConvs] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getChatList();
        if (!mounted) return;
        setConvs(response.items || []);
      } catch {
        if (!mounted) return;
        const fallback = getConversationsForUser(user?.id).map((conv) => mapFallback(conv, user?.id));
        setConvs(fallback);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Trò chuyện</div></div>}><div style={{ padding: 16 }}><div className="skeleton skeleton-card" /></div></LearnerLayout>;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Trò chuyện</div></div>}>
      {convs.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">💬</div><div className="empty-state__title">Chưa có cuộc trò chuyện</div></div>
      ) : convs.map((conv) => {
        const last = conv.lastMessage;
        return (
          <div key={conv.id} className="card card--hoverable" style={{ marginBottom: 8 }} onClick={() => navigate(`/learner/chat/${conv.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ fontSize: 20 }}>{conv.type === 'group' ? '👥' : '👤'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{conv.name}</span>
                  {last && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(last.timestamp).toLocaleDateString('vi-VN')}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    {last?.type === 'voice' ? '🎤 Tin nhắn thoại' : (last?.type === 'file' ? '📎 File' : last?.text || '')}
                  </span>
                  {conv.unread > 0 && <span className="badge badge--danger" style={{ minWidth: 20, justifyContent: 'center' }}>{conv.unread}</span>}
                  {conv.resolved && <span className="badge badge--success">Đã GP</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </LearnerLayout>
  );
}

