import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { courses, COURSE_STATUS } from '../../data/mockCourses.js';

export default function EditorDashboard() {
  const {user}=useAuth(); const [params,setParams]=useSearchParams(); const tab=params.get('tab')||'overview';

  return (
    <AdminLayout title="Biên tập nội dung">
      <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Xin chào, {user?.name}</h2>
      <p style={{fontSize:14,color:'var(--color-text-muted)',marginBottom:20}}>Vai trò: Biên tập nội dung</p>
      <div className="tabs" style={{marginBottom:20}}>
        {[{key:'overview',label:'📊 Tổng quan'},{key:'courses',label:'📚 Khoá học'},{key:'content',label:'📝 Nội dung'},{key:'publish',label:'✅ Xuất bản'}].map(t=><button key={t.key} className={`tab${tab===t.key?' tab--active':''}`} onClick={()=>setParams({tab:t.key})}>{t.label}</button>)}
      </div>

      {tab==='overview'&&<>
        <div className="grid-3" style={{marginBottom:20}}>
          <div className="stat-card"><div className="stat-card__label">Tổng khoá</div><div className="stat-card__value">{courses.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">Đã XB</div><div className="stat-card__value">{courses.filter(c=>c.status===COURSE_STATUS.PUBLISHED).length}</div></div>
          <div className="stat-card"><div className="stat-card__label">Nháp</div><div className="stat-card__value">{courses.filter(c=>c.status===COURSE_STATUS.DRAFT).length}</div></div>
        </div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Khoá học</h3>
        {courses.map(c=><div key={c.id} className="card" style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontWeight:700}}>{c.title}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{c.moduleCount} module · {c.duration}p</div></div><span className={`badge ${c.status===COURSE_STATUS.PUBLISHED?'badge--success':'badge--warning'}`}>{c.status}</span></div></div>)}
      </>}

      {tab==='courses'&&<div>
        <button className="btn btn--primary btn--full" style={{marginBottom:16}}>+ Tạo khoá học mới</button>
        {courses.map(c=><div key={c.id} className="card" style={{marginBottom:8}}><div style={{fontWeight:700,fontSize:15}}>{c.title}</div><div style={{fontSize:12,color:'var(--color-text-muted)',margin:'4px 0'}}><span className={`badge ${c.status===COURSE_STATUS.PUBLISHED?'badge--success':'badge--warning'}`}>{c.status}</span></div><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{c.tags.map(t=><span key={t} className="chip">{t}</span>)}</div><div style={{display:'flex',gap:8,marginTop:8}}><button className="btn btn--ghost btn--sm">✏️ Sửa</button><button className="btn btn--ghost btn--sm">📋 Module</button><button className="btn btn--ghost btn--sm">👁️ Xem</button></div></div>)}
      </div>}

      {tab==='content'&&<div>
        {[{icon:'📝',label:'Flashcard',count:'4 bộ · 3 đã XB'},{icon:'🎬',label:'Video',count:'5 video · 5 đã XB'},{icon:'🎧',label:'Audio',count:'4 audio · 4 đã XB'},{icon:'📝',label:'Quiz',count:'6 quiz + 3 seq · đã XB'},{icon:'🎭',label:'Role-play',count:'5 tình huống · đã XB'}].map(item=><div key={item.label} className="card" style={{marginBottom:8}}><div style={{fontWeight:700,marginBottom:4}}>{item.icon} {item.label}</div><div style={{fontSize:13,color:'var(--color-text-muted)'}}>{item.count}</div><button className="btn btn--ghost btn--sm" style={{marginTop:8}}>Quản lý</button></div>)}
      </div>}

      {tab==='publish'&&<div>
        {courses.map(c=><div key={c.id} className="card" style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontWeight:700}}>{c.title}</div><span className={`badge ${c.status===COURSE_STATUS.PUBLISHED?'badge--success':'badge--warning'}`}>{c.status}</span></div><button className={`btn btn--sm ${c.status===COURSE_STATUS.PUBLISHED?'btn--secondary':'btn--success'}`}>{c.status===COURSE_STATUS.PUBLISHED?'Huỷ XB':'Xuất bản'}</button></div></div>)}
      </div>}
    </AdminLayout>
  );
}
