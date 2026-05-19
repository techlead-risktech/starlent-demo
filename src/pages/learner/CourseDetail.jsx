import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courses, getCourseProgress, getUnlockedModules } from '../../data/mockCourses.js';
import { getLearningState, completeModule, completeCourse } from '../../utils/auth.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { PageSkeleton } from '../../components/common/Skeleton.jsx';
import Modal from '../../components/common/Modal.jsx';

// Kiểm tra module đã hoàn thành chưa (tất cả item đều done)
// Hỗ trợ cả itemId (i1) và contentId (fc1) để tương thích dữ liệu cũ
function isModuleDone(mod, completedItems) {
  return mod.items.every(item => completedItems.includes(item.id) || completedItems.includes(item.contentId));
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ls, setLs] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // force re-read khi quay lại
  const [showCongrats, setShowCongrats] = useState(false);
  const [newCertId, setNewCertId] = useState(null);

  // Luôn đọc lại learning state khi vào trang (kể cả navigate back)
  useEffect(()=>{
    const t=setTimeout(()=>{
      const state = getLearningState();
      // Đồng bộ: nếu tất cả item trong module done → đánh dấu module done
      // Nếu tất cả module done → đánh dấu course done
      if (courseId) {
        const course = courses.find(c=>c.id===courseId);
        if (course) {
          let stateChanged = false;
          course.modules.forEach(mod => {
            if (isModuleDone(mod, state.completedItems) && !state.completedModules.includes(mod.id)) {
              completeModule(mod.id);
              stateChanged = true;
            }
          });
          const allModsDone = course.modules.every(mod => isModuleDone(mod, state.completedItems));
          if (allModsDone && !state.completedCourses.includes(courseId)) {
            completeCourse(courseId, {
              courseName: course.title,
              duration: course.duration,
              score: 85 + Math.floor(Math.random() * 11),
            });
            const fresh = getLearningState();
            const newCert = fresh.localCerts.find(c => c.courseId === courseId);
            if (newCert) {
              setNewCertId(newCert.id);
              setShowCongrats(true);
            }
            stateChanged = true;
          }
          if (stateChanged) {
            setLs(getLearningState());
            setLoading(false);
            return;
          }
        }
      }
      setLs(state);
      setLoading(false);
    },200);
    return ()=>clearTimeout(t);
  },[courseId, refreshKey]);

  const course = courses.find(c=>c.id===courseId);
  if (loading) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Đang tải...</div></div>}><PageSkeleton/></LearnerLayout>;
  if (!course) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Không tìm thấy</div></div>}><div className="empty-state"><div className="empty-state__icon">🔍</div><div className="empty-state__title">Khoá học không tồn tại</div></div></LearnerLayout>;

  const progress = getCourseProgress(course, ls?.completedItems||[]);
  // Module được mở khoá khi module trước đã hoàn thành
  const unlocked = getUnlockedModules(course, ls?.completedModules||[]);

  // Truyền itemId + moduleId + courseId để theo dõi tiến trình khoá học
  const goToItem = (item, moduleId) => {
    const base = {flashcard:'flashcard',video:'video',audio:'audio',quiz_mc:'quiz',quiz_sequence:'sequence',roleplay:'roleplay'};
    const type = base[item.type]||'flashcard';
    navigate(`/learner/${type}/${item.contentId}?itemId=${item.id}&moduleId=${moduleId}&courseId=${course.id}`);
  };

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={()=>navigate(-1)} style={{marginBottom:8}}>← Quay lại</button><div className="page__title">{course.title}</div></div>}>
      <div className="card" style={{marginBottom:20}}>
        <p style={{fontSize:14,color:'var(--color-text-secondary)',marginBottom:12}}>{course.description}</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
          {course.tags.map(t=><span key={t} className="chip">{t}</span>)}
          {course.required&&<span className="badge badge--warning">Bắt buộc</span>}
        </div>
        <div style={{fontSize:13,color:'var(--color-text-muted)'}}>⏱ {course.duration} phút · 📦 {course.moduleCount} module · ⭐ {course.rating}</div>
        {course.dueDate&&<div style={{fontSize:12,color:'var(--color-warning)',marginTop:4}}>⏰ Hạn: {new Date(course.dueDate).toLocaleDateString('vi-VN')}</div>}
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12}}><div className="progress-bar" style={{flex:1}}><div className="progress-bar__fill" style={{width:`${progress}%`}}/></div><span style={{fontSize:13,fontWeight:600}}>{progress}%</span></div>
        <button className="btn btn--primary btn--full" style={{marginTop:12}} disabled={progress===100} onClick={()=>{const mod=course.modules.find(m=>m.items.some(i=>!ls?.completedItems?.includes(i.id)));const f=mod?.items.find(i=>!ls?.completedItems?.includes(i.id));if(f)goToItem(f, mod.id);}}>{progress===100?'✅ Đã hoàn thành':(progress===0?'🚀 Bắt đầu học':'Tiếp tục học')}</button>
      </div>

      <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>Nội dung khoá học</h3>
      {course.modules.map((mod,idx)=>{
        const open = unlocked.includes(mod.id);
        const done = ls?.completedModules?.includes(mod.id);
        return (
          <div key={mod.id} className="card" style={{marginBottom:12,opacity:open?1:0.5}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:20}}>{isModuleDone(mod, ls?.completedItems||[])?'✅':(open?'📝':'🔒')}</span>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>Module {idx+1}: {mod.title}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{mod.items.filter(i=>ls?.completedItems?.includes(i.id)).length}/{mod.items.length} bài học</div></div>
            </div>
            {open && mod.items.map(item=>{
              const itemDone = ls?.completedItems?.includes(item.id);
              return (
                <div key={item.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderTop:'1px solid var(--color-divider)'}}>
                  <span>{itemDone?'✅':'○'}</span><span style={{flex:1,fontSize:13}}>{item.title}</span>
                  <button className="btn btn--ghost btn--sm" onClick={()=>goToItem(item, mod.id)}>{itemDone?'Xem lại':'Học'} →</button>
                </div>
              );
            })}
            {!open && <div style={{fontSize:12,color:'var(--color-text-muted)',fontStyle:'italic'}}>Hoàn thành module trước để mở khoá</div>}
          </div>
        );
      })}

      {showCongrats && (
        <Modal open={true} centered onClose={()=>setShowCongrats(false)}>
          <div style={{textAlign:'center',padding:8}}>
            <div style={{fontSize:64}}>🎉</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Chúc mừng!</h2>
            <p style={{fontSize:15,color:'var(--color-text-secondary)',marginBottom:16}}>
              Bạn đã hoàn thành <strong>{course.title}</strong>.<br/>Chứng chỉ đã được tạo.
            </p>
            <button className="btn btn--primary btn--full" style={{marginBottom:8}} onClick={()=>{setShowCongrats(false);navigate(`/learner/certificate/${newCertId}`);}}>🎓 Xem chứng chỉ</button>
            <button className="btn btn--ghost btn--full" onClick={()=>setShowCongrats(false)}>Để sau</button>
          </div>
        </Modal>
      )}
    </LearnerLayout>
  );
}
