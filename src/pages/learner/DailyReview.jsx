import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcards } from '../../data/mockContent.js';
import { saveCardReview, completeItem, getDueCards } from '../../utils/auth.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function DailyReview() {
  const navigate=useNavigate(); const {toast,showToast}=useToast();
  const [loading,setLoading]=useState(true); const [cards,setCards]=useState([]);
  const [idx,setIdx]=useState(0); const [flipped,setFlipped]=useState(false);
  const [done,setDone]=useState(false); const [xp,setXp]=useState(0); const [reviewed,setReviewed]=useState(0);

  useEffect(()=>{const t=setTimeout(()=>{const all=Object.values(flashcards).flatMap(f=>f.cards);const due=getDueCards(all);setCards(due.length>0?due.slice(0,15):all.slice(0,5));setLoading(false);},300);return ()=>clearTimeout(t);},[]);

  if (loading) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Ôn tập hàng ngày</div></div>}><div style={{padding:16}}><div className="skeleton skeleton-card"/></div></LearnerLayout>;
  if (done) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Hoàn tất</div></div>}><div style={{textAlign:'center',padding:40}}><div style={{fontSize:64}}>🔄</div><h2 style={{fontSize:24,fontWeight:800,margin:8}}>Hoàn thành!</h2><p style={{fontSize:16,color:'var(--color-text-secondary)'}}>Đã ôn {reviewed} thẻ</p><p style={{fontSize:20,fontWeight:700,color:'var(--color-primary)',margin:'8px 0 24px'}}>+{xp} XP</p><button className="btn btn--primary btn--lg btn--full" onClick={()=>navigate('/learner/dashboard')}>Về trang chủ</button></div></LearnerLayout>;
  if (cards.length===0) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Ôn tập</div></div>}><div className="empty-state"><div className="empty-state__icon">🎉</div><div className="empty-state__title">Không có thẻ cần ôn</div><button className="btn btn--primary" style={{marginTop:16}} onClick={()=>navigate('/learner/dashboard')}>Về trang chủ</button></div></LearnerLayout>;

  const card=cards[idx];
  // Daily review: lật thẻ để xem đáp án (dùng options[correctIndex] làm mặt sau)
  const cardBack = card.options ? card.options[card.correctIndex] : '';
  const rate=(rating)=>{saveCardReview(card.id,rating);const r=reviewed+1;setReviewed(r);if(idx<cards.length-1){setIdx(idx+1);setFlipped(false);}else{const tx=r*2;completeItem('daily_review',tx);setXp(tx);setDone(true);showToast(`✅ Đã ôn ${r} thẻ! +${tx} XP`);}};

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Ôn tập</div><div style={{fontSize:13,color:'var(--color-text-muted)'}}>{idx+1}/{cards.length}</div></div>}>
      <div style={{padding:16}}>
        <div className="progress-bar" style={{marginBottom:16}}><div className="progress-bar__fill" style={{width:`${((idx+1)/cards.length)*100}%`}}/></div>
        <div className={`flashcard${flipped?' flashcard--flipped':''}`} onClick={()=>setFlipped(!flipped)}><div className="flashcard__inner"><div className="flashcard__face"><span className="flashcard__text">{card.front}</span></div><div className="flashcard__face flashcard__back"><span className="flashcard__text">{cardBack}</span></div></div></div>
        <p style={{textAlign:'center',fontSize:12,color:'var(--color-text-muted)',marginTop:8}}>Chạm để lật</p>
        {flipped&&<div style={{marginTop:20}}><p style={{textAlign:'center',fontSize:14,fontWeight:600,marginBottom:12}}>Bạn nhớ được bao nhiêu?</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {[{label:'Quên',key:'forgot',color:'#EF4444'},{label:'Khó',key:'hard',color:'#F59E0B'},{label:'Ổn',key:'ok',color:'#3B82F6'},{label:'Dễ',key:'easy',color:'#10B981'}].map(b=><button key={b.key} className="btn" style={{background:b.color,color:'#fff'}} onClick={()=>rate(b.key)}>{b.label}</button>)}</div></div>}
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
