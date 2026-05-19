/**
 * Mock Content — Nội dung học tập cho từng loại micro-content
 */

export const flashcards = {
  fc1: { id: 'fc1', title: 'Thuật ngữ giao tiếp', cards: [
    { id:'fc1_1', front:'Giao tiếp phi ngôn ngữ là gì?',
      options: ['Giao tiếp bằng văn bản', 'Giao tiếp không dùng lời nói: cử chỉ, ánh mắt, tư thế', 'Giao tiếp qua điện thoại', 'Giao tiếp qua email'],
      correctIndex: 1, explanation:'Giao tiếp phi ngôn ngữ bao gồm cử chỉ, ánh mắt, nét mặt, tư thế và khoảng cách.' },
    { id:'fc1_2', front:'Active Listening (lắng nghe chủ động) là gì?',
      options: ['Nghe và ghi chép lại từng từ', 'Tập trung hoàn toàn vào người nói, phản hồi và ghi nhớ thông tin', 'Nghe trong khi làm việc khác', 'Chỉ nghe mà không phản hồi'],
      correctIndex: 1, explanation:'Lắng nghe chủ động là tập trung hoàn toàn, không ngắt lời, đặt câu hỏi và phản hồi lại.' },
    { id:'fc1_3', front:'Kỹ thuật "phản chiếu" (mirroring) dùng để làm gì?',
      options: ['Sao chép toàn bộ câu nói của đối phương', 'Thể hiện sự đồng cảm bằng cách lặp lại từ khoá hoặc cụm từ', 'Phê bình ý kiến của đối phương', 'Thay đổi chủ đề cuộc trò chuyện'],
      correctIndex: 1, explanation:'Mirroring giúp thể hiện sự đồng cảm và xác nhận bạn đang thực sự lắng nghe.' },
    { id:'fc1_4', front:'Theo quy tắc 7-38-55, yếu tố nào chiếm tỉ lệ cao nhất?',
      options: ['Từ ngữ (7%)', 'Giọng điệu (38%)', 'Ngôn ngữ cơ thể (55%)', 'Trang phục và ngoại hình'],
      correctIndex: 2, explanation:'Theo Mehrabian: 7% từ ngữ, 38% giọng điệu, 55% ngôn ngữ cơ thể.' },
  ]},
  fc2: { id: 'fc2', title: 'Thuật ngữ bảo mật', cards: [
    { id:'fc2_1', front:'Phishing là hình thức tấn công gì?',
      options: ['Tấn công từ chối dịch vụ', 'Giả mạo email/website để đánh cắp thông tin cá nhân', 'Mã hoá dữ liệu đòi tiền chuộc', 'Xâm nhập vật lý vào máy chủ'],
      correctIndex: 1, explanation:'Phishing là tấn công giả mạo nhằm đánh cắp thông tin như mật khẩu, số thẻ tín dụng.' },
    { id:'fc2_2', front:'Ransomware là loại mã độc gì?',
      options: ['Phần mềm hiển thị quảng cáo', 'Phần mềm mã hoá dữ liệu và đòi tiền chuộc', 'Phần mềm theo dõi bàn phím', 'Phần mềm đào tiền ảo trái phép'],
      correctIndex: 1, explanation:'Ransomware mã hoá dữ liệu và yêu cầu tiền chuộc để mở khoá.' },
    { id:'fc2_3', front:'Xác thực 2 yếu tố (2FA) hoạt động thế nào?',
      options: ['Chỉ cần nhập mật khẩu 2 lần', 'Yêu cầu mật khẩu + mã OTP hoặc sinh trắc học', 'Dùng 2 mật khẩu khác nhau', 'Đăng nhập trên 2 thiết bị cùng lúc'],
      correctIndex: 1, explanation:'2FA cần 2 bước: thứ bạn biết (mật khẩu) + thứ bạn có (mã OTP) hoặc thứ bạn là (sinh trắc).' },
  ]},
  fc3: { id: 'fc3', title: 'Khái niệm quản lý thời gian', cards: [
    { id:'fc3_1', front:'Ma trận Eisenhower phân loại công việc theo mấy ô?',
      options: ['2 ô: Gấp và Không gấp', '3 ô: Cao, Trung bình, Thấp', '4 ô: dựa trên Quan trọng và Khẩn cấp', '5 ô: theo mức độ ưu tiên từ 1-5'],
      correctIndex: 2, explanation:'Ma trận Eisenhower có 4 ô: Quan trọng+Gấp, Quan trọng+Không gấp, Không quan trọng+Gấp, Không quan trọng+Không gấp.' },
    { id:'fc3_2', front:'Kỹ thuật Pomodoro quy định thời gian thế nào?',
      options: ['Làm 50 phút, nghỉ 10 phút', 'Làm 25 phút, nghỉ 5 phút; sau 4 chu kỳ nghỉ dài', 'Làm 1 tiếng, nghỉ 30 phút', 'Làm liên tục đến khi xong việc'],
      correctIndex: 1, explanation:'Pomodoro: 25 phút tập trung + 5 phút nghỉ. Sau 4 chu kỳ nghỉ dài 15-30 phút.' },
  ]},
  fc4: { id: 'fc4', title: 'Vai trò trong nhóm', cards: [
    { id:'fc4_1', front:'Theo Belbin, có bao nhiêu vai trò trong nhóm hiệu quả?',
      options: ['5 vai trò cơ bản', '7 vai trò, chia thành 3 nhóm', '9 vai trò: Điều phối, Thực thi, Hoàn thiện, Chuyên gia...', '12 vai trò cho mọi tình huống'],
      correctIndex: 2, explanation:'Belbin xác định 9 vai trò nhóm khác nhau, mỗi vai trò đóng góp một thế mạnh riêng.' },
  ]},
};

