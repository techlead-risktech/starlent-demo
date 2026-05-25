import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSE_STATUS, courses as fallbackCourses, getCourseProgress, getUnlockedModules } from '../../data/mockCourses.js';
import { getLearningState, completeModule, completeCourse } from '../../utils/auth.js';
import { getCourseDetail } from '../../api/services/courses.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { PageSkeleton } from '../../components/common/Skeleton.jsx';
import Modal from '../../components/common/Modal.jsx';

function isModuleDone(mod, completedItems) {
  return mod.items.every((item) => completedItems.includes(item.id) || completedItems.includes(item.contentId));
}

const ITEM_TYPE_META = {
  flashcard: { icon: '🗂️', label: 'Flashcard' },
  video: { icon: '🎬', label: 'Video' },
  audio: { icon: '🎧', label: 'Audio' },
  quiz: { icon: '📝', label: 'Quiz' },
  quiz_mc: { icon: '📝', label: 'Quiz' },
  quiz_sequence: { icon: '📝', label: 'Quiz' },
  roleplay: { icon: '🎭', label: 'Roleplay' },
  lesson_reading: { icon: '📖', label: 'Reading' },
  assignment: { icon: '📌', label: 'Assignment' },
  survey: { icon: '🗳️', label: 'Survey' },
  live_session: { icon: '📅', label: 'Live Session' },
};

