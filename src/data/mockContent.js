/**
 * Mock Content â€” Ná»™i dung há»c táº­p cho tá»«ng loáº¡i micro-content
 */

export const flashcards = {
  fc1: { id: 'fc1', title: 'Thuáº­t ngá»¯ giao tiáº¿p', cards: [
    { id:'fc1_1', front:'Giao tiáº¿p phi ngÃ´n ngá»¯ lÃ  gÃ¬?',
      options: ['Giao tiáº¿p báº±ng vÄƒn báº£n', 'Giao tiáº¿p khÃ´ng dÃ¹ng lá»i nÃ³i: cá»­ chá»‰, Ã¡nh máº¯t, tÆ° tháº¿', 'Giao tiáº¿p qua Ä‘iá»‡n thoáº¡i', 'Giao tiáº¿p qua email'],
      correctIndex: 1, explanation:'Giao tiáº¿p phi ngÃ´n ngá»¯ bao gá»“m cá»­ chá»‰, Ã¡nh máº¯t, nÃ©t máº·t, tÆ° tháº¿ vÃ  khoáº£ng cÃ¡ch.' },
    { id:'fc1_2', front:'Active Listening (láº¯ng nghe chá»§ Ä‘á»™ng) lÃ  gÃ¬?',
      options: ['Nghe vÃ  ghi chÃ©p láº¡i tá»«ng tá»«', 'Táº­p trung hoÃ n toÃ n vÃ o ngÆ°á»i nÃ³i, pháº£n há»“i vÃ  ghi nhá»› thÃ´ng tin', 'Nghe trong khi lÃ m viá»‡c khÃ¡c', 'Chá»‰ nghe mÃ  khÃ´ng pháº£n há»“i'],
      correctIndex: 1, explanation:'Láº¯ng nghe chá»§ Ä‘á»™ng lÃ  táº­p trung hoÃ n toÃ n, khÃ´ng ngáº¯t lá»i, Ä‘áº·t cÃ¢u há»i vÃ  pháº£n há»“i láº¡i.' },
    { id:'fc1_3', front:'Ká»¹ thuáº­t "pháº£n chiáº¿u" (mirroring) dÃ¹ng Ä‘á»ƒ lÃ m gÃ¬?',
      options: ['Sao chÃ©p toÃ n bá»™ cÃ¢u nÃ³i cá»§a Ä‘á»‘i phÆ°Æ¡ng', 'Thá»ƒ hiá»‡n sá»± Ä‘á»“ng cáº£m báº±ng cÃ¡ch láº·p láº¡i tá»« khoÃ¡ hoáº·c cá»¥m tá»«', 'PhÃª bÃ¬nh Ã½ kiáº¿n cá»§a Ä‘á»‘i phÆ°Æ¡ng', 'Thay Ä‘á»•i chá»§ Ä‘á» cuá»™c trÃ² chuyá»‡n'],
      correctIndex: 1, explanation:'Mirroring giÃºp thá»ƒ hiá»‡n sá»± Ä‘á»“ng cáº£m vÃ  xÃ¡c nháº­n báº¡n Ä‘ang thá»±c sá»± láº¯ng nghe.' },
    { id:'fc1_4', front:'Theo quy táº¯c 7-38-55, yáº¿u tá»‘ nÃ o chiáº¿m tá»‰ lá»‡ cao nháº¥t?',
      options: ['Tá»« ngá»¯ (7%)', 'Giá»ng Ä‘iá»‡u (38%)', 'NgÃ´n ngá»¯ cÆ¡ thá»ƒ (55%)', 'Trang phá»¥c vÃ  ngoáº¡i hÃ¬nh'],
      correctIndex: 2, explanation:'Theo Mehrabian: 7% tá»« ngá»¯, 38% giá»ng Ä‘iá»‡u, 55% ngÃ´n ngá»¯ cÆ¡ thá»ƒ.' },
  ]},
  fc2: { id: 'fc2', title: 'Thuáº­t ngá»¯ báº£o máº­t', cards: [
    { id:'fc2_1', front:'Phishing lÃ  hÃ¬nh thá»©c táº¥n cÃ´ng gÃ¬?',
      options: ['Táº¥n cÃ´ng tá»« chá»‘i dá»‹ch vá»¥', 'Giáº£ máº¡o email/website Ä‘á»ƒ Ä‘Ã¡nh cáº¯p thÃ´ng tin cÃ¡ nhÃ¢n', 'MÃ£ hoÃ¡ dá»¯ liá»‡u Ä‘Ã²i tiá»n chuá»™c', 'XÃ¢m nháº­p váº­t lÃ½ vÃ o mÃ¡y chá»§'],
      correctIndex: 1, explanation:'Phishing lÃ  táº¥n cÃ´ng giáº£ máº¡o nháº±m Ä‘Ã¡nh cáº¯p thÃ´ng tin nhÆ° máº­t kháº©u, sá»‘ tháº» tÃ­n dá»¥ng.' },
    { id:'fc2_2', front:'Ransomware lÃ  loáº¡i mÃ£ Ä‘á»™c gÃ¬?',
      options: ['Pháº§n má»m hiá»ƒn thá»‹ quáº£ng cÃ¡o', 'Pháº§n má»m mÃ£ hoÃ¡ dá»¯ liá»‡u vÃ  Ä‘Ã²i tiá»n chuá»™c', 'Pháº§n má»m theo dÃµi bÃ n phÃ­m', 'Pháº§n má»m Ä‘Ã o tiá»n áº£o trÃ¡i phÃ©p'],
      correctIndex: 1, explanation:'Ransomware mÃ£ hoÃ¡ dá»¯ liá»‡u vÃ  yÃªu cáº§u tiá»n chuá»™c Ä‘á»ƒ má»Ÿ khoÃ¡.' },
    { id:'fc2_3', front:'XÃ¡c thá»±c 2 yáº¿u tá»‘ (2FA) hoáº¡t Ä‘á»™ng tháº¿ nÃ o?',
      options: ['Chá»‰ cáº§n nháº­p máº­t kháº©u 2 láº§n', 'YÃªu cáº§u máº­t kháº©u + mÃ£ OTP hoáº·c sinh tráº¯c há»c', 'DÃ¹ng 2 máº­t kháº©u khÃ¡c nhau', 'ÄÄƒng nháº­p trÃªn 2 thiáº¿t bá»‹ cÃ¹ng lÃºc'],
      correctIndex: 1, explanation:'2FA cáº§n 2 bÆ°á»›c: thá»© báº¡n biáº¿t (máº­t kháº©u) + thá»© báº¡n cÃ³ (mÃ£ OTP) hoáº·c thá»© báº¡n lÃ  (sinh tráº¯c).' },
  ]},
  fc3: { id: 'fc3', title: 'KhÃ¡i niá»‡m quáº£n lÃ½ thá»i gian', cards: [
    { id:'fc3_1', front:'Ma tráº­n Eisenhower phÃ¢n loáº¡i cÃ´ng viá»‡c theo máº¥y Ã´?',
      options: ['2 Ã´: Gáº¥p vÃ  KhÃ´ng gáº¥p', '3 Ã´: Cao, Trung bÃ¬nh, Tháº¥p', '4 Ã´: dá»±a trÃªn Quan trá»ng vÃ  Kháº©n cáº¥p', '5 Ã´: theo má»©c Ä‘á»™ Æ°u tiÃªn tá»« 1-5'],
      correctIndex: 2, explanation:'Ma tráº­n Eisenhower cÃ³ 4 Ã´: Quan trá»ng+Gáº¥p, Quan trá»ng+KhÃ´ng gáº¥p, KhÃ´ng quan trá»ng+Gáº¥p, KhÃ´ng quan trá»ng+KhÃ´ng gáº¥p.' },
    { id:'fc3_2', front:'Ká»¹ thuáº­t Pomodoro quy Ä‘á»‹nh thá»i gian tháº¿ nÃ o?',
      options: ['LÃ m 50 phÃºt, nghá»‰ 10 phÃºt', 'LÃ m 25 phÃºt, nghá»‰ 5 phÃºt; sau 4 chu ká»³ nghá»‰ dÃ i', 'LÃ m 1 tiáº¿ng, nghá»‰ 30 phÃºt', 'LÃ m liÃªn tá»¥c Ä‘áº¿n khi xong viá»‡c'],
      correctIndex: 1, explanation:'Pomodoro: 25 phÃºt táº­p trung + 5 phÃºt nghá»‰. Sau 4 chu ká»³ nghá»‰ dÃ i 15-30 phÃºt.' },
  ]},
  fc4: { id: 'fc4', title: 'Vai trÃ² trong nhÃ³m', cards: [
    { id:'fc4_1', front:'Theo Belbin, cÃ³ bao nhiÃªu vai trÃ² trong nhÃ³m hiá»‡u quáº£?',
      options: ['5 vai trÃ² cÆ¡ báº£n', '7 vai trÃ², chia thÃ nh 3 nhÃ³m', '9 vai trÃ²: Äiá»u phá»‘i, Thá»±c thi, HoÃ n thiá»‡n, ChuyÃªn gia...', '12 vai trÃ² cho má»i tÃ¬nh huá»‘ng'],
      correctIndex: 2, explanation:'Belbin xÃ¡c Ä‘á»‹nh 9 vai trÃ² nhÃ³m khÃ¡c nhau, má»—i vai trÃ² Ä‘Ã³ng gÃ³p má»™t tháº¿ máº¡nh riÃªng.' },
  ]},
};

