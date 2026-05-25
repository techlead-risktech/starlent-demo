import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
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
import { tenants as fallbackTenants } from '../../data/mockTenants.js';
import { createUser } from '../../api/services/userManagement.js';
import { createCourseByScope } from '../../api/services/courseManagement.js';
import { getAdminReportingDashboard } from '../../api/services/reporting.js';
import { createTenant, updateTenant } from '../../api/services/tenantManagement.js';
import { assignCourseByAdmin } from '../../api/services/distributionManagement.js';

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

// eslint-disable-next-line react/prop-types
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

function TenantForm({ initialValue, onClose, onSubmit }) {
  const [form, setForm] = useState(initialValue || {
    name: '',
    domain: '',
    logoUrl: '',
    status: 'active',
    theme: {
      primaryColor: '#14B8A6',
      secondaryColor: '#0F766E',
      backgroundColor: '#F8FAFC',
      textColor: '#0F172A',
    },
    typography: {
      fontFamily: 'Inter',
      headingStyle: 'Semi Bold',
      bodyStyle: 'Regular',
    },
  });

  const change = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  const changeTheme = (field) => (event) => setForm((prev) => ({ ...prev, theme: { ...prev.theme, [field]: event.target.value } }));
  const changeTypography = (field) => (event) => setForm((prev) => ({ ...prev, typography: { ...prev.typography, [field]: event.target.value } }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="admin-form">
      <h3 className="admin-form__title">{initialValue?.id ? '✏️ Cập nhật tenant' : '➕ Tạo tenant mới'}</h3>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">Tên tenant *</label><input className="input" value={form.name} onChange={change('name')} required /></div>
        <div className="input-group"><label className="input-label">Domain *</label><input className="input" value={form.domain} onChange={change('domain')} placeholder="academy.example.com" required /></div>
        <div className="input-group admin-form__full"><label className="input-label">Logo URL (mock upload)</label><input className="input" value={form.logoUrl} onChange={change('logoUrl')} placeholder="https://..." /></div>
        <div className="input-group"><label className="input-label">Trạng thái</label><Dropdown value={form.status} options={[{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Archived' }]} onChange={(value) => setForm((prev) => ({ ...prev, status: value }))} /></div>
      </div>

      <h4 style={{ marginTop: 10, marginBottom: 8 }}>Theme</h4>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">Primary</label><input className="input" type="color" value={form.theme.primaryColor} onChange={changeTheme('primaryColor')} /></div>
        <div className="input-group"><label className="input-label">Secondary</label><input className="input" type="color" value={form.theme.secondaryColor} onChange={changeTheme('secondaryColor')} /></div>
        <div className="input-group"><label className="input-label">Background</label><input className="input" type="color" value={form.theme.backgroundColor} onChange={changeTheme('backgroundColor')} /></div>
        <div className="input-group"><label className="input-label">Text</label><input className="input" type="color" value={form.theme.textColor} onChange={changeTheme('textColor')} /></div>
      </div>

      <h4 style={{ marginTop: 10, marginBottom: 8 }}>Typography</h4>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">Font family</label><input className="input" value={form.typography.fontFamily} onChange={changeTypography('fontFamily')} /></div>
        <div className="input-group"><label className="input-label">Heading style</label><input className="input" value={form.typography.headingStyle} onChange={changeTypography('headingStyle')} /></div>
        <div className="input-group"><label className="input-label">Body style</label><input className="input" value={form.typography.bodyStyle} onChange={changeTypography('bodyStyle')} /></div>
      </div>

      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>Huỷ</button>
        <button type="submit" className="btn btn--primary">✅ Lưu tenant</button>
      </div>
    </form>
  );
}

TenantForm.propTypes = {
  initialValue: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    domain: PropTypes.string,
    logoUrl: PropTypes.string,
    status: PropTypes.string,
    theme: PropTypes.shape({
      primaryColor: PropTypes.string,
      secondaryColor: PropTypes.string,
      backgroundColor: PropTypes.string,
      textColor: PropTypes.string,
    }),
    typography: PropTypes.shape({
      fontFamily: PropTypes.string,
      headingStyle: PropTypes.string,
      bodyStyle: PropTypes.string,
    }),
  }),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

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
    assignments: [],
    tenants: fallbackTenants,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    scope: 'user',
    userId: '',
    department: '',
    dueDate: '',
    required: true,
  });
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
          assignments: response.assignments || [],
          tenants: response.tenants || fallbackTenants,
        });
      } catch {
        // keep fallback
      } finally {
        if (mounted) setLoading(false);
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

  const handleSaveTenant = async (form) => {
    try {
      if (editingTenant?.id) {
        const response = await updateTenant(editingTenant.id, form);
        setData((prev) => ({
          ...prev,
          tenants: prev.tenants.map((tenant) => (tenant.id === editingTenant.id ? response.tenant : tenant)),
        }));
        showToast('✅ Đã cập nhật tenant');
      } else {
        const response = await createTenant(form);
        setData((prev) => ({ ...prev, tenants: [...prev.tenants, response.tenant] }));
        showToast('✅ Đã tạo tenant');
      }
      setShowTenantModal(false);
      setEditingTenant(null);
    } catch (error) {
      showToast(error?.message || '❌ Không thể lưu tenant');
    }
  };

  useEffect(() => {
    const learners = data.users.filter((item) => item.role === 'learner');
    if (!assignmentForm.courseId && data.courses[0]?.id) {
      setAssignmentForm((prev) => ({ ...prev, courseId: data.courses[0].id }));
    }
    if (!assignmentForm.userId && learners[0]?.id) {
      setAssignmentForm((prev) => ({ ...prev, userId: learners[0].id }));
    }
    if (!assignmentForm.department && learners[0]?.department) {
      setAssignmentForm((prev) => ({ ...prev, department: learners[0].department }));
    }
  }, [assignmentForm.courseId, assignmentForm.department, assignmentForm.userId, data.courses, data.users]);

  const handleAssignCourse = async () => {
    if (!assignmentForm.courseId) return showToast('⚠️ Vui lòng chọn khoá học');
    if (assignmentForm.scope === 'user' && !assignmentForm.userId) return showToast('⚠️ Vui lòng chọn học viên');
    if (assignmentForm.scope === 'department' && !assignmentForm.department) return showToast('⚠️ Vui lòng chọn phòng ban');
    try {
      const response = await assignCourseByAdmin(assignmentForm);
      const created = Array.isArray(response.assignments) ? response.assignments : [];
      setData((prev) => ({ ...prev, assignments: [...created, ...(prev.assignments || [])] }));
      showToast(`✅ Đã phân phối ${created.length} lượt gán`);
    } catch (error) {
      showToast(error?.message || '❌ Không thể phân phối khoá học');
    }
  };

  if (loading) return <AdminLayout title="Quản trị hệ thống"><div className="skeleton skeleton-card" /></AdminLayout>;

  return (
    <AdminLayout title="Quản trị hệ thống">
      <div className="admin-header"><div><h2 className="admin-header__greeting">Xin chào, {user?.name}</h2><p className="admin-header__role">Vai trò: Quản trị hệ thống</p></div></div>
      <div className="tabs">
        {[{ key: 'overview', label: '📊 Tổng quan' }, { key: 'users', label: '👥 Người dùng' }, { key: 'courses', label: '📚 Khoá học' }, { key: 'distribution', label: '📤 Phân phối' }, { key: 'tenants', label: '🏢 Tenant' }, { key: 'reports', label: '📈 Báo cáo' }, { key: 'certificates', label: '🎓 Chứng chỉ' }, { key: 'audit', label: '📋 Nhật ký' }, { key: 'settings', label: '⚙️ Cài đặt' }].map((item) => <button key={item.key} className={`tab${tab === item.key ? ' tab--active' : ''}`} onClick={() => changeTab(item.key)}>{item.label}</button>)}
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

      {tab === 'distribution' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card__title" style={{ marginBottom: 12 }}>Phân phối khoá học</h3>
            <div className="admin-form__grid">
              <div className="input-group">
                <label className="input-label">Khoá học</label>
                <select className="input" value={assignmentForm.courseId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, courseId: event.target.value }))}>
                  {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Kiểu phân phối</label>
                <select className="input" value={assignmentForm.scope} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, scope: event.target.value }))}>
                  <option value="user">Theo học viên</option>
                  <option value="department">Theo phòng ban</option>
                </select>
              </div>
              {assignmentForm.scope === 'user' ? (
                <div className="input-group">
                  <label className="input-label">Học viên</label>
                  <select className="input" value={assignmentForm.userId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, userId: event.target.value }))}>
                    {data.users.filter((item) => item.role === 'learner').map((item) => (
                      <option key={item.id} value={item.id}>{item.name} - {item.department}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="input-group">
                  <label className="input-label">Phòng ban</label>
                  <select className="input" value={assignmentForm.department} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, department: event.target.value }))}>
                    {[...new Set(data.users.filter((item) => item.role === 'learner').map((item) => item.department).filter(Boolean))].map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Hạn hoàn thành</label>
                <input className="input" type="date" value={assignmentForm.dueDate} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 }}>
              <input type="checkbox" checked={assignmentForm.required} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, required: event.target.checked }))} />
              Bắt buộc hoàn thành
            </label>
            <div>
              <button className="btn btn--primary" onClick={handleAssignCourse}>📤 Phân phối</button>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title" style={{ marginBottom: 12 }}>Lịch sử phân phối ({(data.assignments || []).length})</h3>
            {(data.assignments || []).slice(0, 20).map((assignment) => (
              <div key={assignment.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 700 }}>{assignment.courseName}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {assignment.userName} · Hạn: {assignment.dueDate || 'Không hạn'} · {assignment.required ? 'Bắt buộc' : 'Tự chọn'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tenants' && (
        <div>
          <div className="admin-toolbar">
            <h3 className="admin-toolbar__title">Quản lý tenant ({data.tenants.length})</h3>
            <button className="btn btn--primary" onClick={() => { setEditingTenant(null); setShowTenantModal(true); }}>+ Tạo tenant</button>
          </div>
          <div className="grid-2">
            {data.tenants.map((tenant) => (
              <div key={tenant.id} className="card">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <img src={tenant.logoUrl || 'https://dummyimage.com/64x64/e2e8f0/94a3b8&text=T'} alt={tenant.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{tenant.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{tenant.domain}</div>
                  </div>
                  <span className={`badge ${tenant.status === 'active' ? 'badge--success' : (tenant.status === 'draft' ? 'badge--warning' : 'badge--neutral')}`}>{tenant.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginBottom: 10 }}>
                  {[tenant.theme?.primaryColor, tenant.theme?.secondaryColor, tenant.theme?.backgroundColor, tenant.theme?.textColor].map((color, idx) => (
                    <div key={`${tenant.id}_color_${idx}`} style={{ height: 24, borderRadius: 8, background: color || '#E2E8F0', border: '1px solid var(--color-border)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
                  Font: {tenant.typography?.fontFamily} · Heading: {tenant.typography?.headingStyle} · Body: {tenant.typography?.bodyStyle}
                </div>
                <button className="btn btn--secondary btn--sm" onClick={() => { setEditingTenant(tenant); setShowTenantModal(true); }}>✏️ Chỉnh sửa</button>
              </div>
            ))}
          </div>
        </div>
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
      <Modal open={showTenantModal} onClose={() => { setShowTenantModal(false); setEditingTenant(null); }}>
        <TenantForm initialValue={editingTenant} onClose={() => { setShowTenantModal(false); setEditingTenant(null); }} onSubmit={handleSaveTenant} />
      </Modal>
      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}



