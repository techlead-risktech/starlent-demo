import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '../../data/mockCourses.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function SearchResult() {
  const navigate=useNavigate(); const [q,setQ]=useState(''); const [r,setR]=useState(null);
  const search=()=>{if(!q.trim())return;setR({courses:courses.filter(c=>c.title.toLowerCase().includes(q.toLowerCase())||c.tags.some(t=>t.toLowerCase().includes(q.toLowerCase())))})};

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Tìm kiếm</div></div>}>
      <div style={{padding:16}}>
        <input className="input" style={{marginBottom:8}} placeholder="Tìm kiếm khoá học..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')search();}}/>
        <button className="btn btn--primary btn--full" onClick={search}>🔍 Tìm kiếm</button>
        {r===null?<div className="empty-state" style={{marginTop:40}}><div className="empty-state__icon">🔍</div><div className="empty-state__title">Nhập từ khoá để tìm kiếm</div></div>
        :r.courses.length===0?<div className="empty-state" style={{marginTop:40}}><div className="empty-state__icon">😕</div><div className="empty-state__title">Không tìm thấy kết quả</div></div>
        :<div style={{marginTop:16}}><h4 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Khoá học ({r.courses.length})</h4>{r.courses.map(c=><div key={c.id} className="card card--hoverable" style={{marginBottom:8}} onClick={()=>navigate(`/learner/course/${c.id}`)}><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:28}}>📖</span><div><div style={{fontWeight:700,fontSize:14}}>{c.title}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{c.moduleCount} module · ⭐ {c.rating}</div></div></div></div>)}</div>}
      </div>
    </LearnerLayout>
  );
}