export const videos = {
  vd1: { id:'vd1', title:'Láº¯ng nghe chá»§ Ä‘á»™ng', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:420, transcript:'Láº¯ng nghe chá»§ Ä‘á»™ng lÃ  ká»¹ nÄƒng quan trá»ng. Khi láº¯ng nghe chá»§ Ä‘á»™ng báº¡n cáº§n: Táº­p trung hoÃ n toÃ n vÃ o ngÆ°á»i nÃ³i, khÃ´ng ngáº¯t lá»i, Ä‘áº·t cÃ¢u há»i lÃ m rÃµ, vÃ  pháº£n há»“i láº¡i nhá»¯ng gÃ¬ Ä‘Ã£ nghe.', captions:'Phá»¥ Ä‘á» tiáº¿ng Viá»‡t (YouTube)' },
  vd2: { id:'vd2', title:'Ká»¹ nÄƒng thuyáº¿t trÃ¬nh', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:540, transcript:'Thuyáº¿t trÃ¬nh hiá»‡u quáº£ cáº§n: Chuáº©n bá»‹ ká»¹ ná»™i dung, hiá»ƒu Ä‘á»‘i tÆ°á»£ng, sá»­ dá»¥ng ngÃ´n ngá»¯ cÆ¡ thá»ƒ phÃ¹ há»£p, giá»ng nÃ³i rÃµ rÃ ng truyá»n cáº£m.', captions:'Phá»¥ Ä‘á» tiáº¿ng Viá»‡t (YouTube)' },
  vd3: { id:'vd3', title:'CÃ¡c má»‘i Ä‘e doáº¡ phá»• biáº¿n', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:380, transcript:'CÃ¡c má»‘i Ä‘e doáº¡: Phishing, Ransomware, Social Engineering, DDoS, Insider Threats.', captions:'Phá»¥ Ä‘á» tiáº¿ng Viá»‡t (YouTube)' },
  vd4: { id:'vd4', title:'Ma tráº­n Eisenhower', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:300, transcript:'Ma tráº­n Eisenhower chia cÃ´ng viá»‡c thÃ nh 4 Ã´. Táº­p trung vÃ o Ã´ Quan trá»ng nhÆ°ng KhÃ´ng kháº©n cáº¥p.', captions:'Phá»¥ Ä‘á» tiáº¿ng Viá»‡t (YouTube)' },
  vd5: { id:'vd5', title:'5 giai Ä‘oáº¡n phÃ¡t triá»ƒn nhÃ³m', videoUrl:'https://www.youtube.com/watch?v=LHCob76kigA', youtubeId:'LHCob76kigA', duration:360, transcript:'Theo Tuckman: Forming, Storming, Norming, Performing, Adjourning.', captions:'Phá»¥ Ä‘á» tiáº¿ng Viá»‡t (YouTube)' },
};