export const videos = {
  vd1: { id:'vd1', title:'Lắng nghe chủ động', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:420, transcript:'Lắng nghe chủ động là kỹ năng quan trọng. Khi lắng nghe chủ động bạn cần: Tập trung hoàn toàn vào người nói, không ngắt lời, đặt câu hỏi làm rõ, và phản hồi lại những gì đã nghe.', captions:'Phụ đề tiếng Việt (YouTube)' },
  vd2: { id:'vd2', title:'Kỹ năng thuyết trình', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:540, transcript:'Thuyết trình hiệu quả cần: Chuẩn bị kỹ nội dung, hiểu đối tượng, sử dụng ngôn ngữ cơ thể phù hợp, giọng nói rõ ràng truyền cảm.', captions:'Phụ đề tiếng Việt (YouTube)' },
  vd3: { id:'vd3', title:'Các mối đe doạ phổ biến', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:380, transcript:'Các mối đe doạ: Phishing, Ransomware, Social Engineering, DDoS, Insider Threats.', captions:'Phụ đề tiếng Việt (YouTube)' },
  vd4: { id:'vd4', title:'Ma trận Eisenhower', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:300, transcript:'Ma trận Eisenhower chia công việc thành 4 ô. Tập trung vào ô Quan trọng nhưng Không khẩn cấp.', captions:'Phụ đề tiếng Việt (YouTube)' },
  vd5: { id:'vd5', title:'5 giai đoạn phát triển nhóm', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:360, transcript:'Theo Tuckman: Forming, Storming, Norming, Performing, Adjourning.', captions:'Phụ đề tiếng Việt (YouTube)' },
};

export const audios = {
  ad1: { id:'ad1', title:'Giọng nói và ngữ điệu', audioUrl:null, duration:480, transcript:'Giọng nói chiếm 38% ấn tượng. Chú ý: âm lượng, tốc độ, ngữ điệu và khoảng dừng.' },
  ad2: { id:'ad2', title:'Nhận diện phishing', audioUrl:null, duration:360, transcript:'Dấu hiệu: địa chỉ gửi đáng ngờ, lỗi chính tả, yêu cầu thông tin cá nhân, link không khớp.' },
  ad3: { id:'ad3', title:'Kỹ thuật Pomodoro', audioUrl:null, duration:300, transcript:'25 phút làm việc tập trung, nghỉ 5 phút. Sau 4 Pomodoro nghỉ dài 15-30 phút.' },
  ad4: { id:'ad4', title:'Phản hồi xây dựng', audioUrl:null, duration:420, transcript:'Phản hồi nên theo mô hình SBI: Situation (Tình huống), Behavior (Hành vi), Impact (Tác động).' },
};

