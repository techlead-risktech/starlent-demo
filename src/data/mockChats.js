/**
 * Mock Chats — Hội thoại và thông báo
 */

export const conversations = [
  {
    id:'conv1', participants:['u1','u2'], groupName:null, type:'direct',
    messages:[
      { id:'msg1', senderId:'u1', text:'Chào cô Minh, em có câu hỏi về kỹ thuật mirroring ạ.', timestamp:'2026-05-18T08:30', type:'text' },
      { id:'msg2', senderId:'u2', text:'Chào An, mirroring là kỹ thuật lặp lại từ khoá hoặc cử chỉ của đối phương để tạo đồng cảm. Em muốn hỏi phần nào?', timestamp:'2026-05-18T08:32', type:'text' },
      { id:'msg3', senderId:'u1', text:'Làm sao để mirroring tự nhiên mà không giống đang bắt chước ạ?', timestamp:'2026-05-18T08:33', type:'text' },
      { id:'msg4', senderId:'u2', text:'Đợi vài giây rồi mới lặp lại, chỉ lặp 1-2 từ khoá, kết hợp ngôn ngữ cơ thể phù hợp.', timestamp:'2026-05-18T08:35', type:'text' },
      { id:'msg5', senderId:'u2', text:'Đây là tài liệu cho em:', timestamp:'2026-05-18T08:36', type:'text' },
      { id:'msg6', senderId:'u2', text:null, timestamp:'2026-05-18T08:36', type:'file', fileName:'ky-thuat-mirroring.pdf', fileSize:'1.2MB' },
      { id:'msg7', senderId:'u1', text:'Dạ em cảm ơn cô ạ!', timestamp:'2026-05-18T08:37', type:'text' },
      { id:'msg8', senderId:'u2', text:null, timestamp:'2026-05-18T08:38', type:'voice', duration:32 },
    ], unread:0, resolved:false, pinnedMaterials:[],
  },
  {
    id:'conv2', participants:['u1','u7','u8','u2'], groupName:'Nhóm học Kỹ năng giao tiếp', type:'group',
    messages:[
      { id:'gmsg1', senderId:'u8', text:'Tuần này mình cùng thảo luận phần giao tiếp với khách hàng nhé!', timestamp:'2026-05-17T14:00', type:'text' },
      { id:'gmsg2', senderId:'u1', text:'Phần role-play hay quá, thực tế lắm.', timestamp:'2026-05-17T14:05', type:'text' },
      { id:'gmsg3', senderId:'u7', text:'Mình vừa hoàn thành bài role-play hôm qua.', timestamp:'2026-05-17T14:10', type:'text' },
      { id:'gmsg4', senderId:'u2', text:'Rất tốt các em. Cô ghim tài liệu quan trọng ở trên nhé.', timestamp:'2026-05-17T14:15', type:'text' },
    ], unread:3, resolved:false, pinnedMaterials:['Tài liệu: Xử lý khách hàng khó tính','Video mẫu về giao tiếp'],
  },
  {
    id:'conv3', participants:['u1','u2'], groupName:null, type:'direct',
    messages:[
      { id:'msg9', senderId:'u1', text:'Cô ơi, em muốn hỏi thêm về bài kiểm tra cuối khoá ạ.', timestamp:'2026-05-16T10:00', type:'text' },
      { id:'msg10', senderId:'u2', text:'Em cứ hỏi nhé, cô sẵn sàng giải đáp.', timestamp:'2026-05-16T10:02', type:'text' },
      { id:'msg11', senderId:'u1', text:'Câu hỏi về khoảng dừng trong thuyết trình, em chưa rõ ạ.', timestamp:'2026-05-16T10:03', type:'text' },
      { id:'msg12', senderId:'u2', text:'Khoảng dừng 3-5 giây sau ý chính giúp khán giả ghi nhớ tốt hơn.', timestamp:'2026-05-16T10:05', type:'text' },
    ], unread:0, resolved:true, pinnedMaterials:[],
  },
];

