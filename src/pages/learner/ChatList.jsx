import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getConversationsForUser } from '../../data/mockChats.js';
import { users } from '../../data/mockUsers.js';
import { getChatList } from '../../api/services/engagement.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

const ICON_CHAT = '\u{1F4AC}';
const ICON_GROUP = '\u{1F465}';
const ICON_USER = '\u{1F464}';
const ICON_VOICE = '\u{1F3A4}';
const ICON_FILE = '\u{1F4CE}';

function mapFallback(conv, currentUserId, t) {
  const last = conv.messages[conv.messages.length - 1];
  const name = conv.groupName || users.find((u) => u.id === conv.participants.find((p) => p !== currentUserId))?.name || t('learnerPages.chatTrainer.userFallback');
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
  const { t, locale } = useI18n();
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
        const fallback = getConversationsForUser(user?.id).map((conv) => mapFallback(conv, user?.id, t));
        setConvs(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user, t]);

  if (loading) {
    return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('nav.learner.chats')}</div></div>}><div style={{ padding: 16 }}><div className="skeleton skeleton-card" /></div></LearnerLayout>;
  }

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('nav.learner.chats')}</div></div>}>
      {convs.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">{ICON_CHAT}</div><div className="empty-state__title">{t('learnerPages.chatList.empty')}</div></div>
      ) : convs.map((conv) => {
        const last = conv.lastMessage;
        return (
          <div key={conv.id} className="card card--hoverable" style={{ marginBottom: 8 }} onClick={() => navigate(`/learner/chat/${conv.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ fontSize: 20 }}>{conv.type === 'group' ? ICON_GROUP : ICON_USER}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{conv.name}</span>
                  {last && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(last.timestamp).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    {last?.type === 'voice' ? `${ICON_VOICE} ${t('learnerPages.chatTrainer.voiceMessage')}` : (last?.type === 'file' ? `${ICON_FILE} ${t('learnerPages.chatList.file')}` : last?.text || '')}
                  </span>
                  {conv.unread > 0 && <span className="badge badge--danger" style={{ minWidth: 20, justifyContent: 'center' }}>{conv.unread}</span>}
                  {conv.resolved && <span className="badge badge--success">{t('learnerPages.chatList.resolved')}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </LearnerLayout>
  );
}
