import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getLearningState } from '../../utils/auth.js';
import { badges, getCertificatesForUser } from '../../data/mockChats.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function Profile() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const ls = getLearningState(); const certs = getCertificatesForUser(user?.id);
  const level = Math.floor((ls?.xp||user?.xp||0)/500)+1;
  const unlocked = badges.filter(b=>b.unlockedAt!==null||ls?.unlockedBadges?.includes(b.id));

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Hồ sơ</div></div>}>
      <div style={{padding:16}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div className="avatar avatar--lg" style={{margin:'0 auto 12px',fontSize:32,background:'var(--color-primary)',color:'#fff'}}>{user?.name?.charAt(0)}</div>
          <h2 style={{fontSize:22,fontWeight:800}}>{user?.name}</h2><p style={{fontSize:14,color:'var(--color-text-secondary)'}}>{user?.department}</p>
          <span className="badge badge--primary">Cấp {level}</span>
        </div>
        <div className="grid-3" style={{marginBottom:24}}>
          <div className="stat-card"><div className="stat-card__label">🔥 Streak</div><div className="stat-card__value">{ls?.streak||user?.streak||0}</div></div>
          <div className="stat-card"><div className="stat-card__label">⭐ XP</div><div className="stat-card__value">{(ls?.xp||user?.xp||0).toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-card__label">📚 Khoá học</div><div className="stat-card__value">{ls?.completedCourses?.length||0}</div></div>
        </div>
        {unlocked.length>0&&<div style={{marginBottom:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>🏅 Huy hiệu ({unlocked.length})</h3><div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{unlocked.map(b=><div key={b.id} className="card" style={{padding:12,textAlign:'center',minWidth:80}}><div style={{fontSize:28}}>{b.icon}</div><div style={{fontSize:11,fontWeight:600}}>{b.name}</div></div>)}</div></div>}
        {certs.length>0&&<div style={{marginBottom:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>🎓 Chứng chỉ</h3>{certs.map(c=><div key={c.id} className="card" style={{marginBottom:8}} onClick={()=>navigate(`/learner/certificate/${c.id}`)}><div style={{fontWeight:700,fontSize:14}}>{c.courseName}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{new Date(c.completionDate).toLocaleDateString('vi-VN')} · {c.score} điểm</div></div>)}</div>}
        <button className="btn btn--secondary btn--full" style={{marginBottom:8}} onClick={()=>navigate('/learner/settings')}>⚙️ Cài đặt</button>
        <button className="btn btn--ghost btn--full" style={{color:'var(--color-danger)'}} onClick={()=>{logout();navigate('/login');}}>🚪 Đăng xuất</button>
      </div>
    </LearnerLayout>
  );
}
