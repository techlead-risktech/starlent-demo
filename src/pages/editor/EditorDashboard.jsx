import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import Modal from '../../components/common/Modal.jsx';
import AddCourseForm from '../../components/common/AddCourseForm.jsx';
import CourseManagementSection from '../../components/common/CourseManagementSection.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { courses as fallbackCourses, COURSE_STATUS } from '../../data/mockCourses.js';
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

const CONTENT_TYPE_OPTIONS = [
  { type: 'flashcard', label: 'Flashcard', icon: '🗂️' },
  { type: 'video', label: 'Video', icon: '🎬' },
  { type: 'audio', label: 'Audio', icon: '🎧' },
  { type: 'quiz_mc', label: 'Quiz MC', icon: '📝' },
  { type: 'quiz_sequence', label: 'Quiz Sequence', icon: '🧩' },
  { type: 'roleplay', label: 'Roleplay', icon: '🎭' },
];

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '{}';
  }
}

function parseJsonOrNull(text) {
  const raw = String(text || '').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

export default function EditorDashboard() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState(fallbackCourses);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const [catalogSummary, setCatalogSummary] = useState({});
  const [activeContentType, setActiveContentType] = useState('');
  const [contentItems, setContentItems] = useState([]);
  const [selectedContentId, setSelectedContentId] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentDataJson, setContentDataJson] = useState('{}');
  const [loadingContent, setLoadingContent] = useState(false);
  const [showCreateContentModal, setShowCreateContentModal] = useState(false);
  const [createContentForm, setCreateContentForm] = useState({
    type: 'flashcard',
    id: '',
    title: '',
    dataJson: '{}',
  });

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
        setContentDataJson('{}');
      }
    } catch (error) {
      setContentItems([]);
      setSelectedContentId('');
      setContentTitle('');
      setContentDataJson('{}');
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
      setContentDataJson(safeJsonStringify(rest));
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
      } catch {
        // keep fallback
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (tab !== 'content') return;
    loadCatalogSummary();
  }, [tab]);

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

  const openContentManager = async (type) => {
    setActiveContentType(type);
    setSelectedContentId('');
    setContentTitle('');
    setContentDataJson('{}');
    await loadContentList(type);
  };

  const handleSaveContent = async () => {
    if (!activeContentType || !selectedContentId) return;
    const title = contentTitle.trim();
    if (!title) {
      showToast('⚠️ Tiêu đề content là bắt buộc');
      return;
    }

    let parsedData;
    try {
      parsedData = parseJsonOrNull(contentDataJson);
      if (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)) {
        showToast('⚠️ JSON payload phải là object');
        return;
      }
    } catch {
      showToast('⚠️ JSON không hợp lệ');
      return;
    }

    try {
      await updateCourseContent(activeContentType, selectedContentId, {
        title,
        data: parsedData,
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
      setContentDataJson('{}');
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

    let data;
    try {
      data = parseJsonOrNull(createContentForm.dataJson);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        showToast('⚠️ JSON payload phải là object');
        return;
      }
    } catch {
      showToast('⚠️ JSON không hợp lệ');
      return;
    }

    try {
      const response = await createCourseContent(type, {
        id: forcedId || undefined,
        title,
        data,
      });
      const createdId = response.content?.id;
      showToast('✅ Đã tạo content');
      setShowCreateContentModal(false);
      setCreateContentForm({ type, id: '', title: '', dataJson: '{}' });
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
        {[
          { key: 'overview', label: '📊 Tổng quan' },
          { key: 'courses', label: '📚 Khoá học' },
          { key: 'content', label: '📝 Nội dung' },
          { key: 'publish', label: '✅ Xuất bản' },
        ].map((item) => (
          <button key={item.key} className={`tab${tab === item.key ? ' tab--active' : ''}`} onClick={() => changeTab(item.key)}>
            {item.label}
          </button>
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
            <div
              key={course.id}
              className="card card--hoverable"
              style={{ marginBottom: 8 }}
              onClick={() => openBuilderForCourse(course.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{course.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{course.moduleCount} module · {course.duration}p</div>
                </div>
                <span className={`badge ${course.status === COURSE_STATUS.PUBLISHED ? 'badge--success' : 'badge--warning'}`}>{course.status}</span>
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
          renderActions={() => (
            <>
              <button className="btn btn--ghost btn--sm">✏️ Sửa</button>
              <button className="btn btn--ghost btn--sm">👁️ Xem</button>
            </>
          )}
        />
      )}

      {tab === 'content' && (
        <div>
          <div className="admin-toolbar">
            <h3 className="admin-toolbar__title">Nguồn content</h3>
            <button className="btn btn--primary" onClick={() => setShowCreateContentModal(true)}>+ Tạo content</button>
          </div>

          <div className="grid-2" style={{ marginBottom: 12 }}>
            {CONTENT_TYPE_OPTIONS.map((item) => (
              <div key={item.type} className="card" style={{ border: activeContentType === item.type ? '2px solid var(--color-primary)' : undefined }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {(catalogSummary[item.type] || []).length} item
                </div>
                <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={() => openContentManager(item.type)}>Quản lý</button>
              </div>
            ))}
          </div>

          {activeContentType && (
            <div className="card">
              <h4 className="card__title" style={{ marginBottom: 10 }}>
                {contentTypeMeta[activeContentType]?.icon} {contentTypeMeta[activeContentType]?.label}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Danh sách ({contentItems.length})</div>
                  {loadingContent && contentItems.length === 0 ? (
                    <div className="skeleton skeleton-card" />
                  ) : contentItems.length === 0 ? (
                    <div className="empty-state"><div className="empty-state__title">Chưa có content</div></div>
                  ) : (
                    contentItems.map((item) => (
                      <button
                        key={item.id}
                        className={`btn btn--full ${selectedContentId === item.id ? 'btn--primary' : 'btn--secondary'}`}
                        style={{ marginBottom: 6, justifyContent: 'flex-start' }}
                        onClick={() => loadContentDetail(activeContentType, item.id)}
                      >
                        {item.id} · {item.title}
                      </button>
                    ))
                  )}
                </div>

                <div>
                  {!selectedContentId ? (
                    <div className="empty-state"><div className="empty-state__title">Chọn một content để chỉnh sửa</div></div>
                  ) : (
                    <>
                      <div className="input-group" style={{ marginBottom: 8 }}>
                        <label className="input-label">ID</label>
                        <input className="input" value={selectedContentId} disabled />
                      </div>
                      <div className="input-group" style={{ marginBottom: 8 }}>
                        <label className="input-label">Tiêu đề</label>
                        <input className="input" value={contentTitle} onChange={(event) => setContentTitle(event.target.value)} />
                      </div>
                      <div className="input-group" style={{ marginBottom: 8 }}>
                        <label className="input-label">Payload JSON (không gồm id/title)</label>
                        <textarea className="input" rows={14} value={contentDataJson} onChange={(event) => setContentDataJson(event.target.value)} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                <div>
                  <div style={{ fontWeight: 700 }}>{course.title}</div>
                  <span className={`badge ${course.status === COURSE_STATUS.PUBLISHED ? 'badge--success' : 'badge--warning'}`}>{course.status}</span>
                </div>
                <button className={`btn btn--sm ${course.status === COURSE_STATUS.PUBLISHED ? 'btn--secondary' : 'btn--success'}`} onClick={() => togglePublish(course.id)}>
                  {course.status === COURSE_STATUS.PUBLISHED ? 'Huỷ XB' : 'Xuất bản'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCourseModal} onClose={() => setShowCourseModal(false)}>
        <AddCourseForm onClose={() => setShowCourseModal(false)} onSubmit={handleCreateCourse} />
      </Modal>

      <Modal open={showCreateContentModal} onClose={() => setShowCreateContentModal(false)}>
        <form onSubmit={handleCreateContent} className="admin-form">
          <h3 className="admin-form__title">➕ Tạo content mới</h3>
          <div className="admin-form__grid">
            <div className="input-group">
              <label className="input-label">Loại content</label>
              <select className="input" value={createContentForm.type} onChange={(event) => setCreateContentForm((prev) => ({ ...prev, type: event.target.value }))}>
                {CONTENT_TYPE_OPTIONS.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">ID (tuỳ chọn)</label>
              <input className="input" value={createContentForm.id} onChange={(event) => setCreateContentForm((prev) => ({ ...prev, id: event.target.value }))} placeholder="Để trống để auto-generate" />
            </div>
            <div className="input-group admin-form__full">
              <label className="input-label">Tiêu đề *</label>
              <input className="input" value={createContentForm.title} onChange={(event) => setCreateContentForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </div>
            <div className="input-group admin-form__full">
              <label className="input-label">Payload JSON (không gồm id/title)</label>
              <textarea className="input" rows={10} value={createContentForm.dataJson} onChange={(event) => setCreateContentForm((prev) => ({ ...prev, dataJson: event.target.value }))} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }} />
            </div>
          </div>
          <div className="admin-form__actions">
            <button type="button" className="btn btn--secondary" onClick={() => setShowCreateContentModal(false)}>Huỷ</button>
            <button type="submit" className="btn btn--primary">✅ Tạo content</button>
          </div>
        </form>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
