import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { reportSummary, progressByDepartment, courseProgressReport, weakTopics } from '../../data/mockReports.js';
import { users } from '../../data/mockUsers.js';
import { courses } from '../../data/mockCourses.js';

export default function ManagerDashboard() {
  const {user}=useAuth(); const {toast,showToast}=useToast(); const [params,setParams]=useSearchParams(); const tab=params.get('tab')||'overview';

  return (
    <AdminLayout title="Quản lý đào tạo">
      <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Xin chào, {user?.name}</h2>
      <p style={{fontSize:14,color:'var(--color-text-muted)',marginBottom:20}}>Vai trò: Quản lý đào tạo</p>
      <div className="tabs" style={{marginBottom:20}}>
        {[{key:'overview',label:'📊 Tổng quan'},{key:'assign',label:'📋 Gán khoá học'},{key:'reports',label:'📈 Báo cáo'},{key:'certificates',label:'🎓 Chứng chỉ'},{key:'groups',label:'👥 Nhóm học'}].map(t=><button key={t.key} className={`tab${tab===t.key?' tab--active':''}`} onClick={()=>setParams({tab:t.key})}>{t.label}</button>)}
      </div>

      {tab==='overview'&&<>
        <div className="grid-4" style={{marginBottom:20}}>
          <div className="stat-card"><div className="stat-card__label">Học viên</div><div className="stat-card__value">{reportSummary.activeLearners}</div><div className="stat-card__change stat-card__change--up">+{reportSummary.activeLearnersChange}</div></div>
          <div className="stat-card"><div className="stat-card__label">Hoàn thành</div><div className="stat-card__value">{reportSummary.completionRate}%</div></div>
          <div className="stat-card"><div className="stat-card__label">Quá hạn</div><div className="stat-card__value" style={{color:'var(--color-danger)'}}>{reportSummary.overdueCourses}</div></div>
          <div className="stat-card"><div className="stat-card__label">Điểm TB</div><div className="stat-card__value">{reportSummary.averageScore}</div></div>
        </div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Tiến độ phòng ban</h3>
        {progressByDepartment.map(d=><div key={d.department} className="chart-bar-row"><div className="chart-bar-label">{d.department}</div><div className="chart-bar-track"><div className="chart-bar-fill" style={{width:`${d.completionRate}%`}}/></div><div className="chart-bar-value">{d.completionRate}%</div></div>)}
      </>}

      {tab==='assign'&&<div>
        <div className="card" style={{marginBottom:16}}>
          <div className="input-group" style={{marginBottom:12}}><label className="input-label">Khoá học</label><select className="input">{courses.map(c=><option key={c.id}>{c.title}</option>)}</select></div>
          <div className="input-group" style={{marginBottom:12}}><label className="input-label">Học viên / Nhóm</label><select className="input">{users.filter(u=>u.role==='learner').map(u=><option key={u.id}>{u.name} - {u.department}</option>)}</select></div>
          <div className="input-group" style={{marginBottom:12}}><label className="input-label">Hạn hoàn thành</label><input type="date" className="input"/></div>
          <button className="btn btn--primary btn--full" onClick={()=>showToast('✅ Đã gán khoá học (mock)')}>📋 Gán khoá học</button>
        </div>
        <h4 style={{fontSize:15,fontWeight:700,marginBottom:8}}>Đã gán</h4>
        {courses.slice(0,3).map(c=><div key={c.id} className="card" style={{marginBottom:8}}><div style={{fontWeight:700}}>{c.title}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>Gán: {c.required?'Tất cả':'Tự chọn'} · Hạn: {c.dueDate||'Không hạn'}</div></div>)}
      </div>}

      {tab==='reports'&&<div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Tiến độ khoá học</h3>
        {courseProgressReport.map(c=><div key={c.courseId} className="chart-bar-row"><div className="chart-bar-label">{c.courseName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{width:`${Math.round((c.completed/c.enrolled)*100)}%`}}/></div><div className="chart-bar-value">{Math.round((c.completed/c.enrolled)*100)}%</div></div>)}
        <h3 style={{fontSize:16,fontWeight:700,margin:'20px 0 12px'}}>Chủ đề yếu</h3>
        {weakTopics.map(w=><div key={w.topic} className="chart-bar-row"><div className="chart-bar-label">{w.topic}</div><div className="chart-bar-track"><div className="chart-bar-fill" style={{width:`${w.failRate}%`,background:'var(--color-danger)'}}/></div><div className="chart-bar-value">{w.failRate}%</div></div>)}
        <button className="btn btn--secondary btn--full" style={{marginTop:16}} onClick={()=>showToast('📥 Đang xuất CSV (mock)')}>📥 Xuất CSV</button>
      </div>}

      {tab==='certificates'&&<div>
        <div className="table-wrapper"><table className="table"><thead><tr><th>Học viên</th><th>Khoá học</th><th>Ngày</th><th>Điểm</th><th>Mã</th></tr></thead><tbody><tr><td>Nguyễn Văn An</td><td>An toàn thông tin</td><td>10/05/2026</td><td>88</td><td>SL-CERT-0001</td></tr><tr><td>Vũ Minh Tuấn</td><td>Kỹ năng giao tiếp</td><td>25/04/2026</td><td>92</td><td>SL-CERT-0002</td></tr></tbody></table></div>
        <button className="btn btn--secondary btn--full" style={{marginTop:16}} onClick={()=>showToast('📥 Xuất chứng chỉ (mock)')}>📥 Xuất CSV/XLSX</button>
      </div>}

      {tab==='groups'&&<div>
        <button className="btn btn--primary btn--full" style={{marginBottom:16}}>+ Tạo nhóm học mới</button>
        {[{name:'Nhóm Kỹ thuật A',members:12,course:'Kỹ năng giao tiếp'},{name:'Nhóm Kinh doanh',members:8,course:'An toàn thông tin'},{name:'Nhóm Marketing',members:5,course:'Quản lý thời gian'}].map(g=><div key={g.name} className="card" style={{marginBottom:8}}><div style={{fontWeight:700}}>{g.name}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{g.members} TV · {g.course}</div></div>)}
      </div>}
      {toast&&<div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
