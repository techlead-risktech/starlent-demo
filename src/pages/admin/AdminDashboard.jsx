import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import Modal from '../../components/common/Modal.jsx';
import Dropdown from '../../components/common/Dropdown.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { users, ROLE_LABELS } from '../../data/mockUsers.js';
import { courses, COURSE_STATUS } from '../../data/mockCourses.js';
import { reportSummary, progressByDepartment, courseProgressReport, quizResults, auditLogs } from '../../data/mockReports.js';

const ROLES = [
  { value: 'learner', label: 'Học viên' },
  { value: 'trainer', label: 'Giảng viên' },
  { value: 'editor', label: 'Biên tập viên' },
  { value: 'learning_manager', label: 'Quản lý đào tạo' },
  { value: 'dept_manager', label: 'Quản lý phòng ban' },
  { value: 'admin', label: 'Quản trị viên' },
];

const DEPARTMENTS = ['Công nghệ thông tin', 'Nhân sự', 'Kinh doanh', 'Marketing', 'Tài chính', 'Vận hành'];

function AddUserForm({ onClose, showToast }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'learner', department: '', password: '' });

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const handleDropdown = (field) => (val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('✅ Đã tạo tài khoản (mock)');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h3 className="admin-form__title">➕ Thêm người dùng mới</h3>
      <div className="admin-form__grid">
        <div className="input-group">
          <label className="input-label">Họ và tên *</label>
          <input className="input" placeholder="Nguyễn Văn A" value={form.name} onChange={handleChange('name')} required />
        </div>
        <div className="input-group">
          <label className="input-label">Email *</label>
          <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange('email')} required />
        </div>
        <div className="input-group">
          <label className="input-label">Vai trò</label>
          <Dropdown value={form.role} options={ROLES} onChange={handleDropdown('role')} />
        </div>
        <div className="input-group">
          <label className="input-label">Phòng ban</label>
          <Dropdown value={form.department} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} onChange={handleDropdown('department')} placeholder="-- Chọn phòng ban --" />
        </div>
        <div className="input-group admin-form__full">
          <label className="input-label">Mật khẩu *</label>
          <input className="input" type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={handleChange('password')} required minLength={6} />
        </div>
      </div>
      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>Huỷ</button>
        <button type="submit" className="btn btn--primary">✅ Tạo tài khoản</button>
      </div>
    </form>
  );
}

