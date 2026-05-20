import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSE_STATUS, courses as fallbackCourses, getCourseProgress } from '../../data/mockCourses.js';
import { getLearningState } from '../../utils/auth.js';
import { getExploreCourses } from '../../api/services/courses.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

const TAG_TABS = ['Tất cả', 'Kỹ năng mềm', 'Bảo mật', 'Năng suất', 'Teamwork'];

export default function ExploreLibrary() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Tất cả');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeTag = selectedTab === 'Tất cả' ? '' : selectedTab;

  useEffect(() => {
    let mounted = true;
    async function loadExplore() {
      setLoading(true);
      try {
        const response = await getExploreCourses({ query, tag: activeTag });
        if (!mounted) return;
        setItems(response.items || []);
      } catch {
        if (!mounted) return;
        const state = getLearningState();
        const completedItems = state.completedItems || [];
        const fallback = fallbackCourses
          .filter((course) => course.status === COURSE_STATUS.PUBLISHED)
          .map((course) => ({ ...course, progress: getCourseProgress(course, completedItems) }))
          .filter((course) => {
            const tagMatch = !activeTag || (course.tags || []).includes(activeTag);
            const q = query.trim().toLowerCase();
            const queryMatch = !q
              || course.title.toLowerCase().includes(q)
              || (course.tags || []).some((tag) => tag.toLowerCase().includes(q));
            return tagMatch && queryMatch;
          });
        setItems(fallback);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadExplore();
    return () => { mounted = false; };
  }, [query, activeTag]);

  const emptyMessage = useMemo(() => {
    if (loading) return 'Đang tải khóa học...';
    if (query || activeTag) return 'Không tìm thấy khóa học phù hợp';
    return 'Chưa có khóa học nào';
  }, [loading, query, activeTag]);

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Khám phá</div></div>}>
      <div style={{ padding: 16 }}>
        <input className="input" style={{ marginBottom: 16 }} placeholder="🔍 Tìm khóa học..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="tabs" style={{ marginBottom: 16 }}>
          {TAG_TABS.map((tab) => (
            <button key={tab} className={`tab${selectedTab === tab ? ' tab--active' : ''}`} onClick={() => setSelectedTab(tab)}>{tab}</button>
          ))}
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">{loading ? '⏳' : '🔍'}</div>
            <div className="empty-state__title">{emptyMessage}</div>
          </div>
        ) : (
          <div className="grid-2">
            {items.map((course) => (
              <div key={course.id} className="card card--hoverable" onClick={() => navigate(`/learner/course/${course.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>📖</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{course.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {(course.tags || []).map((tag) => <span key={tag} className="chip">{tag}</span>)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      ⏱ {course.duration}p · 📦 {course.moduleCount} · ⭐ {course.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
}