export const audios = {
  ad1: { id:'ad1', title:'Giá»ng nÃ³i vÃ  ngá»¯ Ä‘iá»‡u', audioUrl:null, duration:480, transcript:'Giá»ng nÃ³i chiáº¿m 38% áº¥n tÆ°á»£ng. ChÃº Ã½: Ã¢m lÆ°á»£ng, tá»‘c Ä‘á»™, ngá»¯ Ä‘iá»‡u vÃ  khoáº£ng dá»«ng.' },
  ad2: { id:'ad2', title:'Nháº­n diá»‡n phishing', audioUrl:null, duration:360, transcript:'Dáº¥u hiá»‡u: Ä‘á»‹a chá»‰ gá»­i Ä‘Ã¡ng ngá», lá»—i chÃ­nh táº£, yÃªu cáº§u thÃ´ng tin cÃ¡ nhÃ¢n, link khÃ´ng khá»›p.' },
  ad3: { id:'ad3', title:'Ká»¹ thuáº­t Pomodoro', audioUrl:null, duration:300, transcript:'25 phÃºt lÃ m viá»‡c táº­p trung, nghá»‰ 5 phÃºt. Sau 4 Pomodoro nghá»‰ dÃ i 15-30 phÃºt.' },
  ad4: { id:'ad4', title:'Pháº£n há»“i xÃ¢y dá»±ng', audioUrl:null, duration:420, transcript:'Pháº£n há»“i nÃªn theo mÃ´ hÃ¬nh SBI: Situation (TÃ¬nh huá»‘ng), Behavior (HÃ nh vi), Impact (TÃ¡c Ä‘á»™ng).' },
};