export const quizzes = {
  qz1: { id:'qz1', title:'Kiểm tra: Nguyên tắc giao tiếp', type:'multiple_choice', timeLimit:300, questions:[
    { id:'q1_1', question:'Yếu tố nào chiếm tỷ lệ cao nhất trong giao tiếp?', options:['Từ ngữ (7%)','Giọng điệu (38%)','Ngôn ngữ cơ thể (55%)','Trang phục'], correctIndex:2, explanation:'Theo Mehrabian, ngôn ngữ cơ thể chiếm 55%.' },
    { id:'q1_2', question:'Lắng nghe chủ động KHÔNG bao gồm?', options:['Đặt câu hỏi làm rõ','Phản hồi lại ý chính','Ngắt lời để thể hiện ý kiến','Duy trì giao tiếp mắt'], correctIndex:2, explanation:'Ngắt lời là hành vi cần tránh.' },
    { id:'q1_3', question:'Kỹ thuật mirroring dùng để làm gì?', options:['Thể hiện thông minh hơn','Thể hiện đồng cảm và lắng nghe','Sao chép ý tưởng','Đánh lạc hướng'], correctIndex:1, explanation:'Mirroring giúp thể hiện sự đồng cảm.' },
  ]},
  qz2: { id:'qz2', title:'Bài kiểm tra cuối khoá: Giao tiếp', type:'multiple_choice', timeLimit:600, questions:[
    { id:'q2_1', question:'Khi gặp khách hàng tức giận, bước đầu tiên nên làm gì?', options:['Giải thích lý do','Lắng nghe và ghi nhận cảm xúc','Gọi quản lý','Đưa ra giải pháp ngay'], correctIndex:1, explanation:'Lắng nghe và ghi nhận cảm xúc trước khi giải quyết.' },
    { id:'q2_2', question:'Khoảng dừng trong thuyết trình có tác dụng gì?', options:['Cho khán giả nghỉ','Nhấn mạnh ý chính và tạo nhịp điệu','Kéo dài thời gian','Không có tác dụng'], correctIndex:1, explanation:'Khoảng dừng nhấn mạnh ý và tạo nhịp.' },
  ]},
  qz3: { id:'qz3', title:'Kiểm tra: Phòng chống tấn công', type:'multiple_choice', timeLimit:240, questions:[
    { id:'q3_1', question:'Cách tốt nhất phòng chống phishing?', options:['Mở tất cả email','Kiểm tra địa chỉ gửi, không click link lạ','Tải file đính kèm','Trả lời email yêu cầu'], correctIndex:1, explanation:'Luôn kiểm tra kỹ địa chỉ gửi.' },
  ]},
  qz4: { id:'qz4', title:'Kiểm tra: Công cụ quản lý thời gian', type:'multiple_choice', timeLimit:300, questions:[
    { id:'q4_1', question:'Việc "Quan trọng nhưng Không gấp" nên được:', options:['Làm ngay','Lên lịch để làm sau','Uỷ quyền','Bỏ qua'], correctIndex:1, explanation:'Đây là loại việc mang lại hiệu quả dài hạn.' },
  ]},
  qz5: { id:'qz5', title:'Kiểm tra: Giao tiếp nhóm', type:'multiple_choice', timeLimit:300, questions:[
    { id:'q5_1', question:'Điều quan trọng nhất khi đưa phản hồi?', options:['Chỉ trích thẳng thắn','Tập trung vào hành vi, không phải con người','Nói trước toàn nhóm','Giữ im lặng'], correctIndex:1, explanation:'Phản hồi tập trung vào hành vi cụ thể.' },
  ]},
  qz6: { id:'qz6', title:'Bài kiểm tra cuối khoá: Teamwork', type:'multiple_choice', timeLimit:600, questions:[
    { id:'q6_1', question:'Giai đoạn Storming trong nhóm là gì?', options:['Nhóm tan rã','Xung đột và khác biệt ý kiến','Làm việc hiệu quả nhất','Kết nạp thành viên'], correctIndex:1, explanation:'Storming là giai đoạn xảy ra mâu thuẫn tự nhiên.' },
  ]},
};

