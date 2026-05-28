import { useState } from 'react';
import Dropdown from './Dropdown.jsx';
import { useI18n } from '../../i18n/index.jsx';

export default function AddCourseForm({ onClose, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    duration: '30',
    status: 'draft',
    continueToBuilder: true,
  });

  const change = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  const courseStatusOptions = [
    { value: 'draft', label: t('ui.courseStatus.draft') },
    { value: 'published', label: t('ui.courseStatus.published') },
  ];

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="admin-form">
      <h3 className="admin-form__title">{'📚'} {t('ui.addCourse.title')}</h3>
      <div className="admin-form__grid">
        <div className="input-group admin-form__full"><label className="input-label">{t('ui.addCourse.courseTitle')} *</label><input className="input" value={form.title} onChange={change('title')} required /></div>
        <div className="input-group admin-form__full"><label className="input-label">{t('ui.addCourse.description')}</label><textarea className="input" rows={3} value={form.description} onChange={change('description')} style={{ resize: 'vertical' }} /></div>
        <div className="input-group"><label className="input-label">{t('ui.addCourse.tags')}</label><input className="input" value={form.tags} onChange={change('tags')} /></div>
        <div className="input-group"><label className="input-label">{t('ui.addCourse.durationMinutes')}</label><input className="input" type="number" min="5" value={form.duration} onChange={change('duration')} /></div>
        <div className="input-group"><label className="input-label">{t('ui.addCourse.status')}</label><Dropdown value={form.status} options={courseStatusOptions} onChange={(value) => setForm((prev) => ({ ...prev, status: value }))} /></div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
        <input type="checkbox" checked={form.continueToBuilder} onChange={(event) => setForm((prev) => ({ ...prev, continueToBuilder: event.target.checked }))} />
        {t('ui.addCourse.continueToBuilder')}
      </label>
      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>{t('common.cancel')}</button>
        <button type="submit" className="btn btn--primary">{'\u2705'} {t('ui.addCourse.submit')}</button>
      </div>
    </form>
  );
}

