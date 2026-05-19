import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { users } from '../../data/mockUsers.js';
import { learnerProgressDetail, courseProgressReport, quizResults, reportSummary } from '../../data/mockReports.js';
import { conversations } from '../../data/mockChats.js';

export default function TrainerDashboard() {
  const {user}=useAuth(); const [params,setParams]=useSearchParams(); const tab=params.get('tab')||'overview';
  const learners=users.filter(u=>u.role==='learner');

  return (
    <AdminLayout title="Giảng viên">
      <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Xin chào, {user?.name}</h2>
      <p style={{fontSize:14,color:'var(--color-text-muted)',marginBottom:20}}>Vai trò: Giảng viên</p>
      <div className="tabs" style={{marginBottom:20}}>
        {[{key:'overview',label:'📊 Tổng quan'},{key:'learners',label:'👥 Học viên'},{key:'chats',label:'💬 Trò chuyện'},{key:'stats',label:'📈 Thống kê'}].map(t=><button key={t.key} className={`tab${tab===t.key?' tab--active':''}`} onClick={()=>setParams({tab:t.key})}>{t.label}</button>)}
      </div>

      {tab==='overview'&&<>
        <div className="grid-4" style={{marginBottom:20}}>
          <div className="stat-card"><div className="stat-card__label">Học viên</div><div className="stat-card__value">{learners.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">Hoàn thành</div><div className="stat-card__value">{reportSummary.completionRate}%</div></div>
          <div className="stat-card"><div className="stat-card__label">Điểm TB</div><div className="stat-card__value">{reportSummary.averageScore}</div></div>
          <div className="stat-card"><div className="stat-card__label">SLA Chat</div><div className="stat-card__value">{reportSummary.chatResponseSLA}%</div></div>
        </div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Học viên gần đây</h3>
        {learnerProgressDetail.slice(0,5).map(l=><div key={l.userId} className="card" style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',alignItems:'center',gap:12}}><div className="avatar avatar--sm">{l.userName.charAt(0)}</div><div><div style={{fontWeight:700}}>{l.userName}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{l.department} · 🔥{l.streak}</div></div></div><div style={{textAlign:'right'}}><div style={{fontWeight:700}}>{l.avgScore}đ</div><div style={{fontSize:11,color:'var(--color-text-muted)'}}>{l.coursesCompleted}/{l.coursesEnrolled} khoá</div></div></div></div>)}
      </>}

      {tab==='learners'&&<div className="table-wrapper"><table className="table"><thead><tr><th>Tên</th><th>Phòng ban</th><th>Khoá học</th><th>Điểm</th><th>Streak</th><th>HĐ cuối</th></tr></thead><tbody>{learnerProgressDetail.map(l=><tr key={l.userId}><td><strong>{l.userName}</strong></td><td>{l.department}</td><td>{l.coursesCompleted}/{l.coursesEnrolled}</td><td>{l.avgScore}</td><td>🔥{l.streak}</td><td>{l.lastActive}</td></tr>)}</tbody></table></div>}

      {tab==='chats'&&conversations.map(conv=>{const lid=conv.participants.find(p=>p!==user?.id);const l=users.find(u=>u.id===lid);const last=conv.messages[conv.messages.length-1];return(<div key={conv.id} className="card" style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',alignItems:'center',gap:12}}><div className="avatar">{l?.name?.charAt(0)||'?'}</div><div><div style={{fontWeight:700}}>{l?.name||conv.groupName}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{last?.text?.slice(0,60)}</div></div></div><div>{conv.unread>0&&<span className="badge badge--danger">{conv.unread}</span>} {conv.resolved?<span className="badge badge--success">Đã GP</span>:<span className="badge badge--warning">Chưa GP</span>} <button className="btn btn--ghost btn--sm">Trả lời</button></div></div></div>)})}

      {tab==='stats'&&<div><h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Tiến độ khoá học</h3>{courseProgressReport.map(c=><div key={c.courseId} className="chart-bar-row"><div className="chart-bar-label">{c.courseName}</div><div className="chart-bar-track"><div className="chart-bar-fill" style={{width:`${c.avgScore}%`,background:'var(--color-secondary)'}}/></div><div className="chart-bar-value">{c.avgScore}%</div></div>)}<h3 style={{fontSize:16,fontWeight:700,margin:'20px 0 12px'}}>Quiz</h3>{quizResults.map(q=><div key={q.quizId} className="chart-bar-row"><div className="chart-bar-label">{q.quizName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{width:`${q.passRate}%`}}/></div><div className="chart-bar-value">{q.passRate}%</div></div>)}</div>}
    </AdminLayout>
  );
}
