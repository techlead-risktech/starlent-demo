import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { courses } from '../../data/mockCourses.js';
import { completeItem, completeModule, completeCourse, getLearningState } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';
import Modal from '../../components/common/Modal.jsx';

let ytApiReady = false;
const ytCallbacks = [];

function loadYT(callback) {
  if (ytApiReady) {
    callback();
    return;
  }
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

function fmt(seconds) {
  const clamped = Math.max(0, Math.floor(Number(seconds || 0)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function toSegments(content) {
  if (Array.isArray(content?.transcriptSegments) && content.transcriptSegments.length > 0) {
    return content.transcriptSegments.map((segment, idx) => ({
      id: String(segment?.id || `seg_${idx + 1}`),
      startSec: Math.max(0, Number(segment?.startSec || 0)),
      endSec: Math.max(0, Number(segment?.endSec || 0)),
      text: String(segment?.text || ''),
    }));
  }
  return [{
    id: 'seg_1',
    startSec: 0,
    endSec: Math.max(0, Number(content?.duration || 0)),
    text: String(content?.transcript || ''),
  }];
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
  const [currentSec, setCurrentSec] = useState(0);
  const [ytDurationSec, setYtDurationSec] = useState(0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [checkpointAnswers, setCheckpointAnswers] = useState({});
  const [checkpointResult, setCheckpointResult] = useState(null);

  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const ytContainerId = useRef(`yt-player-${Date.now()}`);
  const checkpointKeyRef = useRef(new Set());
  const checkpointsRef = useRef([]);
  const activeCheckpointRef = useRef(null);

  useEffect(() => { setContent(getContentById(contentId)); }, [contentId]);

  const progressMode = String(content?.progressMode || 'lesson_duration');
  const configuredDuration = Math.max(0, Number(content?.duration || 0));
  const useFullVideoDuration = progressMode === 'full_video_duration';
  const duration = useFullVideoDuration
    ? Math.max(0, ytDurationSec || configuredDuration)
    : (configuredDuration > 0 ? configuredDuration : Math.max(0, ytDurationSec));
  const transcriptSegments = useMemo(() => toSegments(content), [content]);
  const checkpoints = useMemo(() => (
    Array.isArray(content?.checkpoints)
      ? content.checkpoints
          .map((checkpoint, idx) => ({
            id: String(checkpoint?.id || `cp_${idx + 1}`),
            atSec: Math.max(0, Number(checkpoint?.atSec || 0)),
            question: String(checkpoint?.question || ''),
            options: Array.isArray(checkpoint?.options) ? checkpoint.options.map((option) => String(option || '')) : [],
            correctIndex: Number(checkpoint?.correctIndex || 0),
          }))
          .sort((a, b) => a.atSec - b.atSec)
      : []
  ), [content]);

  useEffect(() => {
    checkpointsRef.current = checkpoints;
  }, [checkpoints]);

  useEffect(() => {
    activeCheckpointRef.current = activeCheckpoint;
  }, [activeCheckpoint]);

  const activeSegmentId = useMemo(() => {
    const found = transcriptSegments.find((segment) => currentSec >= segment.startSec && currentSec <= segment.endSec);
    return found?.id || transcriptSegments[transcriptSegments.length - 1]?.id || null;
  }, [currentSec, transcriptSegments]);

  const checkpointPassedCount = Object.values(checkpointAnswers).filter((answer) => answer?.correct).length;
  const checkpointAnsweredCount = Object.keys(checkpointAnswers).length;
  const checkpointTotal = checkpoints.length;
  const checkpointSatisfied = checkpointPassedCount >= checkpointTotal;
  const canMarkDone = progress >= 80 && checkpointSatisfied;

  const isDirty = progress > 0 && !done;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);

  useEffect(() => {
    checkpointKeyRef.current = new Set();
    setCheckpointAnswers({});
    setCheckpointResult(null);
    setActiveCheckpoint(null);
    setCurrentSec(0);
    setYtDurationSec(0);
    setProgress(0);
    setDone(false);
    setXp(0);
  }, [contentId]);

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
              const rawDuration = playerRef.current.getDuration() || 0;
              if (rawDuration > 0) {
                setYtDurationSec((prev) => (Math.floor(prev) === Math.floor(rawDuration) ? prev : rawDuration));
              }
              const lessonDuration = (
                useFullVideoDuration
                  ? (rawDuration || configuredDuration)
                  : (configuredDuration > 0 ? configuredDuration : rawDuration)
              ) || 1;
              const pct = Math.min(Math.round((current / lessonDuration) * 100), 100);

              setCurrentSec(current);
              setProgress(pct);

              if (!activeCheckpointRef.current && checkpointsRef.current.length > 0) {
                const target = checkpointsRef.current.find((checkpoint) => {
                  const key = `${checkpoint.id}_${checkpoint.atSec}`;
                  return current >= checkpoint.atSec && !checkpointKeyRef.current.has(key);
                });
                if (target) {
                  checkpointKeyRef.current.add(`${target.id}_${target.atSec}`);
                  try { playerRef.current.pauseVideo(); } catch { /* ignore */ }
                  setActiveCheckpoint(target);
                }
              }

              progressTimerRef.current = setTimeout(poll, 500);
            };
            poll();
          },
        },
      });
    });
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
  }, [content?.youtubeId, content?.id, configuredDuration, useFullVideoDuration]);

  const markAsDone = async () => {
    if (done || !canMarkDone) return;
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
    setDone(true);
    showToast(`Đã hoàn thành video! +${earnedXp} điểm`);
  };

  const submitCheckpoint = (selectedIndex) => {
    if (!activeCheckpoint || checkpointResult) return;
    const isCorrect = Number(selectedIndex) === Number(activeCheckpoint.correctIndex || 0);
    setCheckpointAnswers((prev) => ({
      ...prev,
      [activeCheckpoint.id]: {
        atSec: activeCheckpoint.atSec,
        selectedIndex,
        correct: isCorrect,
      },
    }));
    setCheckpointResult({
      isCorrect,
      correctLabel: String((activeCheckpoint.options || [])[activeCheckpoint.correctIndex] || ''),
    });
  };

  const continueCheckpoint = () => {
    setCheckpointResult(null);
    setActiveCheckpoint(null);
    try { playerRef.current?.playVideo?.(); } catch { /* ignore */ }
  };

  const seekTo = (seconds) => {
    const next = Math.max(0, Number(seconds || 0));
    try { playerRef.current?.seekTo?.(next, true); } catch { /* ignore */ }
    setCurrentSec(next);
  };

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveModal(true);
      return;
    }
    navigate(courseId ? `/learner/course/${courseId}` : -1);
  };

  const handleLeave = () => {
    setShowLeaveModal(false);
    navigate(courseId ? `/learner/course/${courseId}` : -1);
  };

  const handleStay = () => {
    setShowLeaveModal(false);
  };

  if (!content) {
    return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;
  }

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
          {content.youtubeId
            ? (useFullVideoDuration
              ? `Tiến trình theo thời lượng video YouTube ${Math.floor(ytDurationSec || duration)}s.`
              : `Tiến trình theo thời lượng bài học ${Math.floor(duration)}s${ytDurationSec > 0 && configuredDuration > 0 ? ` (video gốc ${Math.floor(ytDurationSec)}s)` : ''}.`)
            : content.captions}
        </p>

        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📝 Lời thoại</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transcriptSegments.map((segment) => {
              const active = activeSegmentId === segment.id;
              return (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => seekTo(segment.startSec)}
                  className="btn btn--ghost btn--full"
                  style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    padding: '10px 12px',
                    background: active ? 'var(--color-primary-light)' : 'transparent',
                    border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    whiteSpace: 'normal',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 10, flex: '0 0 auto', paddingTop: 2 }}>
                    {fmt(segment.startSec)}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', flex: 1 }}>
                    {segment.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {checkpointTotal > 0 && (
          <div className="card" style={{ marginBottom: 16, background: '#F8FAFC' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>✅ Checkpoint</h4>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Đã đúng {checkpointPassedCount}/{checkpointTotal} checkpoint (đã trả lời {checkpointAnsweredCount}/{checkpointTotal}).
            </div>
          </div>
        )}

        {done ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-success)' }}>Bài học đã hoàn thành!</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0' }}>+{xp} điểm</p>
            <button className="btn btn--primary" style={{ marginTop: 12 }} onClick={handleBack}>
              {courseId ? 'Về khoá học' : 'Quay lại'}
            </button>
          </div>
        ) : (
          <button className="btn btn--success btn--lg btn--full" onClick={markAsDone} disabled={!canMarkDone} style={{ whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' }}>
            Đánh dấu hoàn thành {!canMarkDone ? '(xem ≥80% + trả lời đúng checkpoint)' : ''}
          </button>
        )}
      </div>

      <Modal open={!!activeCheckpoint} onClose={() => {}}>
        {activeCheckpoint && (
          <div style={{ width: 'min(92vw, 520px)', maxWidth: '100%' }}>
            <h3 style={{ marginBottom: 8 }}>Checkpoint tại {fmt(activeCheckpoint.atSec)}</h3>
            <p style={{ marginBottom: 12, fontWeight: 600 }}>{activeCheckpoint.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeCheckpoint.options.map((option, idx) => {
                const selectedIndex = checkpointAnswers[activeCheckpoint.id]?.selectedIndex;
                const correctIndex = Number(activeCheckpoint.correctIndex || 0);
                const showResult = !!checkpointResult;
                const isSelected = Number(selectedIndex) === idx;
                const isCorrectOption = correctIndex === idx;
                let background;
                let border;
                let color;
                if (showResult && isCorrectOption) {
                  background = '#ECFDF3';
                  border = '1px solid #34D399';
                  color = '#065F46';
                } else if (showResult && isSelected && !isCorrectOption) {
                  background = '#FEF2F2';
                  border = '1px solid #FCA5A5';
                  color = '#991B1B';
                }
                return (
                  <button
                    key={`${activeCheckpoint.id}_${idx}`}
                    className="btn btn--secondary btn--full"
                    onClick={() => submitCheckpoint(idx)}
                    disabled={!!checkpointResult}
                    style={{ background, border, color, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    {option}
                    {showResult && isCorrectOption ? '  ✓' : ''}
                    {showResult && isSelected && !isCorrectOption ? '  ✗' : ''}
                  </button>
                );
              })}
            </div>
            {checkpointResult && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, marginBottom: 10, color: checkpointResult.isCorrect ? '#166534' : '#B91C1C' }}>
                  {checkpointResult.isCorrect
                    ? '✅ Chính xác'
                    : `❌ Chưa đúng. Đáp án đúng: ${checkpointResult.correctLabel}`}
                </div>
                <button className="btn btn--primary btn--full" onClick={continueCheckpoint}>
                  Tiếp tục
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && <div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}
