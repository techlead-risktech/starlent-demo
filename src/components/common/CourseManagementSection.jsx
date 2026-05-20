import { COURSE_STATUS } from '../../data/mockCourses.js';

export default function CourseManagementSection({
  courses,
  onOpenCourse,
  onOpenBuilder,
  onOpenCreateCourse,
  renderActions,
  title = 'Danh sách khoá học',
  createButtonLabel = '+ Thêm khoá học',
}) {
  return (
    <div>
      <div className="admin-toolbar">
        <h3 className="admin-toolbar__title">{title} ({courses.length})</h3>
        <button className="btn btn--primary" onClick={onOpenCreateCourse}>{createButtonLabel}</button>
      </div>

      <div className="grid-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="card course-card card--hoverable"
            onClick={() => onOpenCourse?.(course.id)}
          >
            <div className="course-card__header">
              <div className="course-card__title">{course.title}</div>
              <span className={`badge ${course.status === COURSE_STATUS.PUBLISHED ? 'badge--success' : 'badge--warning'}`}>{course.status}</span>
            </div>
            <div className="course-card__tags">{(course.tags || []).map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
            <div className="course-card__meta"><span>{course.moduleCount} module</span><span>{course.duration}p</span></div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn--ghost btn--sm" onClick={(event) => { event.stopPropagation(); onOpenBuilder(course.id); }}>Builder</button>
              {renderActions && <span onClick={(event) => event.stopPropagation()}>{renderActions(course)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
