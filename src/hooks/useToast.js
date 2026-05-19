import { useState, useCallback, useRef, useEffect } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const ref = useRef(null);
  const show = useCallback((msg, dur = 2500) => {
    if (ref.current) clearTimeout(ref.current);
    setToast(msg); ref.current = setTimeout(() => setToast(null), dur);
  }, []);
  useEffect(() => () => { if (ref.current) clearTimeout(ref.current); }, []);
  return { toast, showToast: show };
}

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const i = localStorage.getItem(key); return i ? JSON.parse(i) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => { setVal(prev => { const n = typeof v === 'function' ? v(prev) : v; localStorage.setItem(key, JSON.stringify(n)); return n; }); }, [key]);
  return [val, set];
}

export function useOnlineStatus() {
  const [on, setOn] = useState(navigator.onLine);
  useEffect(() => {
    const a = () => setOn(true), b = () => setOn(false);
    window.addEventListener('online', a); window.addEventListener('offline', b);
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b); };
  }, []);
  return on;
}

/**
 * usePreventLeave — Cảnh báo khi đang học dở mà rời đi / chuyển tab
 * @param {boolean} isDirty - true nếu đang học dở (chưa hoàn thành)
 */
export function usePreventLeave(isDirty) {
  const prevTitle = useRef(document.title);

  // Chặn refresh / đóng tab / back trình duyệt
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Khi chuyển tab: đổi title cảnh báo
  useEffect(() => {
    if (!isDirty) return;
    const handleVisibility = () => {
      if (document.hidden) {
        prevTitle.current = document.title;
        document.title = '⚠️ Quay lại — bài học chưa hoàn thành!';
      } else {
        document.title = prevTitle.current;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.title = prevTitle.current;
    };
  }, [isDirty]);

  return { isDirty };
}
