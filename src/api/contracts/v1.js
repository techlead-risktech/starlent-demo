export const API_V1 = {
  auth: {
    login: '/auth/login',
    me: '/me',
  },
  learner: {
    home: '/learner/home',
    courses: '/learner/courses',
    notifications: '/learner/notifications',
    chats: '/learner/chats',
    profile: '/learner/profile',
    certificates: '/learner/certificates',
    leaderboard: '/learner/leaderboard',
    offline: '/learner/offline',
    offlineSync: '/learner/offline/sync',
    settings: '/learner/settings',
    dataSync: '/learner/data/sync',
  },
  courses: {
    detail: (courseId) => `/courses/${courseId}`,
    explore: '/explore/courses',
    search: '/search/courses',
  },
  learning: {
    completeItem: '/learning/complete-item',
    saveQuizAttempt: '/learning/quiz-attempt',
    saveCardReview: '/learning/card-review',
  },
  chats: {
    detail: (convId) => `/learner/chats/${convId}`,
    sendMessage: (convId) => `/learner/chats/${convId}/messages`,
  },
  certificates: {
    detail: (certId) => `/learner/certificates/${certId}`,
  },
  manager: {
    dashboard: '/manager/dashboard',
    assignCourse: '/manager/assignments',
    sendReminder: '/manager/reminders',
    department: '/manager/department',
    departmentReminder: '/manager/department/reminders',
  },
  admin: {
    dashboard: '/admin/dashboard',
    createUser: '/admin/users',
    createCourse: '/admin/courses',
    assignCourse: '/admin/assignments',
    createTenant: '/admin/tenants',
    updateTenant: (tenantId) => `/admin/tenants/${tenantId}`,
  },
  trainer: {
    dashboard: '/trainer/dashboard',
  },
  editor: {
    dashboard: '/editor/dashboard',
    createCourse: '/editor/courses',
    togglePublish: (courseId) => `/editor/courses/${courseId}/publish`,
    assignCourse: '/editor/assignments',
    contentCatalog: '/editor/content-catalog',
    contentCatalogByType: (type) => `/editor/content-catalog/${type}`,
    contentDetail: (type, contentId) => `/editor/content-catalog/${type}/${contentId}`,
    courseStructure: (courseId) => `/editor/courses/${courseId}/structure`,
    addModule: (courseId) => `/editor/courses/${courseId}/modules`,
    addItem: (courseId, moduleId) => `/editor/courses/${courseId}/modules/${moduleId}/items`,
  },
  courseManagement: {
    dashboard: {
      admin: '/admin/dashboard',
      editor: '/editor/dashboard',
    },
    createCourse: {
      admin: '/admin/courses',
      editor: '/editor/courses',
    },
    // Reuse editor endpoints for builder actions so API contract stays stable.
    togglePublish: (courseId) => `/editor/courses/${courseId}/publish`,
    contentCatalog: '/editor/content-catalog',
    contentCatalogByType: (type) => `/editor/content-catalog/${type}`,
    contentDetail: (type, contentId) => `/editor/content-catalog/${type}/${contentId}`,
    courseStructure: (courseId) => `/editor/courses/${courseId}/structure`,
    addModule: (courseId) => `/editor/courses/${courseId}/modules`,
    addItem: (courseId, moduleId) => `/editor/courses/${courseId}/modules/${moduleId}/items`,
    updateCourse: (courseId) => `/editor/courses/${courseId}`,
    deleteCourse: (courseId) => `/editor/courses/${courseId}`,
    updateModule: (courseId, moduleId) => `/editor/courses/${courseId}/modules/${moduleId}`,
    deleteModule: (courseId, moduleId) => `/editor/courses/${courseId}/modules/${moduleId}`,
    reorderModules: (courseId) => `/editor/courses/${courseId}/modules/reorder`,
    updateItem: (courseId, moduleId, itemId) => `/editor/courses/${courseId}/modules/${moduleId}/items/${itemId}`,
    deleteItem: (courseId, moduleId, itemId) => `/editor/courses/${courseId}/modules/${moduleId}/items/${itemId}`,
    reorderItems: (courseId, moduleId) => `/editor/courses/${courseId}/modules/${moduleId}/items/reorder`,
  },
  userManagement: {
    createUser: '/admin/users',
  },
  assignmentManagement: {
    learningManagerDashboard: '/manager/dashboard',
    assignCourse: '/manager/assignments',
    sendReminder: '/manager/reminders',
    departmentDashboard: '/manager/department',
    departmentReminder: '/manager/department/reminders',
  },
  reporting: {
    trainerDashboard: '/trainer/dashboard',
    adminDashboard: '/admin/dashboard',
  },
};

export const ERROR_CODES = {
  authInvalidCredentials: 'AUTH_INVALID_CREDENTIALS',
  authUnauthorized: 'AUTH_UNAUTHORIZED',
  validationFailed: 'VALIDATION_FAILED',
};