function bracketTitle(item) {
  const meta = ITEM_TYPE_META[item.type] || { label: 'Content' };
  const title = String(item?.title || '');
  if (title.toLowerCase().startsWith(`[${meta.label.toLowerCase()}]`)) return title;
  if (title.toLowerCase().startsWith(`${meta.label.toLowerCase()}:`)) {
    return `[${meta.label}] ${title.slice(meta.label.length + 1).trim()}`;
  }
  return `[${meta.label}] ${title}`;
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [ls, setLs] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [newCertId, setNewCertId] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      let resolvedCourse = null;

      try {
        const response = await getCourseDetail(courseId);
        resolvedCourse = response.course;
      } catch {
        resolvedCourse = fallbackCourses.find((c) => c.id === courseId && c.status === COURSE_STATUS.PUBLISHED) || null;
      }

      if (!mounted) return;
      if (!resolvedCourse) {
        setCourse(null);
        setLs(getLearningState());
        setLoading(false);
        return;
      }

      let state = getLearningState();
      let changed = false;

      resolvedCourse.modules.forEach((mod) => {
        if (isModuleDone(mod, state.completedItems) && !state.completedModules.includes(mod.id)) {
          completeModule(mod.id);
          changed = true;
        }
      });

      state = getLearningState();
      const allModsDone = resolvedCourse.modules.every((mod) => isModuleDone(mod, state.completedItems));
      if (allModsDone && !state.completedCourses.includes(courseId)) {
        completeCourse(courseId, {
          courseName: resolvedCourse.title,
          duration: resolvedCourse.duration,
          score: 85 + Math.floor(Math.random() * 11),
        });
        const fresh = getLearningState();
        const cert = fresh.localCerts.find((c) => c.courseId === courseId);
        if (cert) {
          setNewCertId(cert.id);
          setShowCongrats(true);
        }
        changed = true;
      }

      if (changed) state = getLearningState();
      setCourse(resolvedCourse);
      setLs(state);
      setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, [courseId, refreshKey]);

  if (loading) {
    return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><PageSkeleton /></LearnerLayout>;
  }

  if (!course) {
    return (
      <LearnerLayout topBar={<div className="page__header"><div className="page__title">Không tìm thấy</div></div>}>
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <div className="empty-state__title">Khóa học không tồn tại</div>
        </div>
      </LearnerLayout>
    );
  }

  const progress = course.progress ?? getCourseProgress(course, ls?.completedItems || []);
  const unlocked = getUnlockedModules(course, ls?.completedModules || []);
  const hasRequiredTag = (course.tags || []).some((tag) => String(tag || '').trim().toLowerCase() === 'bắt buộc');

  const goToItem = (item, moduleId) => {
    const base = {
      flashcard: 'flashcard',
      video: 'video',
      audio: 'audio',
      quiz: 'quiz',
      quiz_mc: 'quiz',
      quiz_sequence: 'quiz',
      roleplay: 'roleplay',
      lesson_reading: 'reading',
      assignment: 'assignment',
      survey: 'survey',
      live_session: 'live-session',
    };
    const type = base[item.type] || 'flashcard';
    navigate(`/learner/${type}/${item.contentId}?itemId=${item.id}&moduleId=${moduleId}&courseId=${course.id}`);
  };

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={() => { setRefreshKey((v) => v + 1); navigate(-1); }} style={{ marginBottom: 8 }}>← Quay lại</button><div className="page__title">{course.title}</div></div>}>
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>{course.description}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {(course.tags || [])
            .filter((tag) => !course.required || String(tag || '').trim().toLowerCase() !== 'bắt buộc')
            .map((tag) => <span key={tag} className="chip">{tag}</span>)}
          {course.required && !hasRequiredTag && <span className="badge badge--warning">Bắt buộc</span>}
          {course.required && hasRequiredTag && <span className="badge badge--warning">Bắt buộc</span>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>⏱ {course.duration} phút · 📦 {course.moduleCount} module · ⭐ {course.rating}</div>
        {course.dueDate && <div style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 4 }}>⏰ Hạn: {new Date(course.dueDate).toLocaleDateString('vi-VN')}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar__fill" style={{ width: `${progress}%` }} /></div><span style={{ fontSize: 13, fontWeight: 600 }}>{progress}%</span></div>
        <button className="btn btn--primary btn--full" style={{ marginTop: 12 }} disabled={progress === 100} onClick={() => {
          const mod = course.modules.find((m) => m.items.some((i) => !(ls?.completedItems || []).includes(i.id)));
          const first = mod?.items.find((i) => !(ls?.completedItems || []).includes(i.id));
          if (first) goToItem(first, mod.id);
        }}>{progress === 100 ? '✅ Đã hoàn thành' : (progress === 0 ? '🚀 Bắt đầu học' : 'Tiếp tục học')}</button>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Nội dung khóa học</h3>
      {course.modules.map((mod, idx) => {
        const open = unlocked.includes(mod.id);
        return (
          <div key={mod.id} className="card" style={{ marginBottom: 12, opacity: open ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{isModuleDone(mod, ls?.completedItems || []) ? '✅' : (open ? '📝' : '🔒')}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>Module {idx + 1}: {mod.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{mod.items.filter((i) => (ls?.completedItems || []).includes(i.id)).length}/{mod.items.length} bài học</div></div>
            </div>
            {open && mod.items.map((item) => {
              const done = (ls?.completedItems || []).includes(item.id);
              const meta = ITEM_TYPE_META[item.type] || { icon: '📄' };
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--color-divider)' }}>
                  <span>{done ? '✅' : '○'}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, overflowWrap: 'anywhere' }}>{meta.icon} {bracketTitle(item)}</span>
                  <button className="btn btn--ghost btn--sm" onClick={() => goToItem(item, mod.id)}>{done ? 'Xem lại' : 'Học'} →</button>
                </div>
              );
            })}
            {!open && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Hoàn thành module trước để mở khóa</div>}
          </div>
        );
      })}

      {showCongrats && (
        <Modal open centered onClose={() => setShowCongrats(false)}>
          <div style={{ textAlign: 'center', padding: 8 }}>
            <div style={{ fontSize: 64 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Chúc mừng!</h2>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Bạn đã hoàn thành <strong>{course.title}</strong>.<br />Chứng chỉ đã được tạo.
            </p>
            <button className="btn btn--primary btn--full" style={{ marginBottom: 8 }} onClick={() => { setShowCongrats(false); navigate(`/learner/certificate/${newCertId}`); }}>🎓 Xem chứng chỉ</button>
            <button className="btn btn--ghost btn--full" onClick={() => setShowCongrats(false)}>Để sau</button>
          </div>
        </Modal>
      )}
    </LearnerLayout>
  );
}
