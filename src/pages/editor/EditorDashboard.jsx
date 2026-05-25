/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import Modal from '../../components/common/Modal.jsx';
import AddCourseForm from '../../components/common/AddCourseForm.jsx';
import CourseManagementSection from '../../components/common/CourseManagementSection.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { courses as fallbackCourses, COURSE_STATUS } from '../../data/mockCourses.js';
import { users as fallbackUsers } from '../../data/mockUsers.js';
import { useToast } from '../../hooks/useToast.js';
import {
  createCourseByScope,
  createCourseContent,
  deleteCourseContent,
  getCourseContentCatalog,
  getCourseContentCatalogByType,
  getCourseContentDetail,
  getCourseManagementDashboard,
  toggleCoursePublish,
  updateCourseContent,
} from '../../api/services/courseManagement.js';
import { assignCourseByEditor } from '../../api/services/distributionManagement.js';

const STATE_SYNC_EVENT = 'starlent:state-sync';
const STATE_SYNC_KEY = 'starlent_state_sync_v1';

const CONTENT_TYPE_OPTIONS = [
  { type: 'flashcard', label: 'Flashcard (Thẻ)', icon: '🗂️' },
  { type: 'video', label: 'Video (Video)', icon: '🎬' },
  { type: 'audio', label: 'Audio (Âm thanh)', icon: '🎧' },
  { type: 'quiz', label: 'Quiz (Trắc nghiệm)', icon: '📝' },
  { type: 'roleplay', label: 'Roleplay (Nhập vai)', icon: '🎭' },
  { type: 'lesson_reading', label: 'Reading (Bài đọc)', icon: '📖' },
  { type: 'assignment', label: 'Assignment (Bài tập)', icon: '📌' },
  { type: 'survey', label: 'Survey (Khảo sát)', icon: '🗳️' },
  { type: 'live_session', label: 'Live Session (Buổi học trực tiếp)', icon: '📅' },
];

function normalizeVietnameseText(value) {
  const text = String(value || '');
  if (!/Ã|Â|Ä|Æ|á»|âœ|â€|ðŸ|�/.test(text)) return text;
  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 0xff));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return text;
  }
}

function fmtSec(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds || 0)));
  const m = Math.floor(value / 60);
  const s = value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatCourseStatusLabel(status) {
  if (status === COURSE_STATUS.PUBLISHED) return 'Đã xuất bản';
  if (status === COURSE_STATUS.DRAFT) return 'Bản nháp';
  return status;
}

function defaultDataByType(type) {
  switch (type) {
    case 'flashcard':
      return {
        cards: [{ id: 'card_1', front: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }],
      };
    case 'video':
      return {
        videoUrl: '',
        youtubeId: '',
        progressMode: 'lesson_duration',
        duration: 30,
        transcript: '',
        captions: '',
        transcriptSegments: [
          { id: 'seg_1', startSec: 0, endSec: 9, text: '' },
          { id: 'seg_2', startSec: 10, endSec: 14, text: '' },
          { id: 'seg_3', startSec: 15, endSec: 22, text: '' },
          { id: 'seg_4', startSec: 23, endSec: 30, text: '' },
        ],
        checkpoints: [
          { id: 'cp_1', atSec: 10, question: '', options: ['', '', ''], correctIndex: 0 },
          { id: 'cp_2', atSec: 15, question: '', options: ['', '', ''], correctIndex: 0 },
        ],
      };
    case 'audio':
      return {
        audioUrl: '',
        duration: 30,
        transcript: '',
        transcriptSegments: [
          { id: 'seg_1', startSec: 0, endSec: 9, text: '' },
          { id: 'seg_2', startSec: 10, endSec: 14, text: '' },
          { id: 'seg_3', startSec: 15, endSec: 22, text: '' },
          { id: 'seg_4', startSec: 23, endSec: 30, text: '' },
        ],
        checkpoints: [
          { id: 'cp_1', atSec: 10, question: '', options: ['', '', ''], correctIndex: 0 },
          { id: 'cp_2', atSec: 15, question: '', options: ['', '', ''], correctIndex: 0 },
        ],
      };
    case 'quiz':
      return {
        type: 'multiple_choice',
        passScore: 70,
        attemptLimit: 3,
        timeLimit: 300,
        questions: [{ id: 'q1', questionType: 'single_choice', question: '', options: ['', '', '', ''], correctIndex: 0, correctIndices: [], explanation: '' }],
      };
    case 'roleplay':
      return { scenario: '', suggestedResponse: '', tips: [''] };
    case 'lesson_reading':
      return { body: '', references: [''], attachments: [''] };
    case 'assignment':
      return { instruction: '', submissionType: 'text', rubric: '', maxScore: 100, dueAt: '' };
    case 'survey':
      return { questions: [{ id: 'q1', type: 'scale_5', prompt: '' }] };
    case 'live_session':
      return { meetingUrl: '', startAt: '', endAt: '', host: '', notes: '' };
    default:
      return {};
  }
}

