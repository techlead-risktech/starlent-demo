import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courses as fallbackCourses } from '../../data/mockCourses.js';
import { createCourseByScope, getCourseManagementDashboard } from '../../api/services/courseManagement.js';
import { useToast } from '../../hooks/useToast.js';
import AdminLayout from '../layout/AdminLayout.jsx';
import CourseBuilderPanel from './CourseBuilderPanel.jsx';
import Modal from './Modal.jsx';
import AddCourseForm from './AddCourseForm.jsx';

export default function CourseBuilderRoutePage({
  scope,
  title,
  backPath,
  builderBasePath,
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState(fallbackCourses);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getCourseManagementDashboard(scope);
        if (!mounted) return;
        setCourses(response.courses || fallbackCourses);
      } catch {
        // keep fallback
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [scope]);

  const selectedCourse = courses.find((course) => course.id === courseId) || null;

  const handleCourseChange = useCallback((nextCourseId) => {
    if (!nextCourseId || nextCourseId === courseId) return;
    navigate(`${builderBasePath}/${nextCourseId}/builder`, { replace: true });
  }, [builderBasePath, courseId, navigate]);

  const handleCourseUpdated = (updatedCourse) => {
    setCourses((prev) => prev.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)));
  };

  const handleCourseDeleted = (deletedCourseId) => {
    const nextCourses = courses.filter((course) => course.id !== deletedCourseId);
    setCourses(nextCourses);
    if (nextCourses.length > 0) {
      navigate(`${builderBasePath}/${nextCourses[0].id}/builder`, { replace: true });
      return;
    }
    navigate(`${backPath}?tab=courses`, { replace: true });
  };

  const handleCreateCourse = async (form) => {
    const { continueToBuilder = true, ...payload } = form;
    try {
      const response = await createCourseByScope(scope, payload);
      setCourses((prev) => [...prev, response.course]);
      showToast('Đã tạo khoá học');
      if (continueToBuilder) {
        navigate(`${builderBasePath}/${response.course.id}/builder`);
      }
    } catch (error) {
      showToast(error?.message || 'Không thể tạo khoá học');
    } finally {
      setShowCreateCourseModal(false);
    }
  };

  if (loading) {
    return <AdminLayout title={title}><div className="skeleton skeleton-card" /></AdminLayout>;
  }

  return (
    <AdminLayout title={title}>
      <div className="page__header" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(`${backPath}?tab=courses`)}>← Quay lại danh sách</button>
        <button className="btn btn--primary btn--sm" onClick={() => setShowCreateCourseModal(true)}>+ Tạo khoá học</button>
      </div>

      {!selectedCourse ? (
        <div className="empty-state">
          <div className="empty-state__icon">📚</div>
          <div className="empty-state__title">Không tìm thấy khoá học</div>
        </div>
      ) : (
        <div className="card">
          <h3 className="card__title" style={{ marginBottom: 12 }}>🧱 Builder: {selectedCourse.title}</h3>
          <CourseBuilderPanel
            courses={courses}
            selectedCourseId={selectedCourse.id}
            onSelectedCourseIdChange={handleCourseChange}
            onCourseUpdated={handleCourseUpdated}
            onCourseDeleted={handleCourseDeleted}
            showToast={showToast}
            hideCourseSelector
          />
        </div>
      )}

      <Modal open={showCreateCourseModal} onClose={() => setShowCreateCourseModal(false)}>
        <AddCourseForm onClose={() => setShowCreateCourseModal(false)} onSubmit={handleCreateCourse} />
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
