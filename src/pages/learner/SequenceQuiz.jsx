import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentById } from '../../data/mockContent.js';
import { completeItem } from '../../utils/auth.js';
import { useToast, usePreventLeave } from '../../hooks/useToast.js';
import { useLessonDirty } from '../../hooks/useLessonGuard.jsx';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import LeaveConfirmModal from '../../components/common/LeaveConfirmModal.jsx';

function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

export default function SequenceQuiz() {
  const { contentId } = useParams(); const navigate = useNavigate(); const { toast, showToast } = useToast();
  const [content, setContent] = useState(null); const [items, setItems] = useState([]);
  const [done, setDone] = useState(false); const [attempts, setAttempts] = useState(0);

  useEffect(()=>{const c=getContentById(contentId);setContent(c);if(c)setItems(shuffle([...c.items]));},[contentId]);
  const isDirty = attempts > 0 && !done;
  usePreventLeave(isDirty);
  useLessonDirty(isDirty);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const handleBack = () => { if (isDirty) { setShowLeaveModal(true); return; } navigate(-1); };
  const handleLeave = () => { setShowLeaveModal(false); navigate(-1); };
  const handleStay = () => { setShowLeaveModal(false); };

  const move=(idx,dir)=>{const n=[...items];const t=idx+dir;if(t<0||t>=n.length)return;[n[idx],n[t]]=[n[t],n[idx]];setItems(n);};
  const check=()=>{setAttempts(a=>a+1);if(items.every((it,i)=>it.order===i+1)){completeItem(content.id,15);setDone(true);showToast('✅ Chính xác! +15 XP');}else showToast('❌ Chưa đúng, thử lại!');};

  if (!content) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><div className="empty-state">Đang tải...</div></LearnerLayout>;
  if (done) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">{content.title}</div></div>}><div style={{textAlign:'center',padding:40}}><div style={{fontSize:64}}>🎉</div><h2 style={{fontSize:24,fontWeight:800,margin:'8px 0'}}>Hoàn thành!</h2><p style={{fontSize:16,color:'var(--color-text-secondary)'}}>Số lần thử: {attempts}</p><button className="btn btn--primary btn--lg btn--full" style={{marginTop:24}} onClick={handleBack}>Quay lại</button></div></LearnerLayout>;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">{content.title}</div><div style={{fontSize:13,color:'var(--color-text-muted)'}}>Lần thử: {attempts}</div></div>}>
      <div style={{padding:16}}>
        <p style={{fontSize:14,color:'var(--color-text-secondary)',marginBottom:16}}>{content.description}</p>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
          {items.map((item,i)=><div key={item.id} className="card" style={{display:'flex',alignItems:'center',gap:8,padding:12}}>
            <span style={{fontWeight:700,fontSize:14,color:'var(--color-text-muted)',width:24}}>{i+1}</span>
            <span style={{flex:1,fontSize:14}}>{item.text}</span>
            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              <button className="btn btn--ghost btn--sm" style={{minHeight:28,padding:'2px 8px'}} onClick={()=>move(i,-1)} disabled={i===0}>↑</button>
              <button className="btn btn--ghost btn--sm" style={{minHeight:28,padding:'2px 8px'}} onClick={()=>move(i,1)} disabled={i===items.length-1}>↓</button>
            </div>
          </div>)}
        </div>
        <button className="btn btn--primary btn--lg btn--full" onClick={check}>Kiểm tra</button>
        <button className="btn btn--ghost btn--full" style={{marginTop:8}} onClick={()=>setItems(shuffle([...content.items]))}>Xáo trộn lại</button>
      </div>
      {toast&&<div className="toast">{toast}</div>}
      <LeaveConfirmModal open={showLeaveModal} onStay={handleStay} onLeave={handleLeave} />
    </LearnerLayout>
  );
}
