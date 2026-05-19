/**
 * Mock Users — Tài khoản demo cho tất cả các vai trò
 * Vai trò: learner, trainer, editor, learning_manager, dept_manager, admin
 */

export const ROLES = {
  LEARNER: 'learner',
  TRAINER: 'trainer',
  EDITOR: 'editor',
  LEARNING_MANAGER: 'learning_manager',
  DEPT_MANAGER: 'dept_manager',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  learner: 'Học viên',
  trainer: 'Giảng viên',
  editor: 'Biên tập nội dung',
  learning_manager: 'Quản lý đào tạo',
  dept_manager: 'Quản lý phòng ban',
  admin: 'Quản trị hệ thống',
};

export const ROLE_ROUTES = {
  learner: '/learner/dashboard',
  trainer: '/trainer/dashboard',
  editor: '/editor/dashboard',
  learning_manager: '/manager/dashboard',
  dept_manager: '/manager/department',
  admin: '/admin/dashboard',
};

export const users = [
  {
    id: 'u1', email: 'learner@starlent.demo', password: '123456',
    name: 'Nguyễn Văn An', role: ROLES.LEARNER, avatar: null,
    department: 'Kỹ thuật', streak: 7, xp: 2450, level: 5, joinedAt: '2026-01-15',
  },
  {
    id: 'u2', email: 'trainer@starlent.demo', password: '123456',
    name: 'Trần Thị Minh', role: ROLES.TRAINER, avatar: null,
    department: 'Đào tạo', streak: 0, xp: 0, level: 0, joinedAt: '2025-06-01',
  },
  {
    id: 'u3', email: 'editor@starlent.demo', password: '123456',
    name: 'Lê Văn Bình', role: ROLES.EDITOR, avatar: null,
    department: 'Nội dung', streak: 0, xp: 0, level: 0, joinedAt: '2025-08-12',
  },
  {
    id: 'u4', email: 'learning.manager@starlent.demo', password: '123456',
    name: 'Phạm Thị Hương', role: ROLES.LEARNING_MANAGER, avatar: null,
    department: 'Đào tạo', streak: 0, xp: 0, level: 0, joinedAt: '2025-03-20',
  },
  {
    id: 'u5', email: 'dept.manager@starlent.demo', password: '123456',
    name: 'Hoàng Văn Dũng', role: ROLES.DEPT_MANAGER, avatar: null,
    department: 'Kỹ thuật', streak: 0, xp: 0, level: 0, joinedAt: '2025-05-10',
  },
  {
    id: 'u6', email: 'admin@starlent.demo', password: '123456',
    name: 'Admin Starlent', role: ROLES.ADMIN, avatar: null,
    department: 'IT', streak: 0, xp: 0, level: 0, joinedAt: '2025-01-01',
  },
  {
    id: 'u7', email: 'learner2@starlent.demo', password: '123456',
    name: 'Đỗ Thị Lan', role: ROLES.LEARNER, avatar: null,
    department: 'Kỹ thuật', streak: 3, xp: 1200, level: 3, joinedAt: '2026-02-10',
  },
  {
    id: 'u8', email: 'learner3@starlent.demo', password: '123456',
    name: 'Vũ Minh Tuấn', role: ROLES.LEARNER, avatar: null,
    department: 'Kinh doanh', streak: 12, xp: 3800, level: 7, joinedAt: '2025-11-01',
  },
  {
    id: 'u9', email: 'learner4@starlent.demo', password: '123456',
    name: 'Ngô Thị Hạnh', role: ROLES.LEARNER, avatar: null,
    department: 'Marketing', streak: 1, xp: 450, level: 1, joinedAt: '2026-04-01',
  },
];
