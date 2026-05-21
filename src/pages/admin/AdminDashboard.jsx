import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import Modal from '../../components/common/Modal.jsx';
import Dropdown from '../../components/common/Dropdown.jsx';
import AddCourseForm from '../../components/common/AddCourseForm.jsx';
import CourseManagementSection from '../../components/common/CourseManagementSection.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { users as fallbackUsers, ROLE_LABELS as fallbackRoleLabels } from '../../data/mockUsers.js';
import { courses as fallbackCourses } from '../../data/mockCourses.js';
import {
  reportSummary as fallbackSummary,
  progressByDepartment as fallbackProgressByDepartment,
  courseProgressReport as fallbackCourseProgress,
  quizResults as fallbackQuizResults,
  auditLogs as fallbackAuditLogs,
} from '../../data/mockReports.js';
import { createUser } from '../../api/services/userManagement.js';
import { createCourseByScope } from '../../api/services/courseManagement.js';
import { getAdminReportingDashboard } from '../../api/services/reporting.js';

const STATE_SYNC_EVENT = 'starlent:state-sync';
const STATE_SYNC_KEY = 'starlent_state_sync_v1';

const ROLES = [
  { value: 'learner', label: 'Học viên' },
  { value: 'trainer', label: 'Giảng viên' },
  { value: 'editor', label: 'Biên tập viên' },
  { value: 'learning_manager', label: 'Quản lý đào tạo' },
  { value: 'dept_manager', label: 'Quản lý phòng ban' },
  { value: 'admin', label: 'Quản trị viên' },
];

const DEPARTMENTS = ['Công nghệ thông tin', 'Nhân sự', 'Kinh doanh', 'Marketing', 'Tài chính', 'Vận hành'];

function AddUserForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'learner', department: '', password: '' });
  const change = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="admin-form">
      <h3 className="admin-form__title">➕ Thêm người dùng mới</h3>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">Họ và tên *</label><input className="input" value={form.name} onChange={change('name')} required /></div>
        <div className="input-group"><label className="input-label">Email *</label><input className="input" type="email" value={form.email} onChange={change('email')} required /></div>
        <div className="input-group"><label className="input-label">Vai trò</label><Dropdown value={form.role} options={ROLES} onChange={(value) => setForm((prev) => ({ ...prev, role: value }))} /></div>
        <div className="input-group"><label className="input-label">Phòng ban</label><Dropdown value={form.department} options={DEPARTMENTS.map((department) => ({ value: department, label: department }))} onChange={(value) => setForm((prev) => ({ ...prev, department: value }))} placeholder="-- Chọn phòng ban --" /></div>
        <div className="input-group admin-form__full"><label className="input-label">Mật khẩu *</label><input className="input" type="password" value={form.password} onChange={change('password')} minLength={6} required /></div>
      </div>
      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>Huỷ</button>
        <button type="submit" className="btn btn--primary">✅ Tạo tài khoản</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    users: fallbackUsers,
    courses: fallbackCourses,
    roleLabels: fallbackRoleLabels,
    reportSummary: fallbackSummary,
    progressByDepartment: fallbackProgressByDepartment,
    courseProgressReport: fallbackCourseProgress,
    quizResults: fallbackQuizResults,
    auditLogs: fallbackAuditLogs,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const lastSyncAtRef = useRef(0);

  const changeTab = (nextTab) => {
    const next = new URLSearchParams(params);
    next.set('tab', nextTab);
    setParams(next);
  };

  const openBuilderForCourse = (courseId) => {
    if (!courseId) return;
    navigate(`/admin/courses/${courseId}/builder`);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getAdminReportingDashboard();
        if (!mounted) return;
        setData({
          users: response.users || fallbackUsers,
          courses: response.courses || fallbackCourses,
          roleLabels: response.roleLabels || fallbackRoleLabels,
          reportSummary: response.reportSummary || fallbackSummary,
          progressByDepartment: response.progressByDepartment || fallbackProgressByDepartment,
          courseProgressReport: response.courseProgressReport || fallbackCourseProgress,
          quizResults: response.quizResults || fallbackQuizResults,
          auditLogs: response.auditLogs || fallbackAuditLogs,
        });
      } catch {
        // keep fallback
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [reloadTick]);

  useEffect(() => {
    const triggerSync = () => {
      const now = Date.now();
      if (now - lastSyncAtRef.current < 800) return;
      lastSyncAtRef.current = now;
      setReloadTick((value) => value + 1);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') triggerSync();
    };
    const handleStorageSync = (event) => {
      if (event.key === STATE_SYNC_KEY) triggerSync();
    };

    window.addEventListener('focus', triggerSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(STATE_SYNC_EVENT, triggerSync);
    window.addEventListener('storage', handleStorageSync);

    return () => {
      window.removeEventListener('focus', triggerSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(STATE_SYNC_EVENT, triggerSync);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  const handleCreateUser = async (form) => {
    try {
      const response = await createUser(form);
      setData((prev) => ({ ...prev, users: [...prev.users, response.user] }));
      showToast('✅ Đã tạo tài khoản');
    } catch (error) {
      showToast(error?.message || '❌ Không thể tạo tài khoản');
    } finally {
      setShowUserModal(false);
    }
  };

  const handleCreateCourse = async (form) => {
    const { continueToBuilder = true, ...payload } = form;
    try {
      const response = await createCourseByScope('admin', payload);
      setData((prev) => ({ ...prev, courses: [...prev.courses, response.course] }));
      showToast('✅ Đã tạo khoá học');
      if (continueToBuilder) openBuilderForCourse(response.course.id);
    } catch (error) {
      showToast(error?.message || '❌ Không thể tạo khoá học');
    } finally {
      setShowCourseModal(false);
    }
  };

  if (loading) return <AdminLayout title="Quản trị hệ thống"><div className="skeleton skeleton-card" /></AdminLayout>;

  return (
    <AdminLayout title="Quản trị hệ thống">
      <div className="admin-header"><div><h2 className="admin-header__greeting">Xin chào, {user?.name}</h2><p className="admin-header__role">Vai trò: Quản trị hệ thống</p></div></div>
      <div className="tabs">
        {[{ key: 'overview', label: '📊 Tổng quan' }, { key: 'users', label: '👥 Người dùng' }, { key: 'courses', label: '📚 Khoá học' }, { key: 'reports', label: '📈 Báo cáo' }, { key: 'certificates', label: '🎓 Chứng chỉ' }, { key: 'audit', label: '📋 Nhật ký' }, { key: 'settings', label: '⚙️ Cài đặt' }].map((item) => <button key={item.key} className={`tab${tab === item.key ? ' tab--active' : ''}`} onClick={() => changeTab(item.key)}>{item.label}</button>)}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <div className="stat-card"><div className="stat-card__icon">👥</div><div className="stat-card__label">Người dùng</div><div className="stat-card__value">{data.users.length}</div></div>
            <div className="stat-card"><div className="stat-card__icon">📚</div><div className="stat-card__label">Khoá học</div><div className="stat-card__value">{data.courses.length}</div></div>
            <div className="stat-card"><div className="stat-card__icon">🎓</div><div className="stat-card__label">Học viên</div><div className="stat-card__value">{data.reportSummary.activeLearners}</div></div>
            <div className="stat-card"><div className="stat-card__icon">🏅</div><div className="stat-card__label">Chứng chỉ</div><div className="stat-card__value">{data.reportSummary.totalCertificates}</div></div>
          </div>

          <div className="card">
            <h3 className="card__title" style={{ marginBottom: 10 }}>Khoá học gần đây</h3>
            {data.courses.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="card card--hoverable"
                style={{ marginBottom: 8 }}
                onClick={() => openBuilderForCourse(course.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{course.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && <div>
        <div className="admin-toolbar"><h3 className="admin-toolbar__title">Danh sách người dùng ({data.users.length})</h3><button className="btn btn--primary" onClick={() => setShowUserModal(true)}>+ Thêm người dùng</button></div>
        <div className="table-wrapper"><table className="table"><thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Phòng ban</th><th /></tr></thead><tbody>{data.users.map((userItem) => <tr key={userItem.id}><td><strong>{userItem.name}</strong></td><td className="table__email">{userItem.email}</td><td><span className="badge badge--info">{data.roleLabels[userItem.role]}</span></td><td>{userItem.department}</td><td><button className="btn btn--ghost btn--sm" onClick={() => showToast('✏️ Sửa user (mock)')}>✏️</button></td></tr>)}</tbody></table></div>
      </div>}

      {tab === 'courses' && (
        <CourseManagementSection
          courses={data.courses}
          onOpenCourse={openBuilderForCourse}
          onOpenBuilder={openBuilderForCourse}
          onOpenCreateCourse={() => setShowCourseModal(true)}
        />
      )}

      {tab === 'reports' && <div>
        <div className="card" style={{ marginBottom: 16 }}><h3 className="card__title">Tiến độ khoá học</h3>{data.courseProgressReport.map((course) => { const percent = course.enrolled ? Math.round((course.completed / course.enrolled) * 100) : 0; return <div key={course.courseId} className="chart-bar-row"><div className="chart-bar-label">{course.courseName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{ width: `${percent}%` }} /></div><div className="chart-bar-value">{percent}%</div></div>; })}</div>
        <div className="card" style={{ marginBottom: 16 }}><h3 className="card__title">Kết quả Quiz</h3>{data.quizResults.map((quiz) => <div key={quiz.quizId} className="chart-bar-row"><div className="chart-bar-label">{quiz.quizName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{ width: `${quiz.passRate}%` }} /></div><div className="chart-bar-value">{quiz.passRate}%</div></div>)}</div>
      </div>}

      {tab === 'certificates' && <div className="table-wrapper"><table className="table"><thead><tr><th>Học viên</th><th>Khoá học</th><th>Ngày</th><th>Điểm</th><th>Mã</th></tr></thead><tbody><tr><td>Nguyễn Văn An</td><td>An toàn thông tin</td><td>10/05/2026</td><td><span className="badge badge--success">88</span></td><td>SL-CERT-0001</td></tr><tr><td>Vũ Minh Tuấn</td><td>Kỹ năng giao tiếp</td><td>25/04/2026</td><td><span className="badge badge--success">92</span></td><td>SL-CERT-0002</td></tr></tbody></table></div>}

      {tab === 'audit' && <div className="table-wrapper"><table className="table"><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Đối tượng</th></tr></thead><tbody>{data.auditLogs.map((log) => <tr key={log.id}><td className="table__date">{new Date(log.timestamp).toLocaleString('vi-VN')}</td><td>{log.userName}</td><td>{log.action}</td><td className="table__email">{log.target}</td></tr>)}</tbody></table></div>}

      {tab === 'settings' && <div><div className="card"><h4 className="card__title">🔧 Cấu hình chung</h4><button className="btn btn--primary btn--full" onClick={() => showToast('✅ Đã lưu (mock)')}>💾 Lưu</button></div></div>}

      <Modal open={showUserModal} onClose={() => setShowUserModal(false)}>
        <AddUserForm onClose={() => setShowUserModal(false)} onSubmit={handleCreateUser} />
      </Modal>
      <Modal open={showCourseModal} onClose={() => setShowCourseModal(false)}>
        <AddCourseForm onClose={() => setShowCourseModal(false)} onSubmit={handleCreateCourse} />
      </Modal>
      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
