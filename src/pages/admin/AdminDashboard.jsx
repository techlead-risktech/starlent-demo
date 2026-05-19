import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.js';
import { users, ROLE_LABELS } from '../../data/mockUsers.js';
import { courses, COURSE_STATUS } from '../../data/mockCourses.js';
import { reportSummary, progressByDepartment, courseProgressReport, quizResults, auditLogs } from '../../data/mockReports.js';

export default function AdminDashboard() {
  const {user}=useAuth(); const {toast,showToast}=useToast(); const [params,setParams]=useSearchParams(); const tab=params.get('tab')||'overview';

  return (
    <AdminLayout title="Quản trị hệ thống">
      <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Xin chào, {user?.name}</h2>
      <p style={{fontSize:14,color:'var(--color-text-muted)',marginBottom:20}}>Vai trò: Quản trị hệ thống</p>
      <div className="tabs" style={{marginBottom:20}}>
        {[{key:'overview',label:'📊 Tổng quan'},{key:'users',label:'👥 Người dùng'},{key:'courses',label:'📚 Khoá học'},{key:'reports',label:'📈 Báo cáo'},{key:'certificates',label:'🎓 Chứng chỉ'},{key:'audit',label:'📋 Nhật ký'},{key:'settings',label:'⚙️ Cài đặt'}].map(t=><button key={t.key} className={`tab${tab===t.key?' tab--active':''}`} onClick={()=>setParams({tab:t.key})}>{t.label}</button>)}
      </div>

      {tab==='overview'&&<>
        <div className="grid-4" style={{marginBottom:20}}>
          <div className="stat-card"><div className="stat-card__label">Người dùng</div><div className="stat-card__value">{users.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">Khoá học</div><div className="stat-card__value">{courses.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">Học viên</div><div className="stat-card__value">{reportSummary.activeLearners}</div></div>
          <div className="stat-card"><div className="stat-card__label">Chứng chỉ</div><div className="stat-card__value">{reportSummary.totalCertificates}</div></div>
        </div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Tiến độ phòng ban</h3>
        {progressByDepartment.map(d=><div key={d.department} className="chart-bar-row"><div className="chart-bar-label">{d.department}</div><div className="chart-bar-track"><div className="chart-bar-fill" style={{width:`${d.completionRate}%`}}/></div><div className="chart-bar-value">{d.completionRate}%</div></div>)}
      </>}

      {tab==='users'&&<div>
        <button className="btn btn--primary btn--full" style={{marginBottom:16}} onClick={()=>showToast('✅ Đã tạo tài khoản (mock)')}>+ Thêm người dùng</button>
        <div className="table-wrapper"><table className="table"><thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Phòng ban</th><th></th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><strong>{u.name}</strong></td><td style={{fontSize:12}}>{u.email}</td><td><span className="badge badge--info">{ROLE_LABELS[u.role]}</span></td><td>{u.department}</td><td><button className="btn btn--ghost btn--sm" onClick={()=>showToast('✏️ Sửa (mock)')}>✏️</button></td></tr>)}</tbody></table></div>
      </div>}

      {tab==='courses'&&<div>
        <button className="btn btn--primary btn--full" style={{marginBottom:16}}>+ Thêm khoá học</button>
        {courses.map(c=><div key={c.id} className="card" style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}><div><div style={{fontWeight:700}}>{c.title}</div><div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>{c.tags.map(t=><span key={t} className="chip">{t}</span>)}</div><div style={{fontSize:12,color:'var(--color-text-muted)',marginTop:4}}>{c.moduleCount} module · {c.duration}p</div></div><span className={`badge ${c.status===COURSE_STATUS.PUBLISHED?'badge--success':'badge--warning'}`}>{c.status}</span></div></div>)}
      </div>}

      {tab==='reports'&&<div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Tiến độ khoá học</h3>
        {courseProgressReport.map(c=><div key={c.courseId} className="chart-bar-row"><div className="chart-bar-label">{c.courseName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{width:`${Math.round((c.completed/c.enrolled)*100)}%`}}/></div><div className="chart-bar-value">{Math.round((c.completed/c.enrolled)*100)}%</div></div>)}
        <h3 style={{fontSize:16,fontWeight:700,margin:'20px 0 12px'}}>Quiz</h3>
        {quizResults.map(q=><div key={q.quizId} className="chart-bar-row"><div className="chart-bar-label">{q.quizName}</div><div className="chart-bar-track"><div className="chart-bar-fill progress-bar__fill--success" style={{width:`${q.passRate}%`}}/></div><div className="chart-bar-value">{q.passRate}%</div></div>)}
        <button className="btn btn--secondary btn--full" style={{marginTop:16}} onClick={()=>showToast('📥 Đang xuất CSV (mock)')}>📥 Xuất CSV/XLSX</button>
      </div>}

      {tab==='certificates'&&<div className="table-wrapper"><table className="table"><thead><tr><th>Học viên</th><th>Khoá học</th><th>Ngày</th><th>Điểm</th><th>Mã</th></tr></thead><tbody><tr><td>Nguyễn Văn An</td><td>An toàn thông tin</td><td>10/05/2026</td><td>88</td><td>SL-CERT-0001</td></tr><tr><td>Vũ Minh Tuấn</td><td>Kỹ năng giao tiếp</td><td>25/04/2026</td><td>92</td><td>SL-CERT-0002</td></tr></tbody></table></div>}

      {tab==='audit'&&<div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Nhật ký hệ thống</h3>
        <div className="table-wrapper"><table className="table"><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Đối tượng</th></tr></thead><tbody>{auditLogs.map(log=><tr key={log.id}><td style={{fontSize:12}}>{new Date(log.timestamp).toLocaleString('vi-VN')}</td><td>{log.userName}</td><td>{log.action}</td><td style={{fontSize:12}}>{log.target}</td></tr>)}</tbody></table></div>
      </div>}

      {tab==='settings'&&<div>
        <div className="card" style={{marginBottom:12}}><h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>🔧 Cấu hình chung</h4>
          <div className="input-group" style={{marginBottom:12}}><label className="input-label">Tên hệ thống</label><input className="input" defaultValue="Starlent MicroLearn"/></div>
          <div className="input-group" style={{marginBottom:12}}><label className="input-label">Ngôn ngữ</label><select className="input"><option>Tiếng Việt</option><option>English</option></select></div>
          <button className="btn btn--primary btn--full" onClick={()=>showToast('✅ Đã lưu (mock)')}>💾 Lưu</button>
        </div>
        <div className="card" style={{marginBottom:12}}><h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>🔌 Tích hợp</h4>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}><span>SSO</span><button className="btn btn--sm btn--secondary">Cấu hình</button></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}><span>Webhook</span><button className="btn btn--sm btn--secondary">Cấu hình</button></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}><span>API Key</span><button className="btn btn--sm btn--secondary">Quản lý</button></div>
        </div>
        <div className="card"><h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>⚠️ Vùng nguy hiểm</h4><button className="btn btn--danger btn--full" onClick={()=>showToast('⚠️ Mock — không thực thi')}>🗑️ Xoá tất cả dữ liệu</button></div>
      </div>}
      {toast&&<div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