function AddCourseForm({ onClose, showToast }) {
  const [form, setForm] = useState({ title: '', description: '', tags: '', moduleCount: '1', duration: '30', status: 'draft' });

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const handleDropdown = (field) => (val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('✅ Đã tạo khoá học (mock)');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h3 className="admin-form__title">📚 Thêm khoá học mới</h3>
      <div className="admin-form__grid">
        <div className="input-group admin-form__full">
          <label className="input-label">Tên khoá học *</label>
          <input className="input" placeholder="Nhập tên khoá học" value={form.title} onChange={handleChange('title')} required />
        </div>
        <div className="input-group admin-form__full">
          <label className="input-label">Mô tả</label>
          <textarea className="input" rows={3} placeholder="Mô tả ngắn về khoá học" value={form.description} onChange={handleChange('description')} style={{ resize: 'vertical' }} />
        </div>
        <div className="input-group">
          <label className="input-label">Thẻ (tags)</label>
          <input className="input" placeholder="VD: React, JavaScript, CSS" value={form.tags} onChange={handleChange('tags')} />
        </div>
        <div className="input-group">
          <label className="input-label">Số module</label>
          <input className="input" type="number" min="1" max="20" value={form.moduleCount} onChange={handleChange('moduleCount')} />
        </div>
        <div className="input-group">
          <label className="input-label">Thời lượng (phút)</label>
          <input className="input" type="number" min="5" value={form.duration} onChange={handleChange('duration')} />
        </div>
        <div className="input-group">
          <label className="input-label">Trạng thái</label>
          <Dropdown value={form.status} options={[{ value: 'draft', label: 'Bản nháp' }, { value: 'published', label: 'Xuất bản' }]} onChange={handleDropdown('status')} />
        </div>
      </div>
      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>Huỷ</button>
        <button type="submit" className="btn btn--primary">✅ Tạo khoá học</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';

  const [showUserModal, setShowUserModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  return (
    <AdminLayout title="Quản trị hệ thống">
      <div className="admin-header">
        <div>
          <h2 className="admin-header__greeting">Xin chào, {user?.name}</h2>
          <p className="admin-header__role">Vai trò: Quản trị hệ thống</p>
        </div>
      </div>

      <div className="tabs">
        {[
          { key: 'overview', label: '📊 Tổng quan' },
          { key: 'users', label: '👥 Người dùng' },
          { key: 'courses', label: '📚 Khoá học' },
          { key: 'reports', label: '📈 Báo cáo' },
          { key: 'certificates', label: '🎓 Chứng chỉ' },
          { key: 'audit', label: '📋 Nhật ký' },
          { key: 'settings', label: '⚙️ Cài đặt' },
        ].map(t => (
          <button key={t.key} className={`tab${tab === t.key ? ' tab--active' : ''}`} onClick={() => setParams({ tab: t.key })}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === 'overview' && <>
        <div className="grid-4">
          <div className="stat-card">
            <div className="stat-card__icon">👥</div>
            <div className="stat-card__label">Người dùng</div>
            <div className="stat-card__value">{users.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">📚</div>
            <div className="stat-card__label">Khoá học</div>
            <div className="stat-card__value">{courses.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">🎓</div>
            <div className="stat-card__label">Học viên</div>
            <div className="stat-card__value">{reportSummary.activeLearners}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">🏅</div>
            <div className="stat-card__label">Chứng chỉ</div>
            <div className="stat-card__value">{reportSummary.totalCertificates}</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3 className="card__title">Tiến độ phòng ban</h3>
          {progressByDepartment.map(d => (
            <div key={d.department} className="chart-bar-row">
              <div className="chart-bar-label">{d.department}</div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${d.completionRate}%` }} />
              </div>
              <div className="chart-bar-value">{d.completionRate}%</div>
            </div>
          ))}
        </div>
      </>}

      {/* ===== USERS ===== */}
      {tab === 'users' && <div>
        <div className="admin-toolbar">
          <h3 className="admin-toolbar__title">Danh sách người dùng ({users.length})</h3>
          <button className="btn btn--primary" onClick={() => setShowUserModal(true)}>+ Thêm người dùng</button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Phòng ban</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td className="table__email">{u.email}</td>
                  <td><span className="badge badge--info">{ROLE_LABELS[u.role]}</span></td>
                  <td>{u.department}</td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => showToast('✏️ Sửa (mock)')}>✏️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}

      {/* ===== COURSES ===== */}
      {tab === 'courses' && <div>
        <div className="admin-toolbar">
          <h3 className="admin-toolbar__title">Danh sách khoá học ({courses.length})</h3>
          <button className="btn btn--primary" onClick={() => setShowCourseModal(true)}>+ Thêm khoá học</button>
        </div>
        <div className="grid-2">
          {courses.map(c => (
            <div key={c.id} className="card course-card">
              <div className="course-card__header">
                <div className="course-card__title">{c.title}</div>
                <span className={`badge ${c.status === COURSE_STATUS.PUBLISHED ? 'badge--success' : 'badge--warning'}`}>{c.status}</span>
              </div>
              <div className="course-card__tags">
                {c.tags.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
              <div className="course-card__meta">
                <span>📦 {c.moduleCount} module</span>
                <span>⏱ {c.duration}p</span>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* ===== REPORTS ===== */}
      {tab === 'reports' && <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card__title">Tiến độ khoá học</h3>
          {courseProgressReport.map(c => (
            <div key={c.courseId} className="chart-bar-row">
              <div className="chart-bar-label">{c.courseName}</div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill progress-bar__fill--success" style={{ width: `${Math.round((c.completed / c.enrolled) * 100)}%` }} />
              </div>
              <div className="chart-bar-value">{Math.round((c.completed / c.enrolled) * 100)}%</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card__title">Kết quả Quiz</h3>
          {quizResults.map(q => (
            <div key={q.quizId} className="chart-bar-row">
              <div className="chart-bar-label">{q.quizName}</div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill progress-bar__fill--success" style={{ width: `${q.passRate}%` }} />
              </div>
              <div className="chart-bar-value">{q.passRate}%</div>
            </div>
          ))}
        </div>
        <button className="btn btn--secondary btn--full" onClick={() => showToast('📥 Đang xuất CSV (mock)')}>📥 Xuất CSV/XLSX</button>
      </div>}

      {/* ===== CERTIFICATES ===== */}
      {tab === 'certificates' && <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Học viên</th><th>Khoá học</th><th>Ngày</th><th>Điểm</th><th>Mã</th></tr></thead>
          <tbody>
            <tr><td>Nguyễn Văn An</td><td>An toàn thông tin</td><td>10/05/2026</td><td><span className="badge badge--success">88</span></td><td>SL-CERT-0001</td></tr>
            <tr><td>Vũ Minh Tuấn</td><td>Kỹ năng giao tiếp</td><td>25/04/2026</td><td><span className="badge badge--success">92</span></td><td>SL-CERT-0002</td></tr>
          </tbody>
        </table>
      </div>}

      {/* ===== AUDIT ===== */}
      {tab === 'audit' && <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Nhật ký hệ thống</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Đối tượng</th></tr></thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td className="table__date">{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                  <td>{log.userName}</td>
                  <td>{log.action}</td>
                  <td className="table__email">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}

      {/* ===== SETTINGS ===== */}
      {tab === 'settings' && <div>
        <div className="card" style={{ marginBottom: 12 }}>
          <h4 className="card__title">🔧 Cấu hình chung</h4>
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Tên hệ thống</label>
            <input className="input" defaultValue="Starlent MicroLearn" />
          </div>
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Ngôn ngữ</label>
            <Dropdown value="vi" options={[{value:'vi',label:'Tiếng Việt'},{value:'en',label:'English'}]} onChange={()=>{}} />
          </div>
          <button className="btn btn--primary btn--full" onClick={() => showToast('✅ Đã lưu (mock)')}>💾 Lưu</button>
        </div>
        <div className="card" style={{ marginBottom: 12 }}>
          <h4 className="card__title">🔌 Tích hợp</h4>
          <div className="settings-row"><span>SSO</span><button className="btn btn--sm btn--secondary">Cấu hình</button></div>
          <div className="settings-row"><span>Webhook</span><button className="btn btn--sm btn--secondary">Cấu hình</button></div>
          <div className="settings-row"><span>API Key</span><button className="btn btn--sm btn--secondary">Quản lý</button></div>
        </div>
        <div className="card">
          <h4 className="card__title">⚠️ Vùng nguy hiểm</h4>
          <button className="btn btn--danger btn--full" onClick={() => showToast('⚠️ Mock — không thực thi')}>🗑️ Xoá tất cả dữ liệu</button>
        </div>
      </div>}

      {/* Modals */}
      <Modal open={showUserModal} onClose={() => setShowUserModal(false)}>
        <AddUserForm onClose={() => setShowUserModal(false)} showToast={showToast} />
      </Modal>

      <Modal open={showCourseModal} onClose={() => setShowCourseModal(false)}>
        <AddCourseForm onClose={() => setShowCourseModal(false)} showToast={showToast} />
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
