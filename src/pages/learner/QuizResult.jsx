import { useLocation, useNavigate } from 'react-router-dom';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function QuizResult() {
  const loc=useLocation(); const navigate=useNavigate();
  const { quizTitle, score, total, answers, questions } = loc.state||{};
  if (!quizTitle) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Kết quả</div></div>}><div className="empty-state"><div className="empty-state__icon">📊</div><div className="empty-state__title">Không có dữ liệu</div></div></LearnerLayout>;
  const pct=Math.round((score/total)*100); const passed=pct>=70;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Kết quả</div></div>}>
      <div style={{padding:16}}>
        <div style={{textAlign:'center',marginBottom:24}}><div style={{fontSize:72}}>{passed?'🎉':'😔'}</div><h2 style={{fontSize:24,fontWeight:800,margin:'4px 0'}}>{passed?'Chúc mừng!':'Chưa đạt'}</h2><p style={{fontSize:16,color:'var(--color-text-secondary)'}}>{quizTitle}</p></div>
        <div className="card" style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:48,fontWeight:800,color:passed?'var(--color-success)':'var(--color-danger)'}}>{score}/{total}</div>
          <div style={{fontSize:18,fontWeight:600,color:'var(--color-text-secondary)'}}>{pct}%</div>
          <div className="progress-bar" style={{marginTop:12}}><div className="progress-bar__fill" style={{width:`${pct}%`,background:passed?'var(--color-success)':'var(--color-danger)'}}/></div>
        </div>
        <div className="grid-2" style={{marginBottom:20}}>
          <div className="stat-card"><div className="stat-card__label">✅ Đúng</div><div className="stat-card__value" style={{color:'var(--color-success)'}}>{score}</div></div>
          <div className="stat-card"><div className="stat-card__label">❌ Sai</div><div className="stat-card__value" style={{color:'var(--color-danger)'}}>{total-score}</div></div>
        </div>
        {questions&&<div style={{marginBottom:20}}><h4 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Chi tiết</h4>
          {questions.map((q,i)=>{const ans=answers.find(a=>a.questionId===q.id);return(
            <div key={q.id} className="card" style={{marginBottom:8,padding:12,background:ans?.correct?'var(--color-success-light)':'var(--color-danger-light)',borderColor:ans?.correct?'var(--color-success)':'var(--color-danger)'}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{i+1}. {q.question}</div>
              <div style={{fontSize:12,color:'var(--color-text-secondary)'}}>Trả lời: {q.options[ans?.selected]} {ans?.correct?'✅':'❌'} {!ans?.correct&&<span>— Đúng: {q.options[q.correctIndex]}</span>}</div>
            </div>
          );})}
        </div>}
        <button className="btn btn--primary btn--lg btn--full" onClick={()=>navigate(-1)}>Quay lại</button>
        {!passed&&<button className="btn btn--secondary btn--lg btn--full" style={{marginTop:8}} onClick={()=>navigate(-1)}>Làm lại</button>}
      </div>
    </LearnerLayout>
  );
}
