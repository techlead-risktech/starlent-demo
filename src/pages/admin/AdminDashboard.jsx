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
import { useI18n } from '../../i18n/index.jsx';

const STATE_SYNC_EVENT = 'starlent:state-sync';
const STATE_SYNC_KEY = 'starlent_state_sync_v1';

const ROLES = [
  { value: 'learner', labelKey: 'learnerPages.adminPages.roleLearner' },
  { value: 'trainer', labelKey: 'learnerPages.adminPages.roleTrainer' },
  { value: 'editor', labelKey: 'learnerPages.adminPages.roleEditor' },
  { value: 'learning_manager', labelKey: 'learnerPages.adminPages.roleLearningManager' },
  { value: 'dept_manager', labelKey: 'learnerPages.adminPages.roleDeptManager' },
  { value: 'admin', labelKey: 'learnerPages.adminPages.roleAdmin' },
];

const DEPARTMENT_KEYS = [
  'learnerPages.adminPages.deptIt',
  'learnerPages.adminPages.deptHr',
  'learnerPages.adminPages.deptSales',
  'learnerPages.adminPages.deptMarketing',
  'learnerPages.adminPages.deptFinance',
  'learnerPages.adminPages.deptOps',
];

function f(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)), template);
}

// eslint-disable-next-line react/prop-types
function AddUserForm({ onClose, onSubmit }) {
  const { t } = useI18n();
  const roles = ROLES.map((role) => ({ value: role.value, label: t(role.labelKey) }));
  const departments = DEPARTMENT_KEYS.map((key) => ({ value: t(key), label: t(key) }));
  const [form, setForm] = useState({ name: '', email: '', role: 'learner', department: '', password: '' });
  const change = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="admin-form">
      <h3 className="admin-form__title">➕ {t('learnerPages.adminPages.addUserTitle')}</h3>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.fullName')} *</label><input className="input" value={form.name} onChange={change('name')} required /></div>
        <div className="input-group"><label className="input-label">Email *</label><input className="input" type="email" value={form.email} onChange={change('email')} required /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.roleLabel')}</label><Dropdown value={form.role} options={roles} onChange={(value) => setForm((prev) => ({ ...prev, role: value }))} /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.department')}</label><Dropdown value={form.department} options={departments} onChange={(value) => setForm((prev) => ({ ...prev, department: value }))} placeholder={t('learnerPages.adminPages.selectDepartment')} /></div>
        <div className="input-group admin-form__full"><label className="input-label">{t('learnerPages.adminPages.password')} *</label><input className="input" type="password" value={form.password} onChange={change('password')} minLength={6} required /></div>
      </div>
      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>{t('learnerPages.adminPages.cancel')}</button>
        <button type="submit" className="btn btn--primary">✅ {t('learnerPages.adminPages.createAccount')}</button>
      </div>
    </form>
  );
}

