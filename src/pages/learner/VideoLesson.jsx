import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { courses } from '../../data/mockCourses.js';
import { completeItem, completeModule, completeCourse, getLearningState } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';

let ytApiReady = false;
const ytCallbacks = [];

function loadYT(callback) {
  if (ytApiReady) { callback(); return; }
  ytCallbacks.push(callback);
  if (window.YT) {
    ytApiReady = true;
    ytCallbacks.forEach((fn) => fn());
    ytCallbacks.length = 0;
    return;
  }
  if (document.getElementById('yt-iframe-api')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    ytCallbacks.forEach((fn) => fn());
    ytCallbacks.length = 0;
  };
}

function fallbackSyncCourseProgress({ itemId, moduleId, courseId, xpAmount }) {
  completeItem(itemId, xpAmount);
  if (!moduleId || !courseId) return;

  const course = courses.find((item) => item.id === courseId);
  const module = course?.modules.find((item) => item.id === moduleId);
  if (!course || !module) return;

  const state = getLearningState();
  const allModuleItemsDone = module.items.every((item) => state.completedItems.includes(item.id) || state.completedItems.includes(item.contentId));
  if (allModuleItemsDone) {
    completeModule(moduleId);
    const latestState = getLearningState();
    const allModulesDone = course.modules.every((item) => latestState.completedModules.includes(item.id));
    if (allModulesDone) completeCourse(courseId);
  }
}

export default function VideoLesson() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [xp, setXp] = useState(0);

  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const ytContainerId = useRef(`yt-player-${Date.now()}`);

  useEffect(() => { setContent(getContentById(contentId)); }, [contentId]);

  const markAsDone = async () => {
    if (done) return;
    const earnedXp = 15;
    const resolvedItemId = itemId || content.id;
    try {
      await completeLearningItem({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: earnedXp,
      });
    } catch {
      fallbackSyncCourseProgress({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: earnedXp,
      });
    }

    setXp(earnedXp);
    setProgress(100);
    setDone(true);
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    showToast(`✅ Đã hoàn thành video! +${earnedXp} XP`);
  };

  useEffect(() => {
    if (!content?.youtubeId) return;
    loadYT(() => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(ytContainerId.current, {
        videoId: content.youtubeId,
        playerVars: { rel: 0, modestbranding: 1, controls: 1 },
        events: {
          onReady: () => {
            const poll = () => {
              if (!playerRef.current?.getCurrentTime) return;
              const current = playerRef.current.getCurrentTime() || 0;
              const duration = playerRef.current.getDuration() || 1;
              const pct = Math.min(Math.round((current / duration) * 100), 100);
              setProgress(pct);
              if (pct >= 95 && !done) {
                markAsDone();
                return;
              }
              progressTimerRef.current = setTimeout(poll, 1000);
            };
            poll();
          },
          onStateChange: (event) => {
            if (event.data === 0 && !done) {
              setProgress(100);
              markAsDone();
            }
          },
        },
      });
    });
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [content?.youtubeId, content?.id]);

  const isDirty = progress > 0 && !done;
  usePreventLeave(isDirty);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const handleBack = () => { if (isDirty) { setShowLeaveModal(true); return; } navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleLeave = () => { setShowLeaveModal(false); navigate(courseId ? `/learner/course/${courseId}` : -1); };
  const handleStay = () => { setShowLeaveModal(false); };

  if (!content) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{content.title}</div></div>}>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#1a1a2e' }}>
          {content.youtubeId ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <div id={ytContainerId.current} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#fff', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Video demo - không có sẵn</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.floor(progress)}%</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          {content.youtubeId ? '🟢 Tiến trình đồng bộ với YouTube - xem hết video để hoàn thành' : content.captions}
        </p>

        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📝 Lời thoại</h4>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{content.transcript}</p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-success)' }}>✅ Bài học đã hoàn thành!</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0' }}>+{xp} XP</p>
            <button className="btn btn--primary" style={{ marginTop: 12 }} onClick={handleBack}>
              {courseId ? '← Về khoá học' : 'Quay lại'}
            </button>
          </div>
        ) : (
          <button className="btn btn--success btn--lg btn--full" onClick={markAsDone} disabled={progress < 80}>
            {progress < 80 ? `⏳ Đang xem... (${Math.floor(progress)}% - cần ≥80%)` : '✅ Đánh dấu đã hoàn thành'}
          </button>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}

