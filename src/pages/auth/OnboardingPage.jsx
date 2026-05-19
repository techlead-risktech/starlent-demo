import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setOnboarded } from '../../utils/auth.js';

const STEPS = [
  { illustration:'📚', title:'Chào mừng đến với Starlent!', desc:'Nền tảng micro-learning giúp bạn học tập mỗi ngày chỉ với vài phút. Kiến thức được chia nhỏ thành các bài học ngắn gọn, dễ tiếp thu.' },
  { illustration:'🎯', title:'Học theo lộ trình của riêng bạn', desc:'Chọn khoá học phù hợp với công việc và mục tiêu. Theo dõi tiến độ, nhận huy hiệu và chứng chỉ khi hoàn thành.' },
  { illustration:'🚀', title:'Sẵn sàng bắt đầu?', desc:'Duy trì streak học tập mỗi ngày. Ôn tập thông minh với flashcard và bài kiểm tra. Kết nối với giảng viên khi cần hỗ trợ.' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const cur = STEPS[step];

  const finish = () => { setOnboarded(); navigate('/learner/dashboard'); };

  return (
    <div className="onboarding">
      <div className="onboarding__illustration">{cur.illustration}</div>
      <h1 className="onboarding__title">{cur.title}</h1>
      <p className="onboarding__desc">{cur.desc}</p>
      <div className="onboarding__dots">
        {STEPS.map((_,i)=><div key={i} className={`onboarding__dot${i===step?' onboarding__dot--active':''}`}/>)}
      </div>
      <div style={{display:'flex',gap:12,width:'100%',maxWidth:320}}>
        {step>0 && <button className="btn btn--secondary btn--lg btn--full" onClick={()=>setStep(step-1)}>Quay lại</button>}
        {step<STEPS.length-1
          ? <button className="btn btn--primary btn--lg btn--full" onClick={()=>setStep(step+1)}>Tiếp tục</button>
          : <button className="btn btn--primary btn--lg btn--full" onClick={finish}>Bắt đầu học!</button>}
      </div>
      {step<STEPS.length-1 && <button style={{marginTop:16,color:'var(--color-text-muted)',fontSize:14}} onClick={finish}>Bỏ qua</button>}
    </div>
  );
}