export const sequenceQuizzes = {
  qs1: { id:'qs1', title:'Sắp xếp: Quy trình họp hiệu quả', description:'Sắp xếp các bước tổ chức họp hiệu quả theo đúng thứ tự.', items:[
    { id:'s1_1', text:'Xác định mục tiêu cuộc họp', order:1 },
    { id:'s1_2', text:'Chuẩn bị chương trình (agenda)', order:2 },
    { id:'s1_3', text:'Mời đúng thành phần tham gia', order:3 },
    { id:'s1_4', text:'Điều hành và ghi nhận ý kiến', order:4 },
    { id:'s1_5', text:'Tổng kết và gửi biên bản', order:5 },
  ]},
  qs2: { id:'qs2', title:'Sắp xếp: Quy trình xử lý sự cố', description:'Sắp xếp các bước xử lý sự cố bảo mật.', items:[
    { id:'s2_1', text:'Phát hiện sự cố', order:1 },
    { id:'s2_2', text:'Cô lập hệ thống bị ảnh hưởng', order:2 },
    { id:'s2_3', text:'Đánh giá mức độ thiệt hại', order:3 },
    { id:'s2_4', text:'Thực hiện biện pháp khắc phục', order:4 },
    { id:'s2_5', text:'Báo cáo và rút kinh nghiệm', order:5 },
  ]},
  qs3: { id:'qs3', title:'Các bước giải quyết xung đột', description:'Sắp xếp các bước giải quyết xung đột.', items:[
    { id:'s3_1', text:'Nhận diện vấn đề', order:1 },
    { id:'s3_2', text:'Lắng nghe các bên liên quan', order:2 },
    { id:'s3_3', text:'Tìm giải pháp cùng có lợi', order:3 },
    { id:'s3_4', text:'Thống nhất hành động', order:4 },
    { id:'s3_5', text:'Theo dõi và đánh giá kết quả', order:5 },
  ]},
};

export const roleplays = {
  rp1: { id:'rp1', title:'Xử lý khách hàng khó tính', scenario:'Bạn là nhân viên CSKH. Khách hàng gọi đến rất tức giận vì sản phẩm bị lỗi, đã chờ 3 ngày.', suggestedResponse:'Dạ em xin lỗi anh/chị. Em hiểu anh/chị đã chờ rất lâu. Em sẽ xử lý ngay và đề xuất phương án đổi trả/hoàn tiền trong 24h.', tips:['Luôn bắt đầu bằng lời xin lỗi','Xác nhận cảm xúc khách hàng','Đưa giải pháp cụ thể'] },
  rp2: { id:'rp2', title:'Tổng hợp tình huống', scenario:'Bạn cần thuyết trình trước ban lãnh đạo về dự án gặp khó khăn.', suggestedResponse:'Kính thưa ban lãnh đạo, dự án đang chậm 2 tuần do nguồn lực. Chúng tôi đề xuất 2 phương án...', tips:['Nêu vấn đề ngắn gọn','Đề xuất giải pháp','Có số liệu cụ thể'] },
  rp3: { id:'rp3', title:'Báo cáo sự cố bảo mật', scenario:'Bạn phát hiện đồng nghiệp mở file đính kèm đáng ngờ.', suggestedResponse:'Ngắt kết nối mạng ngay. Báo cáo IT/Security. Không tự ý chạy phần mềm diệt virus.', tips:['Ngắt mạng là bước đầu tiên','Báo cáo ngay','Không tự ý xử lý'] },
  rp4: { id:'rp4', title:'Lập kế hoạch tuần', scenario:'Bạn có quá nhiều deadline và cảm thấy quá tải.', suggestedResponse:'Liệt kê tất cả việc -> Phân loại Eisenhower -> Block thời gian -> Uỷ quyền việc có thể -> Dành buffer 20%.', tips:['Không ôm đồm','Uỷ quyền khi có thể'] },
  rp5: { id:'rp5', title:'Hoà giải xung đột', scenario:'Hai thành viên mâu thuẫn về cách tiếp cận dự án.', suggestedResponse:'Họp riêng, để mỗi người trình bày. Tìm điểm chung. Đề xuất giải pháp kết hợp.', tips:['Lắng nghe cả hai bên','Tập trung vào vấn đề','Tìm win-win'] },
};

/** Lấy nội dung theo contentId */
export function getContentById(contentId) {
  return flashcards[contentId] || videos[contentId] || audios[contentId] || quizzes[contentId] || sequenceQuizzes[contentId] || roleplays[contentId] || null;
}
