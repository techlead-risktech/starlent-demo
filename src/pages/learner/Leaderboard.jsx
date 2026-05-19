import { useAuth } from '../../hooks/useAuth.jsx';
import { users } from '../../data/mockUsers.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function Leaderboard() {
  const { user } = useAuth();
  const learners = users.filter(u=>u.role==='learner').sort((a,b)=>b.xp-a.xp);
  const myRank = learners.findIndex(l=>l.id===user?.id)+1;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Bảng xếp hạng</div></div>}>
      <div style={{padding:16}}>
        <div style={{textAlign:'center',padding:20,background:'linear-gradient(135deg,#FFF7ED,#FFF0EB)',borderRadius:'var(--radius-lg)',marginBottom:20}}>
          <div style={{fontSize:36}}>🏆</div><div style={{fontSize:13,color:'var(--color-text-muted)'}}>Bạn đang đứng thứ</div>
          <div style={{fontSize:36,fontWeight:800,color:'var(--color-primary)'}}>#{myRank||'—'}</div>
        </div>
        {learners.map((l,i)=>{const isMe=l.id===user?.id;const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';const level=Math.floor(l.xp/500)+1;return(
          <div key={l.id} className="card" style={{marginBottom:8,background:isMe?'var(--color-primary-light)':'var(--color-surface)',borderColor:isMe?'var(--color-primary)':'var(--color-border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:32,textAlign:'center',fontSize:18,fontWeight:700}}>{medal||i+1}</div>
              <div className="avatar avatar--sm">{l.name.charAt(0)}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{l.name}{isMe&&' (Bạn)'}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{l.department}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontWeight:700,fontSize:15,color:'var(--color-primary)'}}>{l.xp.toLocaleString()} XP</div><div style={{fontSize:11,color:'var(--color-text-muted)'}}>Cấp {level} · 🔥{l.streak}</div></div>
            </div>
          </div>
        );})}
      </div>
    </LearnerLayout>
  );
}
