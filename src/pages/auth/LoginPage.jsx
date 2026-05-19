import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ROLE_ROUTES } from '../../data/mockUsers.js';

export default function LoginPage() {
  const [email, setEmail] = useState('learner@starlent.demo');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) navigate(ROLE_ROUTES[result.user.role] || '/learner/dashboard');
      else setError(result.error);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-icon">📚</div>
          <div className="login-card__logo-text">Starlent MicroLearn</div>
          <div className="login-card__subtitle">Học ít mỗi ngày — Tiến bộ dài lâu</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{marginBottom:16}}>
            <label className="input-label" htmlFor="email">Email</label>
            <input id="email" type="email" className={`input${error?' input--error':''}`} value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@starlent.demo" required />
          </div>
          <div className="input-group" style={{marginBottom:8}}>
            <label className="input-label" htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" className={`input${error?' input--error':''}`} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••" required />
          </div>
          {error && <p className="input-error-msg" style={{marginBottom:12}}>{error}</p>}
          <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div style={{marginTop:24}}>
          <p style={{fontSize:12,color:'var(--color-text-muted)',textAlign:'center',marginBottom:8}}>Tài khoản demo:</p>
          <div style={{display:'grid',gap:4,fontSize:11,color:'var(--color-text-muted)'}}>
            {[
              {role:'Học viên',email:'learner@starlent.demo'},
              {role:'Giảng viên',email:'trainer@starlent.demo'},
              {role:'Biên tập ND',email:'editor@starlent.demo'},
              {role:'QL Đào tạo',email:'learning.manager@starlent.demo'},
              {role:'QL Phòng ban',email:'dept.manager@starlent.demo'},
              {role:'Admin',email:'admin@starlent.demo'},
            ].map(a=><div key={a.email} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:600}}>{a.role}</span><span>{a.email} / 123456</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
