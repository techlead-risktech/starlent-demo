import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveConfirmModal from '../components/common/LeaveConfirmModal.jsx';

const LessonGuardCtx = createContext(null);

/**
 * LessonGuardProvider — Hoist một LeaveConfirmModal duy nhất ra ngoài layout.
 * - Lesson screens gọi useLessonDirty(isDirty) để báo "đang học dở".
 * - LearnerLayout (bottom nav + sidebar) gọi requestNavigate(to) thay vì điều hướng trực tiếp.
 * - Nếu đang dở, modal hiện lên xác nhận; nếu không, điều hướng ngay.
 */
export function LessonGuardProvider({ children }) {
  const navigate = useNavigate();
  const [blocking, setBlocking] = useState(false);
  const [pending, setPending] = useState(null);

  const requestNavigate = useCallback((to) => {
    if (blocking) {
      setPending(to);
    } else {
      navigate(to);
    }
  }, [blocking, navigate]);

  const confirmLeave = useCallback(() => {
    const to = pending;
    setBlocking(false);
    setPending(null);
    if (to != null) navigate(to);
  }, [pending, navigate]);

  const cancelLeave = useCallback(() => setPending(null), []);

  const value = { blocking, setBlocking, requestNavigate };

  return (
    <LessonGuardCtx.Provider value={value}>
      {children}
      <LeaveConfirmModal open={pending !== null} onStay={cancelLeave} onLeave={confirmLeave} />
    </LessonGuardCtx.Provider>
  );
}

export function useLessonGuard() {
  const ctx = useContext(LessonGuardCtx);
  if (!ctx) {
    return { blocking: false, setBlocking: () => {}, requestNavigate: () => {} };
  }
  return ctx;
}

/**
 * useLessonDirty — Tiện ích cho màn học: tự động set blocking khi dirty thay đổi
 * và reset khi unmount để các màn khác (dashboard, course detail) không bị chặn.
 */
export function useLessonDirty(isDirty) {
  const { setBlocking } = useLessonGuard();
  const prev = useRef(false);
  useEffect(() => {
    if (prev.current !== isDirty) {
      prev.current = isDirty;
      setBlocking(isDirty);
    }
  }, [isDirty, setBlocking]);
  useEffect(() => () => setBlocking(false), [setBlocking]);
}
