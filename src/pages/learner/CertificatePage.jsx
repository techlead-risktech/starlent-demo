import { useParams, useNavigate } from 'react-router-dom';
import { findCertificateById } from '../../data/mockChats.js';
import { useToast } from '../../hooks/useToast.js';
import LearnerLayout from '../../components/layout/LearnerLayout.jsx';

export default function CertificatePage() {
  const {certId}=useParams(); const navigate=useNavigate(); const {toast,showToast}=useToast();
  const cert=findCertificateById(certId);
  if (!cert) return <LearnerLayout topBar={<div className="page__header"><div className="page__title">Chứng chỉ</div></div>}><div className="empty-state"><div className="empty-state__icon">🔍</div><div className="empty-state__title">Không tìm thấy</div></div></LearnerLayout>;

  return (
    <LearnerLayout topBar={<div className="page__header"><button className="btn btn--ghost btn--sm" onClick={()=>navigate(-1)} style={{marginBottom:8}}>← Quay lại</button><div className="page__title">Chứng chỉ</div></div>}>
      <div style={{padding:16}}>
        <div className="certificate"><div className="certificate__seal">🎓</div>
          <div className="certificate__title">CHỨNG NHẬN HOÀN THÀNH</div>
          <div style={{fontSize:13,color:'var(--color-text-muted)',marginBottom:16}}>Starlent MicroLearn chứng nhận</div>
          <div className="certificate__name">{cert.userName}</div>
          <div style={{fontSize:13,color:'var(--color-text-muted)',marginBottom:8}}>đã hoàn thành khoá học</div>
          <div className="certificate__course">{cert.courseName}</div>
          <div className="certificate__meta">
            <div><div style={{fontWeight:700}}>📅 Ngày</div>{new Date(cert.completionDate).toLocaleDateString('vi-VN')}</div>
            <div><div style={{fontWeight:700}}>⭐ Điểm</div>{cert.score}/100</div>
            <div><div style={{fontWeight:700}}>⏱ Thời lượng</div>{cert.duration} phút</div>
          </div>
          <div style={{marginTop:16,fontSize:11,color:'var(--color-text-muted)'}}>Mã xác thực: <strong>{cert.verificationCode}</strong></div>
        </div>
        <div className="grid-2" style={{marginTop:20}}>
          <button className="btn btn--primary btn--full" onClick={()=>showToast('📥 Đang tải xuống... (mock)')}>📥 Tải PDF</button>
          <button className="btn btn--secondary btn--full" onClick={()=>showToast('📤 Đã chia sẻ nội bộ (mock)')}>📤 Chia sẻ</button>
        </div>
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </LearnerLayout>
  );
}