function sanitizeDataByType(type, data) {
  const d = data && typeof data === 'object' ? data : {};
  switch (type) {
    case 'flashcard':
      return {
        cards: (d.cards || []).map((card, idx) => ({
          id: String(card?.id || `card_${idx + 1}`),
          front: String(card?.front || ''),
          options: [0, 1, 2, 3].map((i) => String((card?.options || [])[i] || '')),
          correctIndex: Math.min(3, Math.max(0, Number(card?.correctIndex || 0))),
          explanation: String(card?.explanation || ''),
        })),
      };
    case 'video':
      {
        const duration = Math.max(0, Number(d.duration || 0));
        const transcript = String(d.transcript || '');
        const transcriptSegments = Array.isArray(d.transcriptSegments)
          ? d.transcriptSegments.map((segment, idx) => ({
            id: String(segment?.id || `seg_${idx + 1}`),
            startSec: Math.max(0, Number(segment?.startSec || 0)),
            endSec: Math.max(0, Number(segment?.endSec || 0)),
            text: String(segment?.text || ''),
          }))
          : [];
      return {
        videoUrl: String(d.videoUrl || ''),
        youtubeId: String(d.youtubeId || ''),
        progressMode: String(d.progressMode || 'lesson_duration') === 'full_video_duration' ? 'full_video_duration' : 'lesson_duration',
        duration,
        transcript,
        captions: String(d.captions || ''),
        transcriptSegments: transcriptSegments.length > 0
          ? transcriptSegments
          : [{
            id: 'seg_1',
            startSec: 0,
            endSec: duration,
            text: transcript,
          }],
        checkpoints: Array.isArray(d.checkpoints)
          ? d.checkpoints.map((checkpoint, idx) => ({
            id: String(checkpoint?.id || `cp_${idx + 1}`),
            atSec: Math.max(0, Number(checkpoint?.atSec || 0)),
            question: String(checkpoint?.question || ''),
            options: Array.isArray(checkpoint?.options)
              ? checkpoint.options.map((option) => String(option || ''))
              : ['', '', ''],
            correctIndex: Math.max(0, Number(checkpoint?.correctIndex || 0)),
          }))
          : [],
      };
      }
    case 'audio':
      {
        const duration = Math.max(0, Number(d.duration || 0));
        const transcript = String(d.transcript || '');
        const transcriptSegments = Array.isArray(d.transcriptSegments)
          ? d.transcriptSegments.map((segment, idx) => ({
            id: String(segment?.id || `seg_${idx + 1}`),
            startSec: Math.max(0, Number(segment?.startSec || 0)),
            endSec: Math.max(0, Number(segment?.endSec || 0)),
            text: String(segment?.text || ''),
          }))
          : [];

      return {
        audioUrl: String(d.audioUrl || ''),
        duration,
        transcript,
        transcriptSegments: transcriptSegments.length > 0
          ? transcriptSegments
          : [{
            id: 'seg_1',
            startSec: 0,
            endSec: duration,
            text: transcript,
          }],
        checkpoints: Array.isArray(d.checkpoints)
          ? d.checkpoints.map((checkpoint, idx) => ({
            id: String(checkpoint?.id || `cp_${idx + 1}`),
            atSec: Math.max(0, Number(checkpoint?.atSec || 0)),
            question: String(checkpoint?.question || ''),
            options: Array.isArray(checkpoint?.options)
              ? checkpoint.options.map((option) => String(option || ''))
              : ['', '', ''],
            correctIndex: Math.max(0, Number(checkpoint?.correctIndex || 0)),
          }))
          : [],
      };
      }
    case 'quiz':
      return {
        type: 'multiple_choice',
        passScore: Math.min(100, Math.max(0, Number(d.passScore ?? 70))),
        attemptLimit: Math.max(1, Number(d.attemptLimit || 3)),
        timeLimit: Math.max(30, Number(d.timeLimit || 300)),
        questions: (d.questions || []).map((question, idx) => ({
          id: String(question?.id || `q${idx + 1}`),
          questionType: String(question?.questionType || 'single_choice'),
          question: String(question?.question || ''),
          options: [0, 1, 2, 3].map((i) => String((question?.options || [])[i] || '')),
          correctIndex: Math.min(3, Math.max(0, Number(question?.correctIndex || 0))),
          correctIndices: Array.isArray(question?.correctIndices)
            ? question.correctIndices.map((x) => Math.min(3, Math.max(0, Number(x || 0)))).filter((x, i, arr) => arr.indexOf(x) === i)
            : [],
          explanation: String(question?.explanation || ''),
          prompt: String(question?.prompt || question?.question || ''),
          items: (question?.items || []).map((item, itemIdx) => ({
            id: String(item?.id || `s${itemIdx + 1}`),
            text: String(item?.text || ''),
          })),
          correctOrder: Array.isArray(question?.correctOrder) ? question.correctOrder.map((x) => String(x)) : [],
          sampleAnswer: String(question?.sampleAnswer || ''),
        })),
      };
    case 'roleplay':
      return {
        scenario: String(d.scenario || ''),
        suggestedResponse: String(d.suggestedResponse || ''),
        tips: (d.tips || []).map((tip) => String(tip || '')),
      };
    case 'lesson_reading':
      return {
        body: String(d.body || ''),
        references: (d.references || []).map((ref) => String(ref || '')),
        attachments: (d.attachments || []).map((att) => String(att || '')),
      };
    case 'assignment':
      return {
        instruction: String(d.instruction || ''),
        submissionType: ['text', 'file', 'both'].includes(String(d.submissionType || 'text')) ? String(d.submissionType || 'text') : 'text',
        rubric: String(d.rubric || ''),
        maxScore: Math.max(0, Number(d.maxScore || 0)),
        dueAt: String(d.dueAt || ''),
      };
    case 'survey':
      return {
        questions: (d.questions || []).map((question, idx) => ({
          id: String(question?.id || `q${idx + 1}`),
          type: String(question?.type || 'text'),
          prompt: String(question?.prompt || ''),
        })),
      };
    case 'live_session':
      return {
        meetingUrl: String(d.meetingUrl || ''),
        startAt: String(d.startAt || ''),
        endAt: String(d.endAt || ''),
        host: String(d.host || ''),
        notes: String(d.notes || ''),
      };
    default:
      return d;
  }
}

function buildPayloadByType(type, data) {
  const d = sanitizeDataByType(type, data);

  if (type === 'quiz') {
    return {
      type: 'multiple_choice',
      passScore: d.passScore,
      attemptLimit: d.attemptLimit,
      timeLimit: d.timeLimit,
      questions: (d.questions || []).map((question) => ({
        ...question,
      })),
    };
  }

  return d;
}