function TenantForm({ initialValue, onClose, onSubmit }) {
  const { t } = useI18n();
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
      <h3 className="admin-form__title">{initialValue?.id ? `✏️ ${t('learnerPages.adminPages.tenantUpdate')}` : `➕ ${t('learnerPages.adminPages.tenantCreate')}`}</h3>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.tenantName')} *</label><input className="input" value={form.name} onChange={change('name')} required /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.domain')} *</label><input className="input" value={form.domain} onChange={change('domain')} placeholder="academy.example.com" required /></div>
        <div className="input-group admin-form__full"><label className="input-label">{t('learnerPages.adminPages.logoUrl')}</label><input className="input" value={form.logoUrl} onChange={change('logoUrl')} placeholder="https://..." /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.status')}</label><Dropdown value={form.status} options={[{ value: 'active', label: t('learnerPages.adminPages.statusActive') }, { value: 'draft', label: t('learnerPages.adminPages.statusDraft') }, { value: 'archived', label: t('learnerPages.adminPages.statusArchived') }]} onChange={(value) => setForm((prev) => ({ ...prev, status: value }))} /></div>
      </div>

      <h4 style={{ marginTop: 10, marginBottom: 8 }}>{t('learnerPages.adminPages.configTheme')}</h4>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.themePrimary')}</label><input className="input" type="color" value={form.theme.primaryColor} onChange={changeTheme('primaryColor')} /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.themeSecondary')}</label><input className="input" type="color" value={form.theme.secondaryColor} onChange={changeTheme('secondaryColor')} /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.themeBackground')}</label><input className="input" type="color" value={form.theme.backgroundColor} onChange={changeTheme('backgroundColor')} /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.themeText')}</label><input className="input" type="color" value={form.theme.textColor} onChange={changeTheme('textColor')} /></div>
      </div>

      <h4 style={{ marginTop: 10, marginBottom: 8 }}>{t('learnerPages.adminPages.configTypography')}</h4>
      <div className="admin-form__grid">
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.typographyFontFamily')}</label><input className="input" value={form.typography.fontFamily} onChange={changeTypography('fontFamily')} /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.typographyHeading')}</label><input className="input" value={form.typography.headingStyle} onChange={changeTypography('headingStyle')} /></div>
        <div className="input-group"><label className="input-label">{t('learnerPages.adminPages.typographyBody')}</label><input className="input" value={form.typography.bodyStyle} onChange={changeTypography('bodyStyle')} /></div>
      </div>

      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>{t('learnerPages.adminPages.cancel')}</button>
        <button type="submit" className="btn btn--primary">✅ {t('learnerPages.adminPages.saveTenant')}</button>
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
  const { t, locale } = useI18n();
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

  const adminTabs = [
    { key: 'overview', label: `📊 ${t('learnerPages.adminPages.tabsOverview')}` },
    { key: 'users', label: `👥 ${t('learnerPages.adminPages.tabsUsers')}` },
    { key: 'courses', label: `📚 ${t('learnerPages.adminPages.tabsCourses')}` },
    { key: 'distribution', label: `📤 ${t('learnerPages.adminPages.tabsDistribution')}` },
    { key: 'tenants', label: `🏢 ${t('learnerPages.adminPages.tabsTenants')}` },
    { key: 'reports', label: `📈 ${t('learnerPages.adminPages.tabsReports')}` },
    { key: 'certificates', label: `🎓 ${t('learnerPages.adminPages.tabsCertificates')}` },
    { key: 'audit', label: `📋 ${t('learnerPages.adminPages.tabsAudit')}` },
    { key: 'settings', label: `⚙️ ${t('learnerPages.adminPages.tabsSettings')}` },
  ];

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
      showToast(`✅ ${t('learnerPages.adminPages.toastCreateUserOk')}`);
    } catch (error) {
      showToast(error?.message || `❌ ${t('learnerPages.adminPages.toastCreateUserFail')}`);
    } finally {
      setShowUserModal(false);
    }
  };

  const handleCreateCourse = async (form) => {
    const { continueToBuilder = true, ...payload } = form;
    try {
      const response = await createCourseByScope('admin', payload);
      setData((prev) => ({ ...prev, courses: [...prev.courses, response.course] }));
      showToast(`✅ ${t('learnerPages.adminPages.toastCreateCourseOk')}`);
      if (continueToBuilder) openBuilderForCourse(response.course.id);
    } catch (error) {
      showToast(error?.message || `❌ ${t('learnerPages.adminPages.toastCreateCourseFail')}`);
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
        showToast(`✅ ${t('learnerPages.adminPages.toastUpdateTenantOk')}`);
      } else {
        const response = await createTenant(form);
        setData((prev) => ({ ...prev, tenants: [...prev.tenants, response.tenant] }));
        showToast(`✅ ${t('learnerPages.adminPages.toastCreateTenantOk')}`);
      }
      setShowTenantModal(false);
      setEditingTenant(null);
    } catch (error) {
      showToast(error?.message || `❌ ${t('learnerPages.adminPages.toastSaveTenantFail')}`);
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
    if (!assignmentForm.courseId) return showToast(`⚠️ ${t('learnerPages.adminPages.toastSelectCourse')}`);
    if (assignmentForm.scope === 'user' && !assignmentForm.userId) return showToast(`⚠️ ${t('learnerPages.adminPages.toastSelectLearner')}`);
    if (assignmentForm.scope === 'department' && !assignmentForm.department) return showToast(`⚠️ ${t('learnerPages.adminPages.toastSelectDept')}`);
    try {
      const response = await assignCourseByAdmin(assignmentForm);
      const created = Array.isArray(response.assignments) ? response.assignments : [];
      setData((prev) => ({ ...prev, assignments: [...created, ...(prev.assignments || [])] }));
      showToast(`✅ ${f(t('learnerPages.adminPages.toastAssignOk'), { count: created.length })}`);
    } catch (error) {
      showToast(error?.message || `❌ ${t('learnerPages.adminPages.toastAssignFail')}`);
    }
  };

  if (loading) return <AdminLayout title={t('learnerPages.adminPages.dashboardTitle')}><div className="skeleton skeleton-card" /></AdminLayout>;

  return (
    <AdminLayout title={t('learnerPages.adminPages.dashboardTitle')}>
      <div className="admin-header"><div><h2 className="admin-header__greeting">{f(t('learnerPages.adminPages.hello'), { name: user?.name || '' })}</h2><p className="admin-header__role">{t('learnerPages.adminPages.role')}</p></div></div>
      <div className="tabs">
        {adminTabs.map((item) => <button key={item.key} className={`tab${tab === item.key ? ' tab--active' : ''}`} onClick={() => changeTab(item.key)}>{item.label}</button>)}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <div className="stat-card"><div className="stat-card__icon">👥</div><div className="stat-card__label">{t('learnerPages.adminPages.overviewUsers')}</div><div className="stat-card__value">{data.users.length}</div></div>
            <div className="stat-card"><div className="stat-card__icon">📚</div><div className="stat-card__label">{t('learnerPages.adminPages.overviewCourses')}</div><div className="stat-card__value">{data.courses.length}</div></div>
            <div className="stat-card"><div className="stat-card__icon">🎓</div><div className="stat-card__label">{t('learnerPages.adminPages.overviewLearners')}</div><div className="stat-card__value">{data.reportSummary.activeLearners}</div></div>
            <div className="stat-card"><div className="stat-card__icon">🏅</div><div className="stat-card__label">{t('learnerPages.adminPages.overviewCertificates')}</div><div className="stat-card__value">{data.reportSummary.totalCertificates}</div></div>
          </div>

          <div className="card">
            <h3 className="card__title" style={{ marginBottom: 10 }}>{t('learnerPages.adminPages.recentCourses')}</h3>
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
        <div className="admin-toolbar"><h3 className="admin-toolbar__title">{f(t('learnerPages.adminPages.usersList'), { count: data.users.length })}</h3><button className="btn btn--primary" onClick={() => setShowUserModal(true)}>+ {t('learnerPages.adminPages.addUserBtn')}</button></div>
        <div className="table-wrapper"><table className="table"><thead><tr><th>{t('learnerPages.adminPages.fullName')}</th><th>{t('learnerPages.adminPages.email')}</th><th>{t('learnerPages.adminPages.roleLabel')}</th><th>{t('learnerPages.adminPages.department')}</th><th /></tr></thead><tbody>{data.users.map((userItem) => <tr key={userItem.id}><td><strong>{userItem.name}</strong></td><td className="table__email">{userItem.email}</td><td><span className="badge badge--info">{t(ROLES.find((r) => r.value === userItem.role)?.labelKey || '') || data.roleLabels[userItem.role]}</span></td><td>{userItem.department}</td><td><button className="btn btn--ghost btn--sm" onClick={() => showToast(`✏️ ${t('learnerPages.adminPages.editUserMock')}`)}>✏️</button></td></tr>)}</tbody></table></div>
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
            <h3 className="card__title" style={{ marginBottom: 12 }}>{t('learnerPages.adminPages.distributionTitle')}</h3>
            <div className="admin-form__grid">
              <div className="input-group">
                <label className="input-label">{t('learnerPages.adminPages.tabsCourses')}</label>
                <select className="input" value={assignmentForm.courseId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, courseId: event.target.value }))}>
                  {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">{t('learnerPages.adminPages.distributionType')}</label>
                <select className="input" value={assignmentForm.scope} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, scope: event.target.value }))}>
                  <option value="user">{t('learnerPages.adminPages.byLearner')}</option>
                  <option value="department">{t('learnerPages.adminPages.byDepartment')}</option>
                </select>
              </div>
              {assignmentForm.scope === 'user' ? (
                <div className="input-group">
                  <label className="input-label">{t('learnerPages.adminPages.learner')}</label>
                  <select className="input" value={assignmentForm.userId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, userId: event.target.value }))}>
                    {data.users.filter((item) => item.role === 'learner').map((item) => (
                      <option key={item.id} value={item.id}>{item.name} - {item.department}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="input-group">
                  <label className="input-label">{t('learnerPages.adminPages.department')}</label>
                  <select className="input" value={assignmentForm.department} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, department: event.target.value }))}>
                    {[...new Set(data.users.filter((item) => item.role === 'learner').map((item) => item.department).filter(Boolean))].map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="input-group">
                <label className="input-label">{t('learnerPages.adminPages.dueDate')}</label>
                <input className="input" type="date" value={assignmentForm.dueDate} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 }}>
              <input type="checkbox" checked={assignmentForm.required} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, required: event.target.checked }))} />
              {t('learnerPages.adminPages.requiredComplete')}
            </label>
            <div>
              <button className="btn btn--primary" onClick={handleAssignCourse}>📤 {t('learnerPages.adminPages.distribute')}</button>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title" style={{ marginBottom: 12 }}>{f(t('learnerPages.adminPages.distributionHistory'), { count: (data.assignments || []).length })}</h3>
            {(data.assignments || []).slice(0, 20).map((assignment) => (
              <div key={assignment.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 700 }}>{assignment.courseName}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {assignment.userName} · {t('learnerPages.adminPages.dueDate')}: {assignment.dueDate || t('learnerPages.adminPages.noDeadline')} · {assignment.required ? t('learnerPages.adminPages.requiredComplete') : t('learnerPages.adminPages.optional')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tenants' && (
        <div>
          <div className="admin-toolbar">
            <h3 className="admin-toolbar__title">{f(t('learnerPages.adminPages.tenantMgmt'), { count: data.tenants.length })}</h3>
            <button className="btn btn--primary" onClick={() => { setEditingTenant(null); setShowTenantModal(true); }}>+ {t('learnerPages.adminPages.createTenantBtn')}</button>
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
                  <span className={`badge ${tenant.status === 'active' ? 'badge--success' : (tenant.status === 'draft' ? 'badge--warning' : 'badge--neutral')}`}>
                    {tenant.status === 'active' ? t('learnerPages.adminPages.statusActive') : tenant.status === 'draft' ? t('learnerPages.adminPages.statusDraft') : t('learnerPages.adminPages.statusArchived')}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginBottom: 10 }}>
                  {[tenant.theme?.primaryColor, tenant.theme?.secondaryColor, tenant.theme?.backgroundColor, tenant.theme?.textColor].map((color, idx) => (
                    <div key={`${tenant.id}_color_${idx}`} style={{ height: 24, borderRadius: 8, background: color || '#E2E8F0', border: '1px solid var(--color-border)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
                  {t('learnerPages.adminPages.typographyFontFamily')}: {tenant.typography?.fontFamily} · {t('learnerPages.adminPages.typographyHeading')}: {tenant.typography?.headingStyle} · {t('learnerPages.adminPages.typographyBody')}: {tenant.typography?.bodyStyle}
                </div>
                <button className="btn btn--secondary btn--sm" onClick={() => { setEditingTenant(tenant); setShowTenantModal(true); }}>✏️ {t('learnerPages.adminPages.editTenant')}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reports' && <div>
        <div className="card" style={{ marginBottom: 16 }}><h3 className="card__title">{t('learnerPages.adminPages.reportsCourseProgress')}</h3>{data.courseProgressReport.map((course) => { const percent = course.enrolled ? Math.round((course.completed / course.enrolled) * 100) : 0; return <div key={course.courseId} className="chart-bar-row"><div className="chart-bar-label">{course.courseName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{ width: `${percent}%` }} /></div><div className="chart-bar-value">{percent}%</div></div>; })}</div>
        <div className="card" style={{ marginBottom: 16 }}><h3 className="card__title">{t('learnerPages.adminPages.reportsQuizResult')}</h3>{data.quizResults.map((quiz) => <div key={quiz.quizId} className="chart-bar-row"><div className="chart-bar-label">{quiz.quizName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{ width: `${quiz.passRate}%` }} /></div><div className="chart-bar-value">{quiz.passRate}%</div></div>)}</div>
      </div>}

      {tab === 'certificates' && <div className="table-wrapper"><table className="table"><thead><tr><th>{t('learnerPages.adminPages.certLearner')}</th><th>{t('learnerPages.adminPages.certCourse')}</th><th>{t('learnerPages.adminPages.certDate')}</th><th>{t('learnerPages.adminPages.certScore')}</th><th>{t('learnerPages.adminPages.certCode')}</th></tr></thead><tbody><tr><td>Nguyễn Văn An</td><td>An toàn thông tin</td><td>10/05/2026</td><td><span className="badge badge--success">88</span></td><td>SL-CERT-0001</td></tr><tr><td>Vũ Minh Tuấn</td><td>Kỹ năng giao tiếp</td><td>25/04/2026</td><td><span className="badge badge--success">92</span></td><td>SL-CERT-0002</td></tr></tbody></table></div>}

      {tab === 'audit' && <div className="table-wrapper"><table className="table"><thead><tr><th>{t('learnerPages.adminPages.auditTime')}</th><th>{t('learnerPages.adminPages.auditUser')}</th><th>{t('learnerPages.adminPages.auditAction')}</th><th>{t('learnerPages.adminPages.auditTarget')}</th></tr></thead><tbody>{data.auditLogs.map((log) => <tr key={log.id}><td className="table__date">{new Date(log.timestamp).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}</td><td>{log.userName}</td><td>{log.action}</td><td className="table__email">{log.target}</td></tr>)}</tbody></table></div>}

      {tab === 'settings' && <div><div className="card"><h4 className="card__title">🔧 {t('learnerPages.adminPages.settingsGeneral')}</h4><button className="btn btn--primary btn--full" onClick={() => showToast(`✅ ${t('learnerPages.adminPages.savedMock')}`)}>💾 {t('learnerPages.adminPages.save')}</button></div></div>}

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