export const notifications = [
  { id:'noti1', userId:'u1', title:'Điểm danh hàng ngày!', body:'Học ngay hôm nay để giữ streak 7 ngày.', type:'reminder', read:false, timestamp:'2026-05-18T07:00' },
  { id:'noti2', userId:'u1', title:'Bài review đến hạn', body:'Bạn có 12 thẻ cần ôn tập hôm nay.', type:'review', read:false, timestamp:'2026-05-18T06:30' },
  { id:'noti3', userId:'u1', title:'Chúc mừng!', body:'Bạn vừa đạt cấp độ 5. Tiếp tục phát huy!', type:'achievement', read:false, timestamp:'2026-05-17T20:00' },
  { id:'noti4', userId:'u1', title:'Huy hiệu mới', body:'Bạn nhận được huy hiệu "Người học chăm chỉ".', type:'badge', read:true, timestamp:'2026-05-17T18:00' },
  { id:'noti5', userId:'u1', title:'Khoá học sắp hết hạn', body:'"An toàn thông tin cơ bản" còn 12 ngày nữa.', type:'deadline', read:false, timestamp:'2026-05-16T12:00' },
  { id:'noti6', userId:'u2', title:'Tin nhắn mới', body:'Nguyễn Văn An đã gửi câu hỏi mới.', type:'chat', read:false, timestamp:'2026-05-18T08:33' },
];

export const badges = [
  { id:'b1', name:'Người học chăm chỉ', description:'Duy trì streak 7 ngày', icon:'🔥', unlockedAt:'2026-05-17', category:'streak' },
  { id:'b2', name:'Hoàn thành đầu tiên', description:'Hoàn thành khoá học đầu tiên', icon:'🎯', unlockedAt:null, category:'achievement' },
  { id:'b3', name:'Chuyên gia kiểm tra', description:'Đạt điểm tuyệt đối 3 bài quiz', icon:'🏆', unlockedAt:null, category:'achievement' },
  { id:'b4', name:'Người giao tiếp giỏi', description:'Hoàn thành role-play xuất sắc', icon:'💬', unlockedAt:null, category:'skill' },
  { id:'b5', name:'Tia chớp', description:'Hoàn thành 5 bài học trong 1 ngày', icon:'⚡', unlockedAt:'2026-05-15', category:'speed' },
  { id:'b6', name:'Siêu kết nối', description:'Gửi 10 tin nhắn cho giảng viên', icon:'📬', unlockedAt:null, category:'social' },
];

export const certificates = [
  { id:'cert1', userId:'u1', courseId:'c2', courseName:'An toàn thông tin cơ bản', userName:'Nguyễn Văn An', completionDate:'2026-05-10', score:88, duration:90, verificationCode:'SL-CERT-2026-0001' },
  { id:'cert2', userId:'u8', courseId:'c1', courseName:'Kỹ năng giao tiếp trong công việc', userName:'Vũ Minh Tuấn', completionDate:'2026-04-25', score:92, duration:120, verificationCode:'SL-CERT-2026-0002' },
];

export function getConversationsForUser(userId) { return conversations.filter(c => c.participants.includes(userId)); }
export function getNotificationsForUser(userId) { return notifications.filter(n => n.userId === userId); }
export function getCertificatesForUser(userId) {
  const staticCerts = certificates.filter(c => c.userId === userId);
  try {
    const ls = JSON.parse(localStorage.getItem('starlent_learning') || '{}');
    const local = (ls.localCerts || []).filter(c => c.userId === userId);
    const courseIds = new Set(local.map(c => c.courseId));
    return [...local, ...staticCerts.filter(c => !courseIds.has(c.courseId))];
  } catch { return staticCerts; }
}
export function findCertificateById(certId) {
  const all = [...certificates];
  try {
    const ls = JSON.parse(localStorage.getItem('starlent_learning') || '{}');
    all.push(...(ls.localCerts || []));
  } catch { /* ignore */ }
  return all.find(c => c.id === certId) || null;
}
export function getUnlockedBadges(unlockedBadgeIds = []) { return badges.filter(b => unlockedBadgeIds.includes(b.id) || b.unlockedAt !== null); }
