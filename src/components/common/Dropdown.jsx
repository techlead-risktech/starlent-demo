import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/index.jsx';

export default function Dropdown({ value, options, onChange, placeholder }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : (placeholder || t('common.select'));

  return (
    <div className="dropdown" ref={containerRef}>
      <button type="button" className="dropdown__trigger" onClick={() => setOpen(!open)}>
        <span className={`dropdown__text${!selected ? ' dropdown__text--placeholder' : ''}`}>{display}</span>
        <span className={`dropdown__arrow${open ? ' dropdown__arrow--open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="dropdown__menu">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`dropdown__option${o.value === value ? ' dropdown__option--active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