function AudioPreviewPanel({ data }) {
  const duration = Math.max(0, Number(data?.duration || 0));
  const segments = useMemo(() => (
    Array.isArray(data?.transcriptSegments) ? data.transcriptSegments : []
  ), [data?.transcriptSegments]);
  const checkpoints = useMemo(() => (
    Array.isArray(data?.checkpoints)
      ? data.checkpoints
        .map((checkpoint, idx) => ({
          id: String(checkpoint?.id || `cp_${idx + 1}`),
          atSec: Math.max(0, Number(checkpoint?.atSec || 0)),
          question: String(checkpoint?.question || ''),
          options: Array.isArray(checkpoint?.options) ? checkpoint.options : [],
          correctIndex: Math.max(0, Number(checkpoint?.correctIndex || 0)),
        }))
        .sort((a, b) => a.atSec - b.atSec)
      : []
  ), [data?.checkpoints]);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [answeredMap, setAnsweredMap] = useState({});
  const triggeredRef = useRef(new Set());

  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setSpeed(1);
    setActiveCheckpoint(null);
    setAnsweredMap({});
    triggeredRef.current = new Set();
  }, [data]);

  useEffect(() => {
    if (!playing || activeCheckpoint || time >= duration) return undefined;
    const timer = setInterval(() => {
      setTime((current) => Math.min(current + (0.5 * speed), duration));
    }, 500);
    return () => clearInterval(timer);
  }, [playing, activeCheckpoint, time, duration, speed]);

  useEffect(() => {
    if (!playing || activeCheckpoint) return;
    const target = checkpoints.find((checkpoint) => {
      const key = `${checkpoint.id}_${checkpoint.atSec}`;
      return time >= checkpoint.atSec && !triggeredRef.current.has(key);
    });
    if (!target) return;
    triggeredRef.current.add(`${target.id}_${target.atSec}`);
    setPlaying(false);
    setActiveCheckpoint(target);
  }, [time, checkpoints, playing, activeCheckpoint]);

  const activeSegId = useMemo(() => (
    segments.find((segment) => (
      time >= Number(segment?.startSec || 0) && time <= Number(segment?.endSec || 0)
    ))?.id || segments[segments.length - 1]?.id || null
  ), [time, segments]);

  const listenedPercent = duration > 0 ? Math.round((time / duration) * 100) : 0;

  return (
    <div className="card" style={{ marginTop: 12, background: '#F8FAFC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Preview learner</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{fmtSec(time)} / {fmtSec(duration)}</div>
      </div>
      <div className="progress-bar" style={{ marginBottom: 10 }}><div className="progress-bar__fill" style={{ width: `${listenedPercent}%` }} /></div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <button className="btn btn--secondary btn--sm" onClick={() => setTime((value) => Math.max(0, value - 5))}>-5s</button>
        <button className="btn btn--primary btn--sm" onClick={() => setPlaying((value) => !value)}>{playing ? 'Pause' : 'Play'}</button>
        <button className="btn btn--secondary btn--sm" onClick={() => setTime((value) => Math.min(duration, value + 5))}>+5s</button>
        {[0.5, 1, 1.5, 2].map((value) => (
          <button key={value} className={`btn btn--sm ${speed === value ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setSpeed(value)}>
            {value}x
          </button>
        ))}
      </div>

      {segments.map((segment, idx) => (
        <button
          key={segment.id || idx}
          className="btn btn--ghost btn--full"
          onClick={() => setTime(Math.max(0, Math.min(duration, Number(segment?.startSec || 0))))}
          style={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            marginBottom: 6,
            border: activeSegId === segment.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: activeSegId === segment.id ? 'var(--color-primary-light)' : 'transparent',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 8 }}>
            {Number(segment?.startSec || 0)}s
          </span>
          <span style={{ fontSize: 13 }}>{segment?.text || ''}</span>
        </button>
      ))}

      {activeCheckpoint && (
        <div className="card" style={{ marginTop: 8, background: '#FFF7ED', borderColor: '#FCD34D' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9A3412', marginBottom: 6 }}>
            Checkpoint @ {activeCheckpoint.atSec}s
          </div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{activeCheckpoint.question || '(Chưa nhập câu hỏi)'}</div>
          {(activeCheckpoint.options || []).map((option, idx) => (
            <button
              key={`${activeCheckpoint.id}_${idx}`}
              className="btn btn--secondary btn--full btn--sm"
              style={{ marginBottom: 6 }}
              onClick={() => {
                const correct = idx === activeCheckpoint.correctIndex;
                setAnsweredMap((prev) => ({ ...prev, [activeCheckpoint.id]: { selected: idx, correct } }));
                setActiveCheckpoint(null);
                setPlaying(true);
              }}
            >
              {option || `(Đáp án ${idx + 1} trống)`}
            </button>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
        Checkpoint đã trả lời: {Object.keys(answeredMap).length}/{checkpoints.length}
      </div>
    </div>
  );
}

function ContentFields({ type, data, onChange }) {
  if (!type) return null;

  if (type === 'video') {
    const segments = Array.isArray(data.transcriptSegments) ? data.transcriptSegments : [];
    const checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : [];
    return (
      <div>
        <div className="admin-form__grid">
          <div className="input-group admin-form__full"><label className="input-label">Video URL</label><input className="input" value={data.videoUrl || ''} onChange={(e) => onChange({ ...data, videoUrl: e.target.value })} /></div>
          <div className="input-group"><label className="input-label">YouTube ID</label><input className="input" value={data.youtubeId || ''} onChange={(e) => onChange({ ...data, youtubeId: e.target.value })} /></div>
          <div className="input-group"><label className="input-label">Chế độ tiến độ</label><select className="input" value={data.progressMode || 'lesson_duration'} onChange={(e) => onChange({ ...data, progressMode: e.target.value })}><option value="lesson_duration">Theo thời lượng bài học</option><option value="full_video_duration">Theo thời lượng video YouTube</option></select></div>
          <div className="input-group"><label className="input-label">Thời lượng (giây)</label><input className="input" type="number" min="0" value={data.duration || 0} onChange={(e) => onChange({ ...data, duration: Number(e.target.value || 0) })} /></div>
          <div className="input-group admin-form__full"><label className="input-label">Transcript tổng</label><textarea className="input" rows={4} value={data.transcript || ''} onChange={(e) => onChange({ ...data, transcript: e.target.value })} /></div>
          <div className="input-group admin-form__full"><label className="input-label">Captions</label><input className="input" value={data.captions || ''} onChange={(e) => onChange({ ...data, captions: e.target.value })} /></div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Transcript theo thời gian</div>
          {segments.map((segment, idx) => (
            <div key={segment.id || idx} style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr auto', gap: 8, marginBottom: 8 }}>
              <input className="input" type="number" min="0" value={segment.startSec ?? 0} onChange={(e) => onChange({ ...data, transcriptSegments: segments.map((item, i) => (i === idx ? { ...item, startSec: Number(e.target.value || 0) } : item)) })} placeholder="startSec" />
              <input className="input" type="number" min="0" value={segment.endSec ?? 0} onChange={(e) => onChange({ ...data, transcriptSegments: segments.map((item, i) => (i === idx ? { ...item, endSec: Number(e.target.value || 0) } : item)) })} placeholder="endSec" />
              <input className="input" value={segment.text || ''} onChange={(e) => onChange({ ...data, transcriptSegments: segments.map((item, i) => (i === idx ? { ...item, text: e.target.value } : item)) })} placeholder="Nội dung segment" />
              <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, transcriptSegments: segments.filter((_, i) => i !== idx) })}>Xoá</button>
            </div>
          ))}
          <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, transcriptSegments: [...segments, { id: `seg_${segments.length + 1}`, startSec: 0, endSec: 0, text: '' }] })}>+ Segment</button>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Checkpoint câu hỏi ngắn</div>
          {checkpoints.map((checkpoint, idx) => (
            <div key={checkpoint.id || idx} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 8, marginBottom: 8 }}>
                <input className="input" type="number" min="0" value={checkpoint.atSec ?? 0} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, atSec: Number(e.target.value || 0) } : item)) })} placeholder="atSec" />
                <input className="input" value={checkpoint.question || ''} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, question: e.target.value } : item)) })} placeholder="Nội dung câu hỏi" />
                <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, checkpoints: checkpoints.filter((_, i) => i !== idx) })}>Xoá</button>
              </div>
              {(checkpoint.options || []).map((option, optionIdx) => (
                <div key={optionIdx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Đáp án {optionIdx + 1}</span>
                  <input className="input" value={option || ''} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, options: (item.options || []).map((opt, oi) => (oi === optionIdx ? e.target.value : opt)) } : item)) })} />
                </div>
              ))}
              <div className="input-group"><label className="input-label">Đáp án đúng</label>
                <select className="input" value={checkpoint.correctIndex ?? 0} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, correctIndex: Number(e.target.value || 0) } : item)) })}>
                  {(checkpoint.options || []).map((_, i) => <option key={i} value={i}>Đáp án {i + 1}</option>)}
                </select>
              </div>
            </div>
          ))}
          <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, checkpoints: [...checkpoints, { id: `cp_${checkpoints.length + 1}`, atSec: 0, question: '', options: ['', '', ''], correctIndex: 0 }] })}>+ Checkpoint</button>
        </div>
      </div>
    );
  }

  if (type === 'audio') {
    const segments = Array.isArray(data.transcriptSegments) ? data.transcriptSegments : [];
    const checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : [];
    return (
      <div>
        <div className="admin-form__grid">
          <div className="input-group admin-form__full"><label className="input-label">Audio URL</label><input className="input" value={data.audioUrl || ''} onChange={(e) => onChange({ ...data, audioUrl: e.target.value })} /></div>
          <div className="input-group"><label className="input-label">Thời lượng (giây)</label><input className="input" type="number" min="0" value={data.duration || 0} onChange={(e) => onChange({ ...data, duration: Number(e.target.value || 0) })} /></div>
          <div className="input-group admin-form__full"><label className="input-label">Transcript tổng</label><textarea className="input" rows={4} value={data.transcript || ''} onChange={(e) => onChange({ ...data, transcript: e.target.value })} /></div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Transcript theo thời gian</div>
          {segments.map((segment, idx) => (
            <div key={segment.id || idx} style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr auto', gap: 8, marginBottom: 8 }}>
              <input className="input" type="number" min="0" value={segment.startSec ?? 0} onChange={(e) => onChange({ ...data, transcriptSegments: segments.map((item, i) => (i === idx ? { ...item, startSec: Number(e.target.value || 0) } : item)) })} placeholder="startSec" />
              <input className="input" type="number" min="0" value={segment.endSec ?? 0} onChange={(e) => onChange({ ...data, transcriptSegments: segments.map((item, i) => (i === idx ? { ...item, endSec: Number(e.target.value || 0) } : item)) })} placeholder="endSec" />
              <input className="input" value={segment.text || ''} onChange={(e) => onChange({ ...data, transcriptSegments: segments.map((item, i) => (i === idx ? { ...item, text: e.target.value } : item)) })} placeholder="Nội dung segment" />
              <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, transcriptSegments: segments.filter((_, i) => i !== idx) })}>Xoá</button>
            </div>
          ))}
          <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, transcriptSegments: [...segments, { id: `seg_${segments.length + 1}`, startSec: 0, endSec: 0, text: '' }] })}>+ Segment</button>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Checkpoint câu hỏi ngắn</div>
          {checkpoints.map((checkpoint, idx) => (
            <div key={checkpoint.id || idx} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 8, marginBottom: 8 }}>
                <input className="input" type="number" min="0" value={checkpoint.atSec ?? 0} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, atSec: Number(e.target.value || 0) } : item)) })} placeholder="atSec" />
                <input className="input" value={checkpoint.question || ''} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, question: e.target.value } : item)) })} placeholder="Nội dung câu hỏi" />
                <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, checkpoints: checkpoints.filter((_, i) => i !== idx) })}>Xoá</button>
              </div>
              {(checkpoint.options || []).map((option, optionIdx) => (
                <div key={`${checkpoint.id || idx}_${optionIdx}`} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Đáp án {optionIdx + 1}</span>
                  <input className="input" value={option || ''} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, options: (item.options || []).map((opt, oi) => (oi === optionIdx ? e.target.value : opt)) } : item)) })} />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label">Đáp án đúng</label>
                <select className="input" value={checkpoint.correctIndex ?? 0} onChange={(e) => onChange({ ...data, checkpoints: checkpoints.map((item, i) => (i === idx ? { ...item, correctIndex: Number(e.target.value || 0) } : item)) })}>
                  {(checkpoint.options || []).map((_, optionIdx) => <option key={optionIdx} value={optionIdx}>Đáp án {optionIdx + 1}</option>)}
                </select>
              </div>
            </div>
          ))}
          <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, checkpoints: [...checkpoints, { id: `cp_${checkpoints.length + 1}`, atSec: 0, question: '', options: ['', '', ''], correctIndex: 0 }] })}>+ Checkpoint</button>
        </div>

        <AudioPreviewPanel data={data} />
      </div>
    );
  }

  if (type === 'roleplay') {
    const tips = data.tips || [];
    return (
      <div>
        <div className="input-group"><label className="input-label">Scenario</label><textarea className="input" rows={5} value={data.scenario || ''} onChange={(e) => onChange({ ...data, scenario: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">Suggested Response</label><textarea className="input" rows={5} value={data.suggestedResponse || ''} onChange={(e) => onChange({ ...data, suggestedResponse: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">Tips</label></div>
        {tips.map((tip, idx) => (
          <div key={`${idx}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
            <input className="input" value={tip} onChange={(e) => onChange({ ...data, tips: tips.map((t, i) => (i === idx ? e.target.value : t)) })} />
            <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, tips: tips.filter((_, i) => i !== idx) })}>Xoá</button>
          </div>
        ))}
        <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, tips: [...tips, ''] })}>+ Tip</button>
      </div>
    );
  }

  if (type === 'quiz') {
    const questions = data.questions || [];
    return (
      <div>
        <div className="admin-form__grid" style={{ marginBottom: 8 }}>
          <div className="input-group"><label className="input-label">Điểm đạt (%)</label><input className="input" type="number" min="0" max="100" value={data.passScore ?? 70} onChange={(e) => onChange({ ...data, passScore: Number(e.target.value || 70) })} /></div>
          <div className="input-group"><label className="input-label">Số lần làm tối đa</label><input className="input" type="number" min="1" value={data.attemptLimit || 3} onChange={(e) => onChange({ ...data, attemptLimit: Number(e.target.value || 3) })} /></div>
          <div className="input-group"><label className="input-label">Thời gian làm bài (giây)</label><input className="input" type="number" min="30" value={data.timeLimit || 300} onChange={(e) => onChange({ ...data, timeLimit: Number(e.target.value || 300) })} /></div>
        </div>
        {questions.map((q, idx) => (
          <div key={q.id || idx} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 180px auto', gap: 8, marginBottom: 8 }}>
              <input className="input" value={q.id || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, id: e.target.value } : it)) })} placeholder="id" />
              <input className="input" value={q.question || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, question: e.target.value } : it)) })} placeholder="Câu hỏi" />
              <select className="input" value={q.questionType || 'single_choice'} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, questionType: e.target.value } : it)) })}>
                <option value="single_choice">Single Choice (Một đáp án đúng)</option>
                <option value="multiple_select">Multiple Select (Nhiều đáp án đúng)</option>
                <option value="ordering">Ordering (Sắp xếp thứ tự)</option>
                <option value="true_false">True/False (Đúng/Sai)</option>
                <option value="short_answer">Short Answer (Trả lời ngắn)</option>
              </select>
              <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, questions: questions.filter((_, i) => i !== idx) })}>Xoá</button>
            </div>
            {(q.questionType === 'single_choice' || q.questionType === 'multiple_select' || q.questionType === 'true_false') && [0, 1, 2, 3].map((optIdx) => (
              <div key={optIdx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Đáp án {optIdx + 1}</span>
                <input
                  className="input"
                  value={(q.options || [])[optIdx] || ''}
                  onChange={(e) => {
                    const nextOptions = [0, 1, 2, 3].map((i) => (i === optIdx ? e.target.value : (q.options || [])[i] || ''));
                    onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, options: nextOptions } : it)) });
                  }}
                />
              </div>
            ))}
            <div className="admin-form__grid">
              {q.questionType === 'single_choice' && <div className="input-group"><label className="input-label">Đáp án đúng</label><select className="input" value={q.correctIndex || 0} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, correctIndex: Number(e.target.value) } : it)) })}>{[0, 1, 2, 3].map((i) => <option key={i} value={i}>Đáp án {i + 1}</option>)}</select></div>}
              {q.questionType === 'multiple_select' && <div className="input-group"><label className="input-label">Đáp án đúng (vd: 0,2)</label><input className="input" value={(q.correctIndices || []).join(',')} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, correctIndices: e.target.value.split(',').map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x >= 0 && x <= 3) } : it)) })} /></div>}
              {q.questionType === 'ordering' && <div className="input-group"><label className="input-label">Thứ tự đúng (vd: a,b,c)</label><input className="input" value={(q.correctOrder || []).join(',')} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, correctOrder: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } : it)) })} /></div>}
              {q.questionType === 'short_answer' && <div className="input-group"><label className="input-label">Đáp án mẫu</label><input className="input" value={q.sampleAnswer || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, sampleAnswer: e.target.value } : it)) })} /></div>}
              <div className="input-group"><label className="input-label">Giải thích</label><input className="input" value={q.explanation || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, explanation: e.target.value } : it)) })} /></div>
            </div>
            {q.questionType === 'ordering' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Items (id,text)</div>
                {(q.items || []).map((item, itemIdx) => (
                  <div key={`${q.id}-${itemIdx}`} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 8, marginBottom: 6 }}>
                    <input className="input" value={item.id || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, items: (it.items || []).map((x, j) => (j === itemIdx ? { ...x, id: e.target.value } : x)) } : it)) })} />
                    <input className="input" value={item.text || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, items: (it.items || []).map((x, j) => (j === itemIdx ? { ...x, text: e.target.value } : x)) } : it)) })} />
                    <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, items: (it.items || []).filter((_, j) => j !== itemIdx) } : it)) })}>Xoá</button>
                  </div>
                ))}
                <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, items: [...(it.items || []), { id: `s${(it.items || []).length + 1}`, text: '' }] } : it)) })}>+ Item</button>
              </div>
            )}
          </div>
        ))}
        <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, questions: [...questions, { id: `q${questions.length + 1}`, questionType: 'single_choice', question: '', options: ['', '', '', ''], correctIndex: 0, correctIndices: [], explanation: '' }] })}>+ Câu hỏi</button>
      </div>
    );
  }

  if (type === 'lesson_reading') {
    return (
      <div className="admin-form__grid">
        <div className="input-group admin-form__full"><label className="input-label">Nội dung (markdown/text)</label><textarea className="input" rows={6} value={data.body || ''} onChange={(e) => onChange({ ...data, body: e.target.value })} /></div>
      </div>
    );
  }

  if (type === 'assignment') {
    return (
      <div className="admin-form__grid">
        <div className="input-group admin-form__full"><label className="input-label">Instruction</label><textarea className="input" rows={5} value={data.instruction || ''} onChange={(e) => onChange({ ...data, instruction: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">Submission Type</label><select className="input" value={data.submissionType || 'text'} onChange={(e) => onChange({ ...data, submissionType: e.target.value })}><option value="text">Text</option><option value="file">File</option><option value="both">Both</option></select></div>
        <div className="input-group"><label className="input-label">Max Score</label><input className="input" type="number" min="0" value={data.maxScore || 0} onChange={(e) => onChange({ ...data, maxScore: Number(e.target.value || 0) })} /></div>
        <div className="input-group"><label className="input-label">Due At</label><input className="input" value={data.dueAt || ''} onChange={(e) => onChange({ ...data, dueAt: e.target.value })} /></div>
        <div className="input-group admin-form__full"><label className="input-label">Rubric</label><textarea className="input" rows={4} value={data.rubric || ''} onChange={(e) => onChange({ ...data, rubric: e.target.value })} /></div>
      </div>
    );
  }

  if (type === 'survey') {
    const questions = data.questions || [];
    return (
      <div>
        {questions.map((q, idx) => (
          <div key={q.id || idx} style={{ display: 'grid', gridTemplateColumns: '120px 160px 1fr auto', gap: 8, marginBottom: 8 }}>
            <input className="input" value={q.id || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, id: e.target.value } : it)) })} />
            <select className="input" value={q.type || 'text'} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, type: e.target.value } : it)) })}><option value="text">Text</option><option value="scale_5">Scale 1-5</option><option value="single_choice">Single Choice</option></select>
            <input className="input" value={q.prompt || ''} onChange={(e) => onChange({ ...data, questions: questions.map((it, i) => (i === idx ? { ...it, prompt: e.target.value } : it)) })} />
            <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, questions: questions.filter((_, i) => i !== idx) })}>Xoá</button>
          </div>
        ))}
        <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, questions: [...questions, { id: `q${questions.length + 1}`, type: 'text', prompt: '' }] })}>+ Câu hỏi</button>
      </div>
    );
  }

  if (type === 'live_session') {
    return (
      <div className="admin-form__grid">
        <div className="input-group admin-form__full"><label className="input-label">Meeting URL</label><input className="input" value={data.meetingUrl || ''} onChange={(e) => onChange({ ...data, meetingUrl: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">Start At (ISO)</label><input className="input" value={data.startAt || ''} onChange={(e) => onChange({ ...data, startAt: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">End At (ISO)</label><input className="input" value={data.endAt || ''} onChange={(e) => onChange({ ...data, endAt: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">Host</label><input className="input" value={data.host || ''} onChange={(e) => onChange({ ...data, host: e.target.value })} /></div>
        <div className="input-group admin-form__full"><label className="input-label">Notes</label><textarea className="input" rows={4} value={data.notes || ''} onChange={(e) => onChange({ ...data, notes: e.target.value })} /></div>
      </div>
    );
  }

  if (type === 'flashcard') {
    const cards = data.cards || [];
    return (
      <div>
        {cards.map((card, idx) => (
          <div key={card.id || idx} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 8, marginBottom: 8 }}>
              <input className="input" value={card.id || ''} onChange={(e) => onChange({ ...data, cards: cards.map((it, i) => (i === idx ? { ...it, id: e.target.value } : it)) })} placeholder="id" />
              <input className="input" value={card.front || ''} onChange={(e) => onChange({ ...data, cards: cards.map((it, i) => (i === idx ? { ...it, front: e.target.value } : it)) })} placeholder="Mặt trước / câu hỏi" />
              <button className="btn btn--danger btn--sm" onClick={() => onChange({ ...data, cards: cards.filter((_, i) => i !== idx) })}>Xoá</button>
            </div>
            {[0, 1, 2, 3].map((optIdx) => (
              <div key={optIdx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Đáp án {optIdx + 1}</span>
                <input
                  className="input"
                  value={(card.options || [])[optIdx] || ''}
                  onChange={(e) => {
                    const nextOptions = [0, 1, 2, 3].map((i) => (i === optIdx ? e.target.value : (card.options || [])[i] || ''));
                    onChange({ ...data, cards: cards.map((it, i) => (i === idx ? { ...it, options: nextOptions } : it)) });
                  }}
                />
              </div>
            ))}
            <div className="admin-form__grid">
              <div className="input-group"><label className="input-label">Đáp án đúng</label><select className="input" value={card.correctIndex || 0} onChange={(e) => onChange({ ...data, cards: cards.map((it, i) => (i === idx ? { ...it, correctIndex: Number(e.target.value) } : it)) })}>{[0, 1, 2, 3].map((i) => <option key={i} value={i}>Đáp án {i + 1}</option>)}</select></div>
              <div className="input-group"><label className="input-label">Giải thích</label><input className="input" value={card.explanation || ''} onChange={(e) => onChange({ ...data, cards: cards.map((it, i) => (i === idx ? { ...it, explanation: e.target.value } : it)) })} /></div>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary btn--sm" onClick={() => onChange({ ...data, cards: [...cards, { id: `card_${cards.length + 1}`, front: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }] })}>+ Thẻ</button>
      </div>
    );
  }

  return null;
}

export default function EditorDashboard() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState(fallbackCourses);
  const [learners, setLearners] = useState(fallbackUsers.filter((item) => item.role === 'learner'));
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    userId: '',
    dueDate: '',
    required: true,
  });
  const [showCourseModal, setShowCourseModal] = useState(false);

  const [catalogSummary, setCatalogSummary] = useState({});
  const [activeContentType, setActiveContentType] = useState('');
  const [contentItems, setContentItems] = useState([]);
  const [selectedContentId, setSelectedContentId] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentData, setContentData] = useState({});
  const [loadingContent, setLoadingContent] = useState(false);
  const [showCreateContentModal, setShowCreateContentModal] = useState(false);
  const [createContentForm, setCreateContentForm] = useState({
    type: 'flashcard',
    id: '',
    title: '',
  });
  const [createContentData, setCreateContentData] = useState(defaultDataByType('flashcard'));
  const [reloadTick, setReloadTick] = useState(0);
  const lastSyncAtRef = useRef(0);

  const changeTab = (nextTab) => {
    const next = new URLSearchParams(params);
    next.set('tab', nextTab);
    setParams(next);
  };

  const openBuilderForCourse = (courseId) => {
    if (!courseId) return;
    navigate(`/editor/courses/${courseId}/builder`);
  };

  const loadCatalogSummary = async () => {
    try {
      const response = await getCourseContentCatalog();
      setCatalogSummary(response.catalog || {});
    } catch {
      setCatalogSummary({});
    }
  };

  const loadContentList = async (type) => {
    if (!type) return;
    setLoadingContent(true);
    try {
      const response = await getCourseContentCatalogByType(type);
      const nextItems = response.items || [];
      setContentItems(nextItems);
      if (!nextItems.some((item) => item.id === selectedContentId)) {
        setSelectedContentId('');
        setContentTitle('');
        setContentData(defaultDataByType(type));
      }
    } catch (error) {
      setContentItems([]);
      setSelectedContentId('');
      setContentTitle('');
      setContentData(defaultDataByType(type));
      showToast(error?.message || 'Không thể tải danh sách content');
    } finally {
      setLoadingContent(false);
    }
  };

  const loadContentDetail = async (type, contentId) => {
    if (!type || !contentId) return;
    setLoadingContent(true);
    try {
      const response = await getCourseContentDetail(type, contentId);
      const content = response.content || {};
      const { id, title, ...rest } = content;
      setSelectedContentId(id || contentId);
      setContentTitle(title || '');
      setContentData(sanitizeDataByType(type, rest));
    } catch (error) {
      showToast(error?.message || 'Không thể tải chi tiết content');
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getCourseManagementDashboard('editor');
        if (!mounted) return;
        setCourses(response.courses || fallbackCourses);
        setLearners(response.users || fallbackUsers.filter((item) => item.role === 'learner'));
        setAssignments(response.assignments || []);
      } catch {
        // keep fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [reloadTick]);

  useEffect(() => {
    if (tab !== 'content') return;
    loadCatalogSummary();
  }, [tab, reloadTick]);

  useEffect(() => {
    if (tab !== 'content' || !activeContentType) return;
    loadContentList(activeContentType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, activeContentType, reloadTick]);

  useEffect(() => {
    const triggerSync = () => {
      const now = Date.now();
      if (now - lastSyncAtRef.current < 800) return;
      lastSyncAtRef.current = now;
      setReloadTick((value) => value + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') triggerSync();
    };
    const handleStorageSync = (event) => {
      if (event.key === STATE_SYNC_KEY) triggerSync();
    };

    window.addEventListener('focus', triggerSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(STATE_SYNC_EVENT, triggerSync);
    window.addEventListener('storage', handleStorageSync);

    return () => {
      window.removeEventListener('focus', triggerSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(STATE_SYNC_EVENT, triggerSync);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  const contentTypeMeta = useMemo(() => Object.fromEntries(
    CONTENT_TYPE_OPTIONS.map((item) => [item.type, item])
  ), []);

  const handleCreateCourse = async (form) => {
    const { continueToBuilder = true, ...payload } = form;
    try {
      const response = await createCourseByScope('editor', payload);
      setCourses((prev) => [...prev, response.course]);
      showToast('✅ Đã tạo khoá học');
      if (continueToBuilder) openBuilderForCourse(response.course.id);
    } catch (error) {
      showToast(error?.message || '❌ Không thể tạo khoá học');
    } finally {
      setShowCourseModal(false);
    }
  };

  const togglePublish = async (courseId) => {
    try {
      const response = await toggleCoursePublish(courseId);
      setCourses((prev) => prev.map((course) => (course.id === courseId ? response.course : course)));
      showToast(response.course.status === COURSE_STATUS.PUBLISHED ? '✅ Đã xuất bản' : '↩️ Đã chuyển về nháp');
    } catch {
      showToast('⚠️ Không thể cập nhật trạng thái');
    }
  };

  useEffect(() => {
    const publishedCourses = courses.filter((course) => course.status === COURSE_STATUS.PUBLISHED);
    if (!assignmentForm.courseId && publishedCourses[0]?.id) {
      setAssignmentForm((prev) => ({ ...prev, courseId: publishedCourses[0].id }));
    }
    if (!assignmentForm.userId && learners[0]?.id) {
      setAssignmentForm((prev) => ({ ...prev, userId: learners[0].id }));
    }
  }, [assignmentForm.courseId, assignmentForm.userId, courses, learners]);

  const handleAssignCourse = async () => {
    if (!assignmentForm.courseId) return showToast('⚠️ Chọn khoá học đã xuất bản');
    if (!assignmentForm.userId) return showToast('⚠️ Chọn học viên');
    try {
      const response = await assignCourseByEditor(assignmentForm);
      const created = Array.isArray(response.assignments) ? response.assignments : [];
      setAssignments((prev) => [...created, ...prev]);
      showToast('✅ Đã gán khoá học');
    } catch (error) {
      showToast(error?.message || '❌ Không thể gán khoá học');
    }
  };

  const openContentManager = async (type) => {
    setActiveContentType(type);
    setSelectedContentId('');
    setContentTitle('');
    setContentData(defaultDataByType(type));
    await loadContentList(type);
  };

  const handleSaveContent = async () => {
    if (!activeContentType || !selectedContentId) return;
    const title = contentTitle.trim();
    if (!title) {
      showToast('⚠️ Tiêu đề content là bắt buộc');
      return;
    }

    try {
      await updateCourseContent(activeContentType, selectedContentId, {
        title,
        data: buildPayloadByType(activeContentType, contentData),
      });
      showToast('✅ Đã lưu content');
      await Promise.all([loadCatalogSummary(), loadContentList(activeContentType)]);
      await loadContentDetail(activeContentType, selectedContentId);
    } catch (error) {
      showToast(error?.message || '❌ Không thể lưu content');
    }
  };

  const handleDeleteContent = async () => {
    if (!activeContentType || !selectedContentId) return;
    if (!window.confirm(`Xóa content ${selectedContentId}?`)) return;

    try {
      await deleteCourseContent(activeContentType, selectedContentId);
      showToast('✅ Đã xóa content');
      setSelectedContentId('');
      setContentTitle('');
      setContentData(defaultDataByType(activeContentType));
      await Promise.all([loadCatalogSummary(), loadContentList(activeContentType)]);
    } catch (error) {
      showToast(error?.message || '❌ Không thể xóa content (có thể đang được khóa học sử dụng)');
    }
  };

  const handleCreateContent = async (event) => {
    event.preventDefault();
    const type = createContentForm.type;
    const title = createContentForm.title.trim();
    const forcedId = createContentForm.id.trim();

    if (!type || !title) {
      showToast('⚠️ Thiếu type hoặc title');
      return;
    }

    try {
      const response = await createCourseContent(type, {
        id: forcedId || undefined,
        title,
        data: buildPayloadByType(type, createContentData),
      });
      const createdId = response.content?.id;
      showToast('✅ Đã tạo content');
      setShowCreateContentModal(false);
      setCreateContentForm({ type, id: '', title: '' });
      setCreateContentData(defaultDataByType(type));
      await loadCatalogSummary();

      if (activeContentType !== type) {
        await openContentManager(type);
      } else {
        await loadContentList(type);
      }

      if (createdId) {
        await loadContentDetail(type, createdId);
      }
    } catch (error) {
      showToast(error?.message || '❌ Không thể tạo content');
    }
  };

  if (loading) return <AdminLayout title="Biên tập nội dung"><div className="skeleton skeleton-card" /></AdminLayout>;

  return (
    <AdminLayout title="Biên tập nội dung">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Xin chào, {user?.name}</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>Vai trò: Biên tập nội dung</p>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[{ key: 'overview', label: '📊 Tổng quan' }, { key: 'courses', label: '📚 Khoá học' }, { key: 'content', label: '📝 Nội dung' }, { key: 'publish', label: '✅ Xuất bản' }, { key: 'distribution', label: '📤 Phân phối' }].map((item) => (
          <button key={item.key} className={`tab${tab === item.key ? ' tab--active' : ''}`} onClick={() => changeTab(item.key)}>{item.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid-3" style={{ marginBottom: 20 }}>
            <div className="stat-card"><div className="stat-card__label">Tổng khoá</div><div className="stat-card__value">{courses.length}</div></div>
            <div className="stat-card"><div className="stat-card__label">Đã XB</div><div className="stat-card__value">{courses.filter((course) => course.status === COURSE_STATUS.PUBLISHED).length}</div></div>
            <div className="stat-card"><div className="stat-card__label">Nháp</div><div className="stat-card__value">{courses.filter((course) => course.status === COURSE_STATUS.DRAFT).length}</div></div>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Khoá học</h3>
          {courses.map((course) => (
            <div key={course.id} className="card card--hoverable" style={{ marginBottom: 8 }} onClick={() => openBuilderForCourse(course.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 700 }}>{course.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{course.moduleCount} module · {course.duration}p</div></div>
                <span className={`badge ${course.status === COURSE_STATUS.PUBLISHED ? 'badge--success' : 'badge--warning'}`}>{formatCourseStatusLabel(course.status)}</span>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'courses' && (
        <CourseManagementSection
          courses={courses}
          onOpenCourse={openBuilderForCourse}
          onOpenBuilder={openBuilderForCourse}
          onOpenCreateCourse={() => setShowCourseModal(true)}
          renderActions={() => (<><button className="btn btn--ghost btn--sm">✏️ Sửa</button><button className="btn btn--ghost btn--sm">👁️ Xem</button></>)}
        />
      )}

      {tab === 'content' && (
        <div>
          <div className="admin-toolbar"><h3 className="admin-toolbar__title">Nguồn content</h3><button className="btn btn--primary" onClick={() => setShowCreateContentModal(true)}>+ Tạo content</button></div>
          <div className="grid-2" style={{ marginBottom: 12 }}>
            {CONTENT_TYPE_OPTIONS.map((item) => (
              <div key={item.type} className="card" style={{ border: activeContentType === item.type ? '2px solid var(--color-primary)' : undefined }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{(catalogSummary[item.type] || []).length} item</div>
                <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={() => openContentManager(item.type)}>Quản lý</button>
              </div>
            ))}
          </div>

          {activeContentType && (
            <div className="card">
              <h4 className="card__title" style={{ marginBottom: 10 }}>{contentTypeMeta[activeContentType]?.icon} {contentTypeMeta[activeContentType]?.label}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Danh sách ({contentItems.length})</div>
                  {loadingContent && contentItems.length === 0 ? (
                    <div className="skeleton skeleton-card" />
                  ) : contentItems.length === 0 ? (
                    <div className="empty-state"><div className="empty-state__title">Chưa có content</div></div>
                  ) : (
                    contentItems.map((item) => (
                      <button key={item.id} className={`btn btn--full ${selectedContentId === item.id ? 'btn--primary' : 'btn--secondary'}`} style={{ marginBottom: 6, justifyContent: 'flex-start' }} onClick={() => loadContentDetail(activeContentType, item.id)}>
                        {item.id} · {normalizeVietnameseText(item.title)}
                      </button>
                    ))
                  )}
                </div>

                <div>
                  {!selectedContentId ? (
                    <div className="empty-state"><div className="empty-state__title">Chọn một content để chỉnh sửa</div></div>
                  ) : (
                    <>
                      <div className="input-group" style={{ marginBottom: 8 }}><label className="input-label">ID</label><input className="input" value={selectedContentId} disabled /></div>
                      <div className="input-group" style={{ marginBottom: 12 }}><label className="input-label">Tiêu đề</label><input className="input" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} /></div>
                      <ContentFields type={activeContentType} data={contentData} onChange={setContentData} />
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        <button className="btn btn--primary" onClick={handleSaveContent}>💾 Lưu content</button>
                        <button className="btn btn--danger" onClick={handleDeleteContent}>🗑️ Xoá content</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'publish' && (
        <div>
          {courses.map((course) => (
            <div key={course.id} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 700 }}>{course.title}</div><span className={`badge ${course.status === COURSE_STATUS.PUBLISHED ? 'badge--success' : 'badge--warning'}`}>{formatCourseStatusLabel(course.status)}</span></div>
                <button className={`btn btn--sm ${course.status === COURSE_STATUS.PUBLISHED ? 'btn--secondary' : 'btn--success'}`} onClick={() => togglePublish(course.id)}>{course.status === COURSE_STATUS.PUBLISHED ? 'Hủy xuất bản' : 'Xuất bản'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'distribution' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card__title" style={{ marginBottom: 12 }}>Giao học viên (Editor)</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Chỉ gán theo học viên và chỉ cho khoá học đã xuất bản.
            </p>
            <div className="admin-form__grid">
              <div className="input-group">
                <label className="input-label">Khoá học đã xuất bản</label>
                <select className="input" value={assignmentForm.courseId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, courseId: event.target.value }))}>
                  {courses.filter((course) => course.status === COURSE_STATUS.PUBLISHED).map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Học viên</label>
                <select className="input" value={assignmentForm.userId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, userId: event.target.value }))}>
                  {learners.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.department}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Hạn hoàn thành</label>
                <input className="input" type="date" value={assignmentForm.dueDate} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 }}>
              <input type="checkbox" checked={assignmentForm.required} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, required: event.target.checked }))} />
              Bắt buộc hoàn thành
            </label>
            <div>
              <button className="btn btn--primary" onClick={handleAssignCourse}>📤 Giao học viên</button>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title" style={{ marginBottom: 12 }}>Lịch sử gán ({assignments.length})</h3>
            {assignments.slice(0, 20).map((assignment) => (
              <div key={assignment.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 700 }}>{assignment.courseName}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {assignment.userName} · Hạn: {assignment.dueDate || 'Không hạn'} · {assignment.required ? 'Bắt buộc' : 'Tự chọn'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showCourseModal} onClose={() => setShowCourseModal(false)}>
        <AddCourseForm onClose={() => setShowCourseModal(false)} onSubmit={handleCreateCourse} />
      </Modal>

      <Modal open={showCreateContentModal} onClose={() => setShowCreateContentModal(false)}>
        <form onSubmit={handleCreateContent} className="admin-form">
          <h3 className="admin-form__title">➕ Tạo content mới</h3>
          <div className="admin-form__grid">
            <div className="input-group"><label className="input-label">Loại content</label><select className="input" value={createContentForm.type} onChange={(e) => { const nextType = e.target.value; setCreateContentForm((prev) => ({ ...prev, type: nextType })); setCreateContentData(defaultDataByType(nextType)); }}>{CONTENT_TYPE_OPTIONS.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}</select></div>
            <div className="input-group"><label className="input-label">ID (tuỳ chọn)</label><input className="input" value={createContentForm.id} onChange={(e) => setCreateContentForm((prev) => ({ ...prev, id: e.target.value }))} placeholder="Để trống để auto-generate" /></div>
            <div className="input-group admin-form__full"><label className="input-label">Tiêu đề *</label><input className="input" value={createContentForm.title} onChange={(e) => setCreateContentForm((prev) => ({ ...prev, title: e.target.value }))} required /></div>
          </div>
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <ContentFields type={createContentForm.type} data={createContentData} onChange={setCreateContentData} />
          </div>
          <div className="admin-form__actions"><button type="button" className="btn btn--secondary" onClick={() => setShowCreateContentModal(false)}>Huỷ</button><button type="submit" className="btn btn--primary">✅ Tạo content</button></div>
        </form>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}


