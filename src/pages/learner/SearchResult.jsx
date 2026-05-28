import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSE_STATUS, courses as fallbackCourses, getCourseProgress } from '../../data/mockCourses.js';
import { getLearningState } from '../../utils/auth.js';
import { searchCourses } from '../../api/services/courses.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { useI18n } from '../../i18n/index.jsx';

const ICON_SEARCH = '🔍';
const ICON_BOOK = '📖';
const ICON_SAD = '😕';

function formatText(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

export default function SearchResult() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await searchCourses(query);
      setResults(response.items || []);
    } catch {
      const state = getLearningState();
      const completedItems = state.completedItems || [];
      const q = query.toLowerCase();
      const fallback = fallbackCourses
        .filter((course) => course.status === COURSE_STATUS.PUBLISHED)
        .map((course) => ({ ...course, progress: getCourseProgress(course, completedItems) }))
        .filter((course) => course.title.toLowerCase().includes(q) || (course.tags || []).some((tag) => tag.toLowerCase().includes(q)));
      setResults(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{t('learnerPages.search.title')}</div></div>}>
      <div style={{ padding: 16 }}>
        <input
          className="input"
          style={{ marginBottom: 8 }}
          placeholder={t('learnerPages.search.placeholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') runSearch(); }}
        />
        <button className="btn btn--primary btn--full" onClick={runSearch} disabled={loading}>
          {loading ? t('learnerPages.search.searching') : `${ICON_SEARCH} ${t('learnerPages.search.searchBtn')}`}
        </button>

        {results === null ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state__icon">{ICON_SEARCH}</div>
            <div className="empty-state__title">{t('learnerPages.search.hint')}</div>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state__icon">{ICON_SAD}</div>
            <div className="empty-state__title">{t('learnerPages.search.noResult')}</div>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              {formatText(t('learnerPages.search.coursesCount'), { count: results.length })}
            </h4>
            {results.map((course) => (
              <div key={course.id} className="card card--hoverable" style={{ marginBottom: 8 }} onClick={() => navigate(`/learner/course/${course.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{ICON_BOOK}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{course.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {formatText(t('learnerPages.search.modulesRating'), { moduleCount: course.moduleCount, rating: course.rating })}
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



