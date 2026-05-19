import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useOnlineStatus } from '../../hooks/useToast.js';
import { getLearningState } from '../../utils/auth.js';
import { courses, getCourseProgress } from '../../data/mockCourses.js';
import { getNotificationsForUser } from '../../data/mockChats.js';
import { isOnboarded } from '../../utils/auth.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';
import { SkeletonText, SkeletonCard } from '../../components/common/Skeleton.jsx';
import Modal from '../../components/common/Modal.jsx';

function Greeting({ name }) {
  const h = new Date().getHours();
  let g = 'Chào buổi sáng';
  if (h >= 12 && h < 17) g = 'Chào buổi chiều';
  else if (h >= 17) g = 'Chào buổi tối';
  return <span>{g}, <strong>{name}</strong>!</span>;
}

export default function LearnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(true);
  const [ls, setLs] = useState(null);

  useEffect(() => {
    if (!isOnboarded()) { navigate('/onboarding'); return; }
    const t = setTimeout(() => { setLs(getLearningState()); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, [navigate]);

  if (loading) {
    return (
      <LearnerLayout>
        <div style={{padding:16}}>
          <SkeletonText width="60%"/><SkeletonText width="40%"/>
          <div style={{height:16}}/><SkeletonCard/>
          <div style={{height:12}}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
            <SkeletonCard/><SkeletonCard/><SkeletonCard/><SkeletonCard/>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  const streak = ls?.streak || user?.streak || 0;
  const xp = ls?.xp || user?.xp || 0;
  const level = Math.floor(xp / 500) + 1;
  const xpToNext = 500 - (xp % 500);
  const userNotis = getNotificationsForUser(user?.id).filter(n => !n.read);
  const inProgress = courses.filter(c => { const p = getCourseProgress(c, ls?.completedItems||[]); return p > 0 && p < 100; });
  const required = courses.filter(c => c.required);

  return (
    <LearnerLayout
      topBar={
        <div className="page__header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:14,color:'var(--color-text-muted)'}}><Greeting name={user?.name?.split(' ').pop()}/></div>
            <div style={{fontSize:24,fontWeight:800,marginTop:2}}>Hôm nay bạn muốn học gì?</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn--ghost btn--sm" onClick={()=>navigate('/learner/notifications')} style={{position:'relative'}}>
              🔔 {userNotis.length>0 && <span style={{position:'absolute',top:0,right:0,width:8,height:8,borderRadius:'50%',background:'var(--color-danger)'}}/>}
            </button>
            <button className="btn btn--ghost btn--sm" onClick={()=>navigate('/learner/search')}>🔍</button>
          </div>
        </div>
      }
    >
      {/* Stat cards */}
      <div className="grid-4" style={{marginBottom:20}}>
        <div className="stat-card"><div className="stat-card__label">🔥 Streak</div><div className="stat-card__value">{streak} <span style={{fontSize:14}}>ngày</span></div></div>
        <div className="stat-card"><div className="stat-card__label">⭐ Tổng XP</div><div className="stat-card__value">{xp.toLocaleString()}</div><div className="progress-bar" style={{marginTop:8}}><div className="progress-bar__fill" style={{width:`${(xp%500)/5}%`}}/></div><div style={{fontSize:10,color:'var(--color-text-muted)',marginTop:4}}>Còn {xpToNext} XP nữa lên cấp {level+1}</div></div>
        <div className="stat-card"><div className="stat-card__label">🎯 Cấp độ</div><div className="stat-card__value">{level}</div></div>
        <div className="stat-card"><div className="stat-card__label">📝 Hôm nay</div><div className="stat-card__value">{ls?.completedItems?.length||0} <span style={{fontSize:14}}>bài</span></div></div>
      </div>

      {/* Continue learning */}
      {inProgress.length > 0 && (
        <div style={{marginBottom:20}}>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>📖 Tiếp tục học</h3>
          <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8}}>
            {inProgress.map(course => {
              const prog = getCourseProgress(course, ls?.completedItems||[]);
              return (
                <div key={course.id} className="card card--hoverable" style={{minWidth:260,flexShrink:0}} onClick={()=>navigate(`/learner/course/${course.id}`)}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <span style={{fontSize:28}}>📖</span>
                    <div><div style={{fontWeight:700,fontSize:14}}>{course.title}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{course.moduleCount} module</div></div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}><div className="progress-bar" style={{flex:1}}><div className="progress-bar__fill" style={{width:`${prog}%`}}/></div><span style={{fontSize:12,fontWeight:600}}>{prog}%</span></div>
                  {course.dueDate && <div style={{fontSize:11,color:'var(--color-warning)',marginTop:4}}>⏰ Hạn: {new Date(course.dueDate).toLocaleDateString('vi-VN')}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Required courses */}
      {required.length > 0 && (
        <div style={{marginBottom:20}}>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>🎯 Khoá học bắt buộc</h3>
          <div className="grid-2">
            {required.map(course => {
              const prog = getCourseProgress(course, ls?.completedItems||[]);
              return (
                <div key={course.id} className="card card--hoverable" onClick={()=>navigate(`/learner/course/${course.id}`)}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}><div style={{fontWeight:700,fontSize:15,flex:1}}>{course.title}</div><span className="badge badge--warning">Bắt buộc</span></div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}><div className="progress-bar" style={{flex:1}}><div className="progress-bar__fill" style={{width:`${prog}%`}}/></div><span style={{fontSize:12,fontWeight:600}}>{prog}%</span></div>
                  <button className="btn btn--primary btn--sm btn--full" style={{marginTop:12}} onClick={e=>{e.stopPropagation();navigate(`/learner/course/${course.id}`);}}>{prog===0?'🚀 Bắt đầu học':'Tiếp tục'}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily review */}
      <div style={{marginBottom:20}}>
        <div className="card" style={{background:'linear-gradient(135deg,#FFF7ED,#FFF0EB)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:36}}>🔄</span><div><div style={{fontWeight:700,fontSize:16}}>Ôn tập hàng ngày</div><div style={{fontSize:13,color:'var(--color-text-secondary)'}}>{Object.keys(ls?.reviewedCards||{}).length>0?`Bạn đã ôn ${Object.keys(ls?.reviewedCards||{}).length} thẻ`:'Bắt đầu ôn tập để ghi nhớ lâu hơn'}</div></div></div>
            <button className="btn btn--primary" onClick={()=>navigate('/learner/daily-review')}>Ôn tập</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {userNotis.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><h3 style={{fontSize:16,fontWeight:700}}>🔔 Thông báo</h3><button style={{fontSize:13,color:'var(--color-primary)',fontWeight:600}} onClick={()=>navigate('/learner/notifications')}>Xem tất cả</button></div>
          {userNotis.slice(0,3).map(n=><div key={n.id} className="card" style={{marginBottom:8,padding:12}}><div style={{fontWeight:600,fontSize:14}}>{n.title}</div><div style={{fontSize:13,color:'var(--color-text-secondary)'}}>{n.body}</div></div>)}
        </div>
      )}
    </LearnerLayout>
  );
}
