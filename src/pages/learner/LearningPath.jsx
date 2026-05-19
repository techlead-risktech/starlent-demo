import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningState } from '../../utils/auth.js';
import { courses, getCourseProgress } from '../../data/mockCourses.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { PageSkeleton } from '../../components/common/Skeleton.jsx';

export default function LearningPath() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ls, setLs] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { const t=setTimeout(()=>{setLs(getLearningState());setLoading(false);},300); return ()=>clearTimeout(t); }, []);

  if (loading) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Lộ trình học</div></div>}><PageSkeleton/></LearnerLayout>;

  const filtered = courses.filter(c => {
    if (filter==='required') return c.required;
    if (filter==='optional') return !c.required;
    if (filter==='completed') return getCourseProgress(c,ls?.completedItems||[])===100;
    if (filter==='inprogress') { const p=getCourseProgress(c,ls?.completedItems||[]); return p>0&&p<100; }
    return true;
  });

  return (
    <LearnerLayout topBar={<div className="page__header"><div className="page__title">Lộ trình học</div></div>}>
      <div className="tabs" style={{marginBottom:16}}>
        {[{key:'all',label:'Tất cả'},{key:'required',label:'Bắt buộc'},{key:'optional',label:'Tự chọn'},{key:'inprogress',label:'Đang học'},{key:'completed',label:'Hoàn thành'}].map(t=>(
          <button key={t.key} className={`tab${filter===t.key?' tab--active':''}`} onClick={()=>setFilter(t.key)}>{t.label}</button>
        ))}
      </div>
      {filtered.length===0 ? (
        <div className="empty-state"><div className="empty-state__icon">📚</div><div className="empty-state__title">Không có khoá học nào</div></div>
      ) : (
        <div className="grid-2">
          {filtered.map(course => {
            const prog = getCourseProgress(course, ls?.completedItems||[]);
            return (
              <div key={course.id} className="card card--hoverable" onClick={()=>navigate(`/learner/course/${course.id}`)}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:36}}>📖</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15}}>{course.title}</div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
                      {course.tags.map(t=><span key={t} className="chip">{t}</span>)}
                      {course.required&&<span className="badge badge--warning">Bắt buộc</span>}
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12}}>
                  <div className="progress-bar" style={{flex:1}}><div className="progress-bar__fill" style={{width:`${prog}%`}}/></div>
                  <span style={{fontSize:12,fontWeight:600}}>{prog}%</span>
                </div>
                <div style={{display:'flex',gap:12,marginTop:8,fontSize:12,color:'var(--color-text-muted)'}}>
                  <span>⏱ {course.duration}p</span><span>📦 {course.moduleCount} module</span><span>⭐ {course.rating}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </LearnerLayout>
  );
}