export const quizzes = {
  qz1: { id:'qz1', title:'Kiá»ƒm tra: NguyÃªn táº¯c giao tiáº¿p', type:'multiple_choice', timeLimit:300, questions:[
    { id:'q1_1', question:'Yáº¿u tá»‘ nÃ o chiáº¿m tá»· lá»‡ cao nháº¥t trong giao tiáº¿p?', options:['Tá»« ngá»¯ (7%)','Giá»ng Ä‘iá»‡u (38%)','NgÃ´n ngá»¯ cÆ¡ thá»ƒ (55%)','Trang phá»¥c'], correctIndex:2, explanation:'Theo Mehrabian, ngÃ´n ngá»¯ cÆ¡ thá»ƒ chiáº¿m 55%.' },
    { id:'q1_2', question:'Láº¯ng nghe chá»§ Ä‘á»™ng KHÃ”NG bao gá»“m?', options:['Äáº·t cÃ¢u há»i lÃ m rÃµ','Pháº£n há»“i láº¡i Ã½ chÃ­nh','Ngáº¯t lá»i Ä‘á»ƒ thá»ƒ hiá»‡n Ã½ kiáº¿n','Duy trÃ¬ giao tiáº¿p máº¯t'], correctIndex:2, explanation:'Ngáº¯t lá»i lÃ  hÃ nh vi cáº§n trÃ¡nh.' },
    { id:'q1_3', question:'Ká»¹ thuáº­t mirroring dÃ¹ng Ä‘á»ƒ lÃ m gÃ¬?', options:['Thá»ƒ hiá»‡n thÃ´ng minh hÆ¡n','Thá»ƒ hiá»‡n Ä‘á»“ng cáº£m vÃ  láº¯ng nghe','Sao chÃ©p Ã½ tÆ°á»Ÿng','ÄÃ¡nh láº¡c hÆ°á»›ng'], correctIndex:1, explanation:'Mirroring giÃºp thá»ƒ hiá»‡n sá»± Ä‘á»“ng cáº£m.' },
  ]},
  qz2: { id:'qz2', title:'BÃ i kiá»ƒm tra cuá»‘i khoÃ¡: Giao tiáº¿p', type:'multiple_choice', timeLimit:600, questions:[
    { id:'q2_1', question:'Khi gáº·p khÃ¡ch hÃ ng tá»©c giáº­n, bÆ°á»›c Ä‘áº§u tiÃªn nÃªn lÃ m gÃ¬?', options:['Giáº£i thÃ­ch lÃ½ do','Láº¯ng nghe vÃ  ghi nháº­n cáº£m xÃºc','Gá»i quáº£n lÃ½','ÄÆ°a ra giáº£i phÃ¡p ngay'], correctIndex:1, explanation:'Láº¯ng nghe vÃ  ghi nháº­n cáº£m xÃºc trÆ°á»›c khi giáº£i quyáº¿t.' },
    { id:'q2_2', question:'Khoáº£ng dá»«ng trong thuyáº¿t trÃ¬nh cÃ³ tÃ¡c dá»¥ng gÃ¬?', options:['Cho khÃ¡n giáº£ nghá»‰','Nháº¥n máº¡nh Ã½ chÃ­nh vÃ  táº¡o nhá»‹p Ä‘iá»‡u','KÃ©o dÃ i thá»i gian','KhÃ´ng cÃ³ tÃ¡c dá»¥ng'], correctIndex:1, explanation:'Khoáº£ng dá»«ng nháº¥n máº¡nh Ã½ vÃ  táº¡o nhá»‹p.' },
  ]},
  qz3: { id:'qz3', title:'Kiá»ƒm tra: PhÃ²ng chá»‘ng táº¥n cÃ´ng', type:'multiple_choice', timeLimit:240, questions:[
    { id:'q3_1', question:'CÃ¡ch tá»‘t nháº¥t phÃ²ng chá»‘ng phishing?', options:['Má»Ÿ táº¥t cáº£ email','Kiá»ƒm tra Ä‘á»‹a chá»‰ gá»­i, khÃ´ng click link láº¡','Táº£i file Ä‘Ã­nh kÃ¨m','Tráº£ lá»i email yÃªu cáº§u'], correctIndex:1, explanation:'LuÃ´n kiá»ƒm tra ká»¹ Ä‘á»‹a chá»‰ gá»­i.' },
  ]},
  qz4: { id:'qz4', title:'Kiá»ƒm tra: CÃ´ng cá»¥ quáº£n lÃ½ thá»i gian', type:'multiple_choice', timeLimit:300, questions:[
    { id:'q4_1', question:'Viá»‡c "Quan trá»ng nhÆ°ng KhÃ´ng gáº¥p" nÃªn Ä‘Æ°á»£c:', options:['LÃ m ngay','LÃªn lá»‹ch Ä‘á»ƒ lÃ m sau','Uá»· quyá»n','Bá» qua'], correctIndex:1, explanation:'ÄÃ¢y lÃ  loáº¡i viá»‡c mang láº¡i hiá»‡u quáº£ dÃ i háº¡n.' },
  ]},
  qz5: { id:'qz5', title:'Kiá»ƒm tra: Giao tiáº¿p nhÃ³m', type:'multiple_choice', timeLimit:300, questions:[
    { id:'q5_1', question:'Äiá»u quan trá»ng nháº¥t khi Ä‘Æ°a pháº£n há»“i?', options:['Chá»‰ trÃ­ch tháº³ng tháº¯n','Táº­p trung vÃ o hÃ nh vi, khÃ´ng pháº£i con ngÆ°á»i','NÃ³i trÆ°á»›c toÃ n nhÃ³m','Giá»¯ im láº·ng'], correctIndex:1, explanation:'Pháº£n há»“i táº­p trung vÃ o hÃ nh vi cá»¥ thá»ƒ.' },
  ]},
  qz6: { id:'qz6', title:'BÃ i kiá»ƒm tra cuá»‘i khoÃ¡: Teamwork', type:'multiple_choice', timeLimit:600, questions:[
    { id:'q6_1', question:'Giai Ä‘oáº¡n Storming trong nhÃ³m lÃ  gÃ¬?', options:['NhÃ³m tan rÃ£','Xung Ä‘á»™t vÃ  khÃ¡c biá»‡t Ã½ kiáº¿n','LÃ m viá»‡c hiá»‡u quáº£ nháº¥t','Káº¿t náº¡p thÃ nh viÃªn'], correctIndex:1, explanation:'Storming lÃ  giai Ä‘oáº¡n xáº£y ra mÃ¢u thuáº«n tá»± nhiÃªn.' },
  ]},
};

