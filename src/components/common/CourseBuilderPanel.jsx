import { useEffect, useMemo, useState } from 'react';
import {
  addCourseItem,
  addCourseModule,
  deleteCourseDefinition,
  deleteCourseItem,
  deleteCourseModule,
  getCourseContentCatalog,
  getCourseStructure,
  reorderCourseItems,
  reorderCourseModules,
  updateCourseDefinition,
  updateCourseItem,
  updateCourseModule,
} from '../../api/services/courseManagement.js';

const ITEM_TYPE_OPTIONS = [
  { value: 'flashcard', label: 'Flashcard' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'roleplay', label: 'Roleplay' },
  { value: 'lesson_reading', label: 'Reading' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'survey', label: 'Survey' },
  { value: 'live_session', label: 'Live Session' },
];

export default function CourseBuilderPanel({
  courses,
  onCourseUpdated,
  onCourseDeleted,
  showToast,
  selectedCourseId: selectedCourseIdProp,
  onSelectedCourseIdChange,
  hideCourseSelector = false,
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(selectedCourseIdProp || courses[0]?.id || '');
  const [catalog, setCatalog] = useState({});
  const [course, setCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', tags: '', duration: '30' });
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleEditTitles, setModuleEditTitles] = useState({});
  const [itemEditForms, setItemEditForms] = useState({});
  const [itemForms, setItemForms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCourseId && courses[0]?.id) setSelectedCourseId(courses[0].id);
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (selectedCourseIdProp && selectedCourseIdProp !== selectedCourseId) {
      setSelectedCourseId(selectedCourseIdProp);
    }
  }, [selectedCourseIdProp, selectedCourseId]);

  useEffect(() => {
    let mounted = true;
    async function loadCatalog() {
      try {
        const response = await getCourseContentCatalog();
        if (!mounted) return;
        setCatalog(response.catalog || {});
      } catch {
        if (!mounted) return;
        setCatalog({});
      }
    }
    loadCatalog();
    return () => { mounted = false; };
  }, []);

  const hydrateDraftForms = (nextCourse) => {
    if (!nextCourse) {
      setCourseForm({ title: '', description: '', tags: '', duration: '30' });
      setModuleEditTitles({});
      setItemEditForms({});
      return;
    }

    setCourseForm({
      title: nextCourse.title || '',
      description: nextCourse.description || '',
      tags: (nextCourse.tags || []).join(', '),
      duration: String(nextCourse.duration || 30),
    });

    setModuleEditTitles((nextCourse.modules || []).reduce((acc, mod) => {
      acc[mod.id] = mod.title || '';
      return acc;
    }, {}));

    setItemEditForms((nextCourse.modules || []).reduce((acc, mod) => {
      (mod.items || []).forEach((item) => {
        acc[item.id] = {
          type: item.type,
          contentId: item.contentId,
          title: item.title || '',
        };
      });
      return acc;
    }, {}));
  };

  const syncCourse = (nextCourse) => {
    setCourse(nextCourse);
    hydrateDraftForms(nextCourse);
    onCourseUpdated?.(nextCourse);
  };

  useEffect(() => {
    if (!selectedCourseId) return;

    if (selectedCourseIdProp && selectedCourseId !== selectedCourseIdProp) {
      onSelectedCourseIdChange?.(selectedCourseId);
    }

    let mounted = true;
    async function loadCourse() {
      setLoading(true);
      try {
        const response = await getCourseStructure(selectedCourseId);
        if (!mounted) return;
        const nextCourse = response.course || null;
        setCourse(nextCourse);
        hydrateDraftForms(nextCourse);
      } catch {
        if (!mounted) return;
        const nextCourse = courses.find((c) => c.id === selectedCourseId) || null;
        setCourse(nextCourse);
        hydrateDraftForms(nextCourse);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    loadCourse();
    return () => { mounted = false; };
  }, [selectedCourseId, selectedCourseIdProp, onSelectedCourseIdChange]);

  const selectedTypeOptions = useMemo(() => {
    const typeMap = {};
    ITEM_TYPE_OPTIONS.forEach((opt) => {
      typeMap[opt.value] = catalog[opt.value] || [];
    });
    return typeMap;
  }, [catalog]);

  const ensureItemForm = (moduleId) => {
    if (itemForms[moduleId]) return itemForms[moduleId];
    const type = 'flashcard';
    const defaultContentId = selectedTypeOptions[type]?.[0]?.id || '';
    return { type, contentId: defaultContentId, title: '' };
  };

  const setItemForm = (moduleId, patch) => {
    const current = ensureItemForm(moduleId);
    setItemForms((prev) => ({ ...prev, [moduleId]: { ...current, ...patch } }));
  };

  const ensureItemEditForm = (item) => itemEditForms[item.id] || {
    type: item.type,
    contentId: item.contentId,
    title: item.title || '',
  };

  const setItemEditForm = (item, patch) => {
    const current = ensureItemEditForm(item);
    setItemEditForms((prev) => ({ ...prev, [item.id]: { ...current, ...patch } }));
  };

  const handleSaveCourse = async () => {
    if (!course) return;
    const title = courseForm.title.trim();
    if (!title) {
      showToast?.('Tên khoá học là bắt buộc');
      return;
    }

    try {
      const response = await updateCourseDefinition(course.id, {
        ...courseForm,
        title,
      });
      syncCourse(response.course);
      showToast?.('Đã cập nhật khoá học');
    } catch (error) {
      showToast?.(error?.message || 'Không thể cập nhật khoá học');
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (!window.confirm(`Xoá khoá học "${course.title}"?`)) return;

    try {
      const deletedId = course.id;
      await deleteCourseDefinition(course.id);
      onCourseDeleted?.(deletedId);
      showToast?.('Đã xoá khoá học');
    } catch (error) {
      showToast?.(error?.message || 'Không thể xoá khoá học');
    }
  };

  const handleAddModule = async () => {
    const title = moduleTitle.trim();
    if (!title || !course) return;

    try {
      const response = await addCourseModule(course.id, title);
      syncCourse(response.course);
      setModuleTitle('');
      showToast?.('Đã thêm module');
    } catch (error) {
      showToast?.(error?.message || 'Không thể thêm module');
    }
  };

  const handleSaveModule = async (moduleId) => {
    if (!course) return;
    const title = String(moduleEditTitles[moduleId] || '').trim();
    if (!title) {
      showToast?.('Tên module là bắt buộc');
      return;
    }

    try {
      const response = await updateCourseModule(course.id, moduleId, { title });
      syncCourse(response.course);
      showToast?.('Đã cập nhật module');
    } catch (error) {
      showToast?.(error?.message || 'Không thể cập nhật module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!course) return;
    if (!window.confirm('Xoá module này?')) return;

    try {
      const response = await deleteCourseModule(course.id, moduleId);
      syncCourse(response.course);
      showToast?.('Đã xoá module');
    } catch (error) {
      showToast?.(error?.message || 'Không thể xoá module');
    }
  };

  const handleMoveModule = async (moduleId, direction) => {
    if (!course) return;
    const ids = (course.modules || []).map((mod) => mod.id);
    const index = ids.findIndex((id) => id === moduleId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return;

    [ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]];

    try {
      const response = await reorderCourseModules(course.id, ids);
      syncCourse(response.course);
      showToast?.('Đã sắp xếp module');
    } catch (error) {
      showToast?.(error?.message || 'Không thể sắp xếp module');
    }
  };

  const handleAddItem = async (moduleId) => {
    if (!course) return;
    const form = ensureItemForm(moduleId);
    if (!form.contentId) {
      showToast?.('Chưa chọn content');
      return;
    }

    try {
      const response = await addCourseItem(course.id, moduleId, form);
      syncCourse(response.course);
      setItemForms((prev) => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });
      showToast?.('Đã thêm item');
    } catch (error) {
      showToast?.(error?.message || 'Không thể thêm item');
    }
  };

  const handleSaveItem = async (moduleId, item) => {
    if (!course) return;
    const form = ensureItemEditForm(item);
    if (!form.contentId) {
      showToast?.('Chưa chọn content');
      return;
    }

    try {
      const response = await updateCourseItem(course.id, moduleId, item.id, form);
      syncCourse(response.course);
      showToast?.('Đã cập nhật item');
    } catch (error) {
      showToast?.(error?.message || 'Không thể cập nhật item');
    }
  };

  const handleDeleteItem = async (moduleId, itemId) => {
    if (!course) return;
    if (!window.confirm('Xoá item này?')) return;

    try {
      const response = await deleteCourseItem(course.id, moduleId, itemId);
      syncCourse(response.course);
      showToast?.('Đã xoá item');
    } catch (error) {
      showToast?.(error?.message || 'Không thể xoá item');
    }
  };

  const handleMoveItem = async (moduleId, itemId, direction) => {
    if (!course) return;
    const mod = (course.modules || []).find((module) => module.id === moduleId);
    if (!mod) return;

    const ids = (mod.items || []).map((item) => item.id);
    const index = ids.findIndex((id) => id === itemId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return;

    [ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]];

    try {
      const response = await reorderCourseItems(course.id, moduleId, ids);
      syncCourse(response.course);
      showToast?.('Đã sắp xếp item');
    } catch (error) {
      showToast?.(error?.message || 'Không thể sắp xếp item');
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Course Builder</h4>
        {!hideCourseSelector && (
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Khoá học</label>
            <select className="input" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        )}

        <div className="admin-form__grid" style={{ marginBottom: 10 }}>
          <div className="input-group admin-form__full"><label className="input-label">Tên khoá học</label><input className="input" value={courseForm.title} onChange={(event) => setCourseForm((prev) => ({ ...prev, title: event.target.value }))} /></div>
          <div className="input-group admin-form__full"><label className="input-label">Mô tả</label><textarea className="input" rows={3} value={courseForm.description} onChange={(event) => setCourseForm((prev) => ({ ...prev, description: event.target.value }))} style={{ resize: 'vertical' }} /></div>
          <div className="input-group"><label className="input-label">Thẻ (tách dấu phẩy)</label><input className="input" value={courseForm.tags} onChange={(event) => setCourseForm((prev) => ({ ...prev, tags: event.target.value }))} /></div>
          <div className="input-group"><label className="input-label">Thời lượng (phút)</label><input className="input" type="number" min="1" value={courseForm.duration} onChange={(event) => setCourseForm((prev) => ({ ...prev, duration: event.target.value }))} /></div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button className="btn btn--primary btn--sm" onClick={handleSaveCourse}>Lưu khoá học</button>
          <button className="btn btn--danger btn--sm" onClick={handleDeleteCourse}>Xoá khoá học</button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Tên module mới..." value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} />
          <button className="btn btn--secondary" onClick={handleAddModule}>+ Module</button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton skeleton-card" />
      ) : !course ? (
        <div className="empty-state"><div className="empty-state__title">Không tìm thấy khoá học</div></div>
      ) : (
        <>
          {course.modules?.length === 0 && <div className="empty-state"><div className="empty-state__title">Khoá học chưa có module</div></div>}
          {course.modules?.map((mod) => {
            const form = ensureItemForm(mod.id);
            const contentOptions = selectedTypeOptions[form.type] || [];
            return (
              <div key={mod.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Module {mod.order}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, marginBottom: 8 }}>
                  <input className="input" value={moduleEditTitles[mod.id] || ''} onChange={(event) => setModuleEditTitles((prev) => ({ ...prev, [mod.id]: event.target.value }))} />
                  <button className="btn btn--ghost btn--sm" onClick={() => handleMoveModule(mod.id, -1)}>Lên</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleMoveModule(mod.id, 1)}>Xuống</button>
                  <button className="btn btn--primary btn--sm" onClick={() => handleSaveModule(mod.id)}>Lưu</button>
                </div>

                {(mod.items || []).length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>Chưa có item</div>
                ) : (
                  (mod.items || []).map((item) => {
                    const editForm = ensureItemEditForm(item);
                    const itemContentOptions = selectedTypeOptions[editForm.type] || [];
                    return (
                      <div key={item.id} style={{ padding: '6px 0', borderTop: '1px solid var(--color-divider)', fontSize: 13 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}><strong>{item.id}</strong></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto auto auto', gap: 8 }}>
                          <select className="input" value={editForm.type} onChange={(event) => {
                            const nextType = event.target.value;
                            const options = selectedTypeOptions[nextType] || [];
                            const nextContent = options.find((opt) => opt.id === editForm.contentId)?.id || options[0]?.id || '';
                            setItemEditForm(item, { type: nextType, contentId: nextContent });
                          }}>
                            {ITEM_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <select className="input" value={editForm.contentId} onChange={(event) => setItemEditForm(item, { contentId: event.target.value })}>
                            <option value="">-- Chọn content --</option>
                            {itemContentOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.id} - {opt.title}</option>)}
                          </select>
                          <input className="input" value={editForm.title} onChange={(event) => setItemEditForm(item, { title: event.target.value })} />
                          <button className="btn btn--ghost btn--sm" onClick={() => handleMoveItem(mod.id, item.id, -1)}>Lên</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => handleMoveItem(mod.id, item.id, 1)}>Xuống</button>
                          <button className="btn btn--secondary btn--sm" onClick={() => handleSaveItem(mod.id, item)}>Lưu</button>
                          <button className="btn btn--danger btn--sm" onClick={() => handleDeleteItem(mod.id, item.id)}>Xoá</button>
                        </div>
                      </div>
                    );
                  })
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginTop: 10 }}>
                  <select className="input" value={form.type} onChange={(event) => {
                    const nextType = event.target.value;
                    const nextContent = (selectedTypeOptions[nextType] || [])[0]?.id || '';
                    setItemForm(mod.id, { type: nextType, contentId: nextContent });
                  }}>
                    {ITEM_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <select className="input" value={form.contentId} onChange={(event) => setItemForm(mod.id, { contentId: event.target.value })}>
                    <option value="">-- Chọn content --</option>
                    {contentOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.id} - {opt.title}</option>)}
                  </select>
                  <input className="input" placeholder="Tiêu đề item (không bắt buộc)" value={form.title} onChange={(event) => setItemForm(mod.id, { title: event.target.value })} />
                  <button className="btn btn--secondary" onClick={() => handleAddItem(mod.id)}>+ Item</button>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDeleteModule(mod.id)}>Xoá module</button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
