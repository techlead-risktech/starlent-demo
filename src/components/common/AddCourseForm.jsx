import { useState } from 'react';
import Dropdown from './Dropdown.jsx';

const COURSE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Xuất bản' },
];

export default function AddCourseForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    duration: '30',
    status: 'draft',
    continueToBuilder: true,
  });

  const change = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="admin-form">
      <h3 className="admin-form__title">📚 Thêm khoá học mới</h3>
      <div className="admin-form__grid">
        <div className="input-group admin-form__full"><label className="input-label">Tên khoá học *</label><input className="input" value={form.title} onChange={change('title')} required /></div>
        <div className="input-group admin-form__full"><label className="input-label">Mô tả</label><textarea className="input" rows={3} value={form.description} onChange={change('description')} style={{ resize: 'vertical' }} /></div>
        <div className="input-group"><label className="input-label">Thẻ</label><input className="input" value={form.tags} onChange={change('tags')} /></div>
        <div className="input-group"><label className="input-label">Thời lượng (phút)</label><input className="input" type="number" min="5" value={form.duration} onChange={change('duration')} /></div>
        <div className="input-group"><label className="input-label">Trạng thái</label><Dropdown value={form.status} options={COURSE_STATUS_OPTIONS} onChange={(value) => setForm((prev) => ({ ...prev, status: value }))} /></div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
        <input type="checkbox" checked={form.continueToBuilder} onChange={(event) => setForm((prev) => ({ ...prev, continueToBuilder: event.target.checked }))} />
        Sau khi tạo, mở Builder để thêm module/item ngay
      </label>
      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>Huỷ</button>
        <button type="submit" className="btn btn--primary">✅ Tạo khoá học</button>
      </div>
    </form>
  );
}