export const sequenceQuizzes = {
  qs1: { id:'qs1', title:'Sáº¯p xáº¿p: Quy trÃ¬nh há»p hiá»‡u quáº£', description:'Sáº¯p xáº¿p cÃ¡c bÆ°á»›c tá»• chá»©c há»p hiá»‡u quáº£ theo Ä‘Ãºng thá»© tá»±.', items:[
    { id:'s1_1', text:'XÃ¡c Ä‘á»‹nh má»¥c tiÃªu cuá»™c há»p', order:1 },
    { id:'s1_2', text:'Chuáº©n bá»‹ chÆ°Æ¡ng trÃ¬nh (agenda)', order:2 },
    { id:'s1_3', text:'Má»i Ä‘Ãºng thÃ nh pháº§n tham gia', order:3 },
    { id:'s1_4', text:'Äiá»u hÃ nh vÃ  ghi nháº­n Ã½ kiáº¿n', order:4 },
    { id:'s1_5', text:'Tá»•ng káº¿t vÃ  gá»­i biÃªn báº£n', order:5 },
  ]},
  qs2: { id:'qs2', title:'Sáº¯p xáº¿p: Quy trÃ¬nh xá»­ lÃ½ sá»± cá»‘', description:'Sáº¯p xáº¿p cÃ¡c bÆ°á»›c xá»­ lÃ½ sá»± cá»‘ báº£o máº­t.', items:[
    { id:'s2_1', text:'PhÃ¡t hiá»‡n sá»± cá»‘', order:1 },
    { id:'s2_2', text:'CÃ´ láº­p há»‡ thá»‘ng bá»‹ áº£nh hÆ°á»Ÿng', order:2 },
    { id:'s2_3', text:'ÄÃ¡nh giÃ¡ má»©c Ä‘á»™ thiá»‡t háº¡i', order:3 },
    { id:'s2_4', text:'Thá»±c hiá»‡n biá»‡n phÃ¡p kháº¯c phá»¥c', order:4 },
    { id:'s2_5', text:'BÃ¡o cÃ¡o vÃ  rÃºt kinh nghiá»‡m', order:5 },
  ]},
  qs3: { id:'qs3', title:'CÃ¡c bÆ°á»›c giáº£i quyáº¿t xung Ä‘á»™t', description:'Sáº¯p xáº¿p cÃ¡c bÆ°á»›c giáº£i quyáº¿t xung Ä‘á»™t.', items:[
    { id:'s3_1', text:'Nháº­n diá»‡n váº¥n Ä‘á»', order:1 },
    { id:'s3_2', text:'Láº¯ng nghe cÃ¡c bÃªn liÃªn quan', order:2 },
    { id:'s3_3', text:'TÃ¬m giáº£i phÃ¡p cÃ¹ng cÃ³ lá»£i', order:3 },
    { id:'s3_4', text:'Thá»‘ng nháº¥t hÃ nh Ä‘á»™ng', order:4 },
    { id:'s3_5', text:'Theo dÃµi vÃ  Ä‘Ã¡nh giÃ¡ káº¿t quáº£', order:5 },
  ]},
};

