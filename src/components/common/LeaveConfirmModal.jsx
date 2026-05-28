import Modal from './Modal.jsx';
import { useI18n } from '../../i18n/index.jsx';

export default function LeaveConfirmModal({ open, onStay, onLeave }) {
  const { t } = useI18n();

  return (
    <Modal open={open} onClose={onStay} centered>
      <div style={{ textAlign: 'center', padding: '16px 8px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u26A0\uFE0F'}</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t('ui.leaveConfirm.title')}</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
          {t('ui.leaveConfirm.description')}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn--secondary btn--lg btn--full" onClick={onStay}>{t('ui.leaveConfirm.stay')}</button>
          <button className="btn btn--danger btn--lg btn--full" onClick={onLeave}>{t('ui.leaveConfirm.leave')}</button>
        </div>
      </div>
    </Modal>
  );
}
