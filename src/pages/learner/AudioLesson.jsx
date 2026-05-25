import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { completeLearningItem } from '../../api/services/learning.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';
import Modal from '../../components/common/Modal.jsx';

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

export default function AudioLesson() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const itemId = searchParams.get('itemId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [content, setContent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [done, setDone] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [checkpointAnswers, setCheckpointAnswers] = useState({});
  const [checkpointResult, setCheckpointResult] = useState(null);
  const timerRef = useRef(null);
  const checkpointKeyRef = useRef(new Set());

  useEffect(() => { setContent(getContentById(contentId)); }, [contentId]);

  const duration = Math.max(0, Number(content?.duration || 0));
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

  const isDirty = time > 0 && !done;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);

  useEffect(() => {
    checkpointKeyRef.current = new Set();
    setCheckpointAnswers({});
    setActiveCheckpoint(null);
    setCheckpointResult(null);
    setTime(0);
    setPlaying(false);
    setDone(false);
  }, [contentId]);

  useEffect(() => {
    if (!playing || activeCheckpoint || time >= duration) return undefined;
    timerRef.current = setInterval(() => {
      setTime((value) => Math.min(value + (speed * 0.5), duration));
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [playing, time, duration, speed, activeCheckpoint]);

  useEffect(() => {
    if (!playing || activeCheckpoint || checkpoints.length === 0) return;
    const target = checkpoints.find((checkpoint) => {
      const key = `${checkpoint.id}_${checkpoint.atSec}`;
      return time >= checkpoint.atSec && !checkpointKeyRef.current.has(key);
    });
    if (!target) return;
    const key = `${target.id}_${target.atSec}`;
    checkpointKeyRef.current.add(key);
    setPlaying(false);
    setActiveCheckpoint(target);
  }, [time, checkpoints, playing, activeCheckpoint]);

  const activeSegmentId = useMemo(() => {
    const found = transcriptSegments.find((segment) => time >= segment.startSec && time <= segment.endSec);
    return found?.id || transcriptSegments[transcriptSegments.length - 1]?.id || null;
  }, [time, transcriptSegments]);

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

  const markDone = async () => {
    const earnedXp = 10;
    const resolvedItemId = itemId || content.id;
    try {
      await completeLearningItem({
        itemId: resolvedItemId,
        moduleId,
        courseId,
        xpAmount: earnedXp,
      });
    } catch {
      completeItem(resolvedItemId, earnedXp);
    }
    setDone(true);
    setPlaying(false);
    showToast(`Hoàn thành! +${earnedXp} điểm`);
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
    setPlaying(true);
  };

  if (!content) {
    return (
      <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}>
        <div className="empty-state">Đang tải...</div>
      </LearnerLayout>
    );
  }

  const listenedPercent = duration > 0 ? Math.round((time / duration) * 100) : 0;
  const requiredPercent = 80;
  const checkpointPassedCount = Object.values(checkpointAnswers).filter((answer) => answer?.correct).length;
  const checkpointAnsweredCount = Object.keys(checkpointAnswers).length;
  const checkpointTotal = checkpoints.length;
  const checkpointSatisfied = checkpointPassedCount >= checkpointTotal;
  const canMarkDone = listenedPercent >= requiredPercent && checkpointSatisfied;

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={handleBack} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{content.title}</div></div>}>
      <div style={{ padding: 16 }}>
        <div style={{ background: 'linear-gradient(135deg,#FFF0EB,#FFF7ED)', borderRadius: 'var(--radius-lg)', padding: 36, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎧</div>
          <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(time)}</div>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>/ {fmt(duration)}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-bar__fill" style={{ width: `${listenedPercent}%` }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <button className="btn btn--secondary btn--sm" onClick={() => setTime((value) => Math.max(0, value - 15))}>⏪ -15s</button>
          <button className="btn btn--primary" style={{ minWidth: 64, height: 48, borderRadius: 'var(--radius-full)' }} onClick={() => setPlaying((value) => !value)}>{playing ? '⏸️' : '▶️'}</button>
          <button className="btn btn--secondary btn--sm" onClick={() => setTime((value) => Math.min(duration, value + 15))}>+15s ⏩</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {[0.5, 1, 1.5, 2].map((value) => (
            <button key={value} className={`btn btn--sm ${speed === value ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setSpeed(value)}>{value}x</button>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📝 Lời thoại</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transcriptSegments.map((segment) => {
              const active = activeSegmentId === segment.id;
              return (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => setTime(Math.max(0, Math.min(duration, segment.startSec)))}
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
              Đã đúng {checkpointPassedCount}/{checkpointTotal} checkpoint (đã trả lời {checkpointAnsweredCount}/{checkpointTotal}, mốc 10s, 15s).
            </div>
          </div>
        )}

        {!done ? (
          <button
            className="btn btn--success btn--lg btn--full"
            onClick={markDone}
            disabled={!canMarkDone}
            style={{ whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.3, paddingLeft: 12, paddingRight: 12, wordBreak: 'break-word' }}
          >
            Đánh dấu hoàn thành {!canMarkDone ? `(nghe ${requiredPercent}% + trả lời checkpoint)` : ''}
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Đã hoàn thành!</p>
            <button className="btn btn--primary" style={{ marginTop: 12 }} onClick={handleBack}>Quay lại</button>
          </div>
        )}
      </div>

      <Modal open={!!activeCheckpoint} onClose={() => {}}>
        {activeCheckpoint && (
          <div style={{ width: 'min(92vw, 520px)', maxWidth: '100%' }}>
            <h3 style={{ marginBottom: 8 }}>Checkpoint tại {fmt(activeCheckpoint.atSec)}</h3>
            <p style={{ marginBottom: 12, fontWeight: 600 }}>{activeCheckpoint.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeCheckpoint.options.map((option, idx) => (
                (() => {
                  const selectedIndex = checkpointAnswers[activeCheckpoint.id]?.selectedIndex;
                  const correctIndex = Number(activeCheckpoint.correctIndex || 0);
                  const showResult = !!checkpointResult;
                  const isSelected = Number(selectedIndex) === idx;
                  const isCorrectOption = correctIndex === idx;
                  let background = undefined;
                  let border = undefined;
                  let color = undefined;

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
                  style={{ background, border, color }}
                >
                  {option}
                  {showResult && isCorrectOption ? '  ✓' : ''}
                  {showResult && isSelected && !isCorrectOption ? '  ✗' : ''}
                </button>
                  );
                })()
              ))}
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