export const roleplays = {
  rp1: { id:'rp1', title:'Xá»­ lÃ½ khÃ¡ch hÃ ng khÃ³ tÃ­nh', scenario:'Báº¡n lÃ  nhÃ¢n viÃªn CSKH. KhÃ¡ch hÃ ng gá»i Ä‘áº¿n ráº¥t tá»©c giáº­n vÃ¬ sáº£n pháº©m bá»‹ lá»—i, Ä‘Ã£ chá» 3 ngÃ y.', suggestedResponse:'Dáº¡ em xin lá»—i anh/chá»‹. Em hiá»ƒu anh/chá»‹ Ä‘Ã£ chá» ráº¥t lÃ¢u. Em sáº½ xá»­ lÃ½ ngay vÃ  Ä‘á» xuáº¥t phÆ°Æ¡ng Ã¡n Ä‘á»•i tráº£/hoÃ n tiá»n trong 24h.', tips:['LuÃ´n báº¯t Ä‘áº§u báº±ng lá»i xin lá»—i','XÃ¡c nháº­n cáº£m xÃºc khÃ¡ch hÃ ng','ÄÆ°a giáº£i phÃ¡p cá»¥ thá»ƒ'] },
  rp2: { id:'rp2', title:'Tá»•ng há»£p tÃ¬nh huá»‘ng', scenario:'Báº¡n cáº§n thuyáº¿t trÃ¬nh trÆ°á»›c ban lÃ£nh Ä‘áº¡o vá» dá»± Ã¡n gáº·p khÃ³ khÄƒn.', suggestedResponse:'KÃ­nh thÆ°a ban lÃ£nh Ä‘áº¡o, dá»± Ã¡n Ä‘ang cháº­m 2 tuáº§n do nguá»“n lá»±c. ChÃºng tÃ´i Ä‘á» xuáº¥t 2 phÆ°Æ¡ng Ã¡n...', tips:['NÃªu váº¥n Ä‘á» ngáº¯n gá»n','Äá» xuáº¥t giáº£i phÃ¡p','CÃ³ sá»‘ liá»‡u cá»¥ thá»ƒ'] },
  rp3: { id:'rp3', title:'BÃ¡o cÃ¡o sá»± cá»‘ báº£o máº­t', scenario:'Báº¡n phÃ¡t hiá»‡n Ä‘á»“ng nghiá»‡p má»Ÿ file Ä‘Ã­nh kÃ¨m Ä‘Ã¡ng ngá».', suggestedResponse:'Ngáº¯t káº¿t ná»‘i máº¡ng ngay. BÃ¡o cÃ¡o IT/Security. KhÃ´ng tá»± Ã½ cháº¡y pháº§n má»m diá»‡t virus.', tips:['Ngáº¯t máº¡ng lÃ  bÆ°á»›c Ä‘áº§u tiÃªn','BÃ¡o cÃ¡o ngay','KhÃ´ng tá»± Ã½ xá»­ lÃ½'] },
  rp4: { id:'rp4', title:'Láº­p káº¿ hoáº¡ch tuáº§n', scenario:'Báº¡n cÃ³ quÃ¡ nhiá»u deadline vÃ  cáº£m tháº¥y quÃ¡ táº£i.', suggestedResponse:'Liá»‡t kÃª táº¥t cáº£ viá»‡c -> PhÃ¢n loáº¡i Eisenhower -> Block thá»i gian -> Uá»· quyá»n viá»‡c cÃ³ thá»ƒ -> DÃ nh buffer 20%.', tips:['KhÃ´ng Ã´m Ä‘á»“m','Uá»· quyá»n khi cÃ³ thá»ƒ'] },
  rp5: { id:'rp5', title:'HoÃ  giáº£i xung Ä‘á»™t', scenario:'Hai thÃ nh viÃªn mÃ¢u thuáº«n vá» cÃ¡ch tiáº¿p cáº­n dá»± Ã¡n.', suggestedResponse:'Há»p riÃªng, Ä‘á»ƒ má»—i ngÆ°á»i trÃ¬nh bÃ y. TÃ¬m Ä‘iá»ƒm chung. Äá» xuáº¥t giáº£i phÃ¡p káº¿t há»£p.', tips:['Láº¯ng nghe cáº£ hai bÃªn','Táº­p trung vÃ o váº¥n Ä‘á»','TÃ¬m win-win'] },
};


