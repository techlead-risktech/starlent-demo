import Modal from './Modal.jsx';

export default function LeaveConfirmModal({ open, onStay, onLeave }) {
  return (
    <Modal open={open} onClose={onStay} centered>
      <div style={{ textAlign: 'center', padding: '16px 8px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Bạn chưa hoàn thành bài học!
        </h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
          Tiến trình hiện tại sẽ không được lưu nếu bạn rời đi bây giờ. Bạn có chắc muốn thoát?
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn--secondary btn--lg btn--full" onClick={onStay}>
            Ở lại học tiếp
          </button>
          <button className="btn btn--danger btn--lg btn--full" onClick={onLeave}>
            Rời đi
          </button>
        </div>
      </div>
    </Modal>
  );
}
