import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningState } from '../../utils/auth.js';
import { courses } from '../../data/mockCourses.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function OfflineLibrary() {
  const navigate=useNavigate(); const {toast,showToast}=useToast();
  const ls=getLearningState(); const downloads=ls?.offlineDownloads||[];
  const storageMB=downloads.length*4.2;

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Thư viện ngoại tuyến</div></div>}>
      <div style={{padding:16}}>
        <div className="card" style={{marginBottom:20}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontWeight:700,fontSize:16}}>📥 {downloads.length} nội dung</div><div style={{fontSize:13,color:'var(--color-text-muted)'}}>{storageMB.toFixed(1)} MB đã tải</div></div><button className="btn btn--primary btn--sm" onClick={()=>showToast('🔄 Đồng bộ hoá... (mock)')}>🔄 Đồng bộ</button></div></div>
        {downloads.length===0?<div className="empty-state"><div className="empty-state__icon">📥</div><div className="empty-state__title">Chưa có nội dung tải về</div><div className="empty-state__desc">Tải nội dung từ khoá học để học ngoại tuyến.</div><button className="btn btn--primary" style={{marginTop:16}} onClick={()=>navigate('/learner/explore')}>Khám phá khoá học</button></div>
        :downloads.map(d=>{const course=courses.find(c=>c.id===d);return(<div key={d} className="card" style={{marginBottom:8}}><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:28}}>📖</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{course?.title||d}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>Đã tải · {course?.moduleCount||0} module</div></div><span className="badge badge--success">Đã tải</span></div></div>);})}
        {downloads.length>0&&<div style={{marginTop:16,fontSize:12,color:'var(--color-text-muted)',textAlign:'center'}}>⚠️ Một số nội dung có thể cần đồng bộ lại</div>}
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