export const readingLessons = {
  rd1: {
    id: 'rd1',
    title: 'Checklist giao tiếp công sở',
    body: '1) Xác định mục tiêu cuộc trao đổi.\n2) Dùng ngôn ngữ rõ ràng.\n3) Chốt đầu việc sau cuộc họp.',
    references: ['https://example.com/communication-checklist'],
    attachments: [],
  },
};

export const assignmentsCatalog = {
  as1: {
    id: 'as1',
    title: 'Bài tập phản hồi 360',
    instruction: 'Viết phản hồi theo mô hình SBI cho 1 tình huống thực tế trong nhóm của bạn.',
    submissionType: 'text',
    rubric: 'Rõ tình huống, mô tả hành vi cụ thể, nêu tác động và đề xuất cải thiện.',
    maxScore: 100,
    dueAt: null,
  },
};

export const surveys = {
  sv1: {
    id: 'sv1',
    title: 'Khảo sát sau khóa học',
    questions: [
      { id: 'sv1_q1', type: 'scale_5', prompt: 'Mức độ hài lòng tổng thể?' },
      { id: 'sv1_q2', type: 'text', prompt: 'Bạn muốn cải thiện điều gì?' },
    ],
  },
};

export const liveSessions = {
  ls1: {
    id: 'ls1',
    title: 'Workshop Q&A trực tuyến',
    meetingUrl: 'https://meet.example.com/starlent-live',
    startAt: '2026-06-01T09:00:00+07:00',
    endAt: '2026-06-01T10:00:00+07:00',
    host: 'trainer_1',
    notes: 'Chuẩn bị trước 3 câu hỏi liên quan đến module đã học.',
  },
};
/** Láº¥y ná»™i dung theo contentId */
export function getContentById(contentId) {
  return flashcards[contentId] || videos[contentId] || audios[contentId] || quizzes[contentId] || sequenceQuizzes[contentId] || roleplays[contentId] || readingLessons[contentId] || assignmentsCatalog[contentId] || surveys[contentId] || liveSessions[contentId] || null;
}

