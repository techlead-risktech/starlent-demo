/**
 * Mock Reports — Dữ liệu báo cáo cho các vai trò quản lý
 */

export const reportSummary = {
  activeLearners: 87, activeLearnersChange: 12,
  completionRate: 76, completionRateChange: 5,
  overdueCourses: 23, overdueCoursesChange: -3,
  averageScore: 82, averageScoreChange: 2,
  totalCertificates: 45, chatResponseSLA: 94,
};

export const progressByDepartment = [
  { department:'Kỹ thuật', completionRate:82, activeLearners:28 },
  { department:'Kinh doanh', completionRate:75, activeLearners:22 },
  { department:'Marketing', completionRate:68, activeLearners:15 },
  { department:'Nhân sự', completionRate:79, activeLearners:10 },
  { department:'Tài chính', completionRate:71, activeLearners:8 },
  { department:'Vận hành', completionRate:65, activeLearners:4 },
];

export const courseProgressReport = [
  { courseId:'c1', courseName:'Kỹ năng giao tiếp trong công việc', enrolled:65, completed:42, avgScore:85 },
  { courseId:'c2', courseName:'An toàn thông tin cơ bản', enrolled:80, completed:55, avgScore:78 },
  { courseId:'c3', courseName:'Quản lý thời gian hiệu quả', enrolled:45, completed:30, avgScore:82 },
  { courseId:'c4', courseName:'Làm việc nhóm và hợp tác', enrolled:38, completed:18, avgScore:80 },
];

export const quizResults = [
  { quizId:'qz1', quizName:'Nguyên tắc giao tiếp', passRate:85, avgAttempts:1.4 },
  { quizId:'qz2', quizName:'Bài KT cuối khoá: Giao tiếp', passRate:72, avgAttempts:2.1 },
  { quizId:'qz3', quizName:'Phòng chống tấn công', passRate:90, avgAttempts:1.2 },
  { quizId:'qz4', quizName:'Công cụ quản lý thời gian', passRate:78, avgAttempts:1.6 },
  { quizId:'qz5', quizName:'Giao tiếp nhóm', passRate:80, avgAttempts:1.5 },
  { quizId:'qz6', quizName:'Bài KT cuối khoá: Teamwork', passRate:68, avgAttempts:2.3 },
];

export const weakTopics = [
  { topic:'Xử lý khách hàng khó tính', failRate:35, relatedCourse:'Kỹ năng giao tiếp' },
  { topic:'Kỹ năng thuyết trình', failRate:28, relatedCourse:'Kỹ năng giao tiếp' },
  { topic:'Giải quyết xung đột nhóm', failRate:32, relatedCourse:'Làm việc nhóm và hợp tác' },
  { topic:'Nhận diện phishing nâng cao', failRate:25, relatedCourse:'An toàn thông tin cơ bản' },
  { topic:'Kỹ thuật Pomodoro', failRate:18, relatedCourse:'Quản lý thời gian' },
];

export const learnerProgressDetail = [
  { userId:'u1', userName:'Nguyễn Văn An', department:'Kỹ thuật', coursesEnrolled:4, coursesCompleted:2, avgScore:84, streak:7, lastActive:'2026-05-18' },
  { userId:'u7', userName:'Đỗ Thị Lan', department:'Kỹ thuật', coursesEnrolled:3, coursesCompleted:1, avgScore:78, streak:3, lastActive:'2026-05-17' },
  { userId:'u8', userName:'Vũ Minh Tuấn', department:'Kinh doanh', coursesEnrolled:4, coursesCompleted:3, avgScore:92, streak:12, lastActive:'2026-05-18' },
  { userId:'u9', userName:'Ngô Thị Hạnh', department:'Marketing', coursesEnrolled:2, coursesCompleted:0, avgScore:65, streak:1, lastActive:'2026-05-16' },
];

export const auditLogs = [
  { id:'log1', userId:'u6', userName:'Admin Starlent', action:'Cập nhật vai trò người dùng', target:'u4', timestamp:'2026-05-18T08:30:00' },
  { id:'log2', userId:'u3', userName:'Lê Văn Bình', action:'Xuất bản khoá học', target:'c4', timestamp:'2026-05-17T16:45:00' },
  { id:'log3', userId:'u4', userName:'Phạm Thị Hương', action:'Gán khoá học cho học viên', target:'u1-c1', timestamp:'2026-05-17T14:20:00' },
  { id:'log4', userId:'u6', userName:'Admin Starlent', action:'Tạo tài khoản mới', target:'u9', timestamp:'2026-05-17T10:00:00' },
  { id:'log5', userId:'u5', userName:'Hoàng Văn Dũng', action:'Gửi nhắc nhở học tập', target:'Phòng Kỹ thuật', timestamp:'2026-05-17T09:15:00' },
];
