/**
 * Mock Courses — Khoá học mẫu
 * Mỗi khoá có modules, mỗi module chứa các learning items
 */

export const COURSE_STATUS = { DRAFT: 'draft', PUBLISHED: 'published', ARCHIVED: 'archived' };

export const MODULE_TYPE = {
  FLASHCARD: 'flashcard', VIDEO: 'video', AUDIO: 'audio',
  QUIZ_MC: 'quiz_mc', QUIZ_SEQUENCE: 'quiz_sequence', ROLEPLAY: 'roleplay',
};

export const courses = [
  {
    id: 'c1', title: 'Kỹ năng giao tiếp trong công việc',
    description: 'Học cách giao tiếp hiệu quả với đồng nghiệp, khách hàng và đối tác. Khoá học bao gồm các tình huống thực tế và bài tập nhập vai.',
    thumbnail: null, status: 'published',
    tags: ['Kỹ năng mềm', 'Giao tiếp'], duration: 120, moduleCount: 4, rating: 4.8,
    required: true, dueDate: '2026-06-15', createdAt: '2026-01-10',
    modules: [
      { id: 'm1', title: 'Nguyên tắc giao tiếp cơ bản', order: 1,
        items: [
          { id: 'i1', type: 'flashcard', title: 'Thuật ngữ giao tiếp', contentId: 'fc1' },
          { id: 'i2', type: 'video', title: 'Video: Lắng nghe chủ động', contentId: 'vd1' },
          { id: 'i3', type: 'quiz_mc', title: 'Kiểm tra: Nguyên tắc giao tiếp', contentId: 'qz1' },
        ]},
      { id: 'm2', title: 'Giao tiếp với khách hàng', order: 2, unlockedAfterModule: 'm1',
        items: [
          { id: 'i4', type: 'audio', title: 'Audio: Giọng nói và ngữ điệu', contentId: 'ad1' },
          { id: 'i5', type: 'roleplay', title: 'Nhập vai: Xử lý khách hàng khó tính', contentId: 'rp1' },
        ]},
      { id: 'm3', title: 'Giao tiếp nhóm và họp hành', order: 3, unlockedAfterModule: 'm2',
        items: [
          { id: 'i6', type: 'video', title: 'Video: Kỹ năng thuyết trình', contentId: 'vd2' },
          { id: 'i7', type: 'quiz_sequence', title: 'Sắp xếp: Quy trình họp hiệu quả', contentId: 'qs1' },
        ]},
      { id: 'm4', title: 'Tổng kết và đánh giá', order: 4, unlockedAfterModule: 'm3',
        items: [
          { id: 'i8', type: 'quiz_mc', title: 'Bài kiểm tra cuối khoá', contentId: 'qz2' },
          { id: 'i9', type: 'roleplay', title: 'Nhập vai: Tổng hợp tình huống', contentId: 'rp2' },
        ]},
    ],
  },
  {
    id: 'c2', title: 'An toàn thông tin cơ bản',
    description: 'Nắm vững các nguyên tắc bảo mật thông tin, nhận diện tấn công phishing và bảo vệ dữ liệu cá nhân trong môi trường số.',
    thumbnail: null, status: 'published',
    tags: ['Bảo mật', 'CNTT', 'Bắt buộc'], duration: 90, moduleCount: 3, rating: 4.6,
    required: true, dueDate: '2026-05-30', createdAt: '2026-02-01',
    modules: [
      { id: 'm5', title: 'Tổng quan về an toàn thông tin', order: 1,
        items: [
          { id: 'i10', type: 'flashcard', title: 'Thuật ngữ bảo mật', contentId: 'fc2' },
          { id: 'i11', type: 'video', title: 'Video: Các mối đe doạ phổ biến', contentId: 'vd3' },
        ]},
      { id: 'm6', title: 'Phòng chống tấn công mạng', order: 2, unlockedAfterModule: 'm5',
        items: [
          { id: 'i12', type: 'audio', title: 'Audio: Nhận diện phishing', contentId: 'ad2' },
          { id: 'i13', type: 'quiz_mc', title: 'Kiểm tra: Phòng chống tấn công', contentId: 'qz3' },
        ]},
      { id: 'm7', title: 'Thực hành bảo mật', order: 3, unlockedAfterModule: 'm6',
        items: [
          { id: 'i14', type: 'quiz_sequence', title: 'Sắp xếp: Quy trình xử lý sự cố', contentId: 'qs2' },
          { id: 'i15', type: 'roleplay', title: 'Nhập vai: Báo cáo sự cố bảo mật', contentId: 'rp3' },
        ]},
    ],
  },
  {
    id: 'c3', title: 'Quản lý thời gian hiệu quả',
    description: 'Làm chủ kỹ năng quản lý thời gian với phương pháp Pomodoro, Eisenhower Matrix và các công cụ lập kế hoạch.',
    thumbnail: null, status: 'published',
    tags: ['Kỹ năng mềm', 'Năng suất'], duration: 60, moduleCount: 3, rating: 4.5,
    required: false, dueDate: null, createdAt: '2026-03-05',
    modules: [
      { id: 'm8', title: 'Phân tích thói quen sử dụng thời gian', order: 1,
        items: [
          { id: 'i16', type: 'flashcard', title: 'Khái niệm quản lý thời gian', contentId: 'fc3' },
          { id: 'i17', type: 'video', title: 'Video: Ma trận Eisenhower', contentId: 'vd4' },
        ]},
      { id: 'm9', title: 'Công cụ và kỹ thuật', order: 2, unlockedAfterModule: 'm8',
        items: [
          { id: 'i18', type: 'audio', title: 'Audio: Kỹ thuật Pomodoro', contentId: 'ad3' },
          { id: 'i19', type: 'quiz_mc', title: 'Kiểm tra: Công cụ quản lý thời gian', contentId: 'qz4' },
        ]},
      { id: 'm10', title: 'Xây dựng thói quen', order: 3, unlockedAfterModule: 'm9',
        items: [
          { id: 'i20', type: 'roleplay', title: 'Nhập vai: Lập kế hoạch tuần', contentId: 'rp4' },
        ]},
    ],
  },
  {
    id: 'c4', title: 'Làm việc nhóm và hợp tác',
    description: 'Phát triển kỹ năng teamwork, giải quyết xung đột và xây dựng môi trường làm việc tích cực.',
    thumbnail: null, status: 'published',
    tags: ['Kỹ năng mềm', 'Teamwork'], duration: 100, moduleCount: 4, rating: 4.3,
    required: false, dueDate: null, createdAt: '2026-04-01',
    modules: [
      { id: 'm11', title: 'Nền tảng teamwork', order: 1,
        items: [
          { id: 'i21', type: 'flashcard', title: 'Vai trò trong nhóm', contentId: 'fc4' },
          { id: 'i22', type: 'video', title: 'Video: 5 giai đoạn phát triển nhóm', contentId: 'vd5' },
        ]},
      { id: 'm12', title: 'Giao tiếp trong nhóm', order: 2, unlockedAfterModule: 'm11',
        items: [
          { id: 'i23', type: 'audio', title: 'Audio: Phản hồi xây dựng', contentId: 'ad4' },
          { id: 'i24', type: 'quiz_mc', title: 'Kiểm tra: Giao tiếp nhóm', contentId: 'qz5' },
        ]},
      { id: 'm13', title: 'Giải quyết xung đột', order: 3, unlockedAfterModule: 'm12',
        items: [
          { id: 'i25', type: 'roleplay', title: 'Nhập vai: Hoà giải xung đột', contentId: 'rp5' },
          { id: 'i26', type: 'quiz_sequence', title: 'Sắp xếp: Các bước giải quyết xung đột', contentId: 'qs3' },
        ]},
      { id: 'm14', title: 'Đánh giá và cải tiến', order: 4, unlockedAfterModule: 'm13',
        items: [
          { id: 'i27', type: 'quiz_mc', title: 'Bài kiểm tra cuối khoá: Teamwork', contentId: 'qz6' },
        ]},
    ],
  },
];

/** Lấy danh sách module đã mở khoá dựa trên prerequisite */
export function getUnlockedModules(course, completedModuleIds = []) {
  if (!course || !course.modules) return [];
  const unlocked = [];
  for (let i = 0; i < course.modules.length; i++) {
    const mod = course.modules[i];
    if (i === 0) { unlocked.push(mod.id); }
    else if (completedModuleIds.includes(course.modules[i - 1].id)) { unlocked.push(mod.id); }
  }
  return unlocked;
}

/** Tính phần trăm hoàn thành khoá học */
export function getCourseProgress(course, completedItemIds = []) {
  if (!course || !course.modules) return 0;
  const totalItems = course.modules.reduce((sum, m) => sum + m.items.length, 0);
  if (totalItems === 0) return 0;
  // Hỗ trợ cả itemId (i1) và contentId (fc1) để tương thích dữ liệu cũ
  const completed = course.modules.reduce(
    (sum, m) => sum + m.items.filter((item) => completedItemIds.includes(item.id) || completedItemIds.includes(item.contentId)).length, 0
  );
  return Math.round((completed / totalItems) * 100);
}
