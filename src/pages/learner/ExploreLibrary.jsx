import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '../../data/mockCourses.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function ExploreLibrary() {
  const navigate=useNavigate(); const [q,setQ]=useState('');
  const filtered=courses.filter(c=>!q||c.title.toLowerCase().includes(q.toLowerCase())||c.tags.some(t=>t.toLowerCase().includes(q.toLowerCase())));

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Khám phá</div></div>}>
      <div style={{padding:16}}>
        <input className="input" style={{marginBottom:16}} placeholder="🔍 Tìm khoá học..." value={q} onChange={e=>setQ(e.target.value)}/>
        <div className="tabs" style={{marginBottom:16}}>
          {['Tất cả','Kỹ năng mềm','Bảo mật','Năng suất','Teamwork'].map(t=><button key={t} className={`tab${(t==='Tất cả'?!q:q===t)?' tab--active':''}`} onClick={()=>setQ(t==='Tất cả'?'':t)}>{t}</button>)}
        </div>
        {filtered.length===0?<div className="empty-state"><div className="empty-state__icon">🔍</div><div className="empty-state__title">Không tìm thấy</div></div>
        :<div className="grid-2">{filtered.map(c=><div key={c.id} className="card card--hoverable" onClick={()=>navigate(`/learner/course/${c.id}`)}><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:36}}>📖</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{c.title}</div><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>{c.tags.map(t=><span key={t} className="chip">{t}</span>)}</div><div style={{fontSize:12,color:'var(--color-text-muted)',marginTop:4}}>⏱{c.duration}p · 📦{c.moduleCount} · ⭐{c.rating}</div></div></div></div>)}</div>}
      </div>
    </LearnerLayout>
  );
}
