// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const S = `
  .login-shell { min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg,#065F46 0%,#0F766E 60%,#0F172A 100%); padding:24px; }
  .login-card { width:100%; max-width:380px; background:#fff; border-radius:16px; box-shadow:0 24px 64px rgba(0,0,0,.25); overflow:hidden; }
  .login-header { background:#065F46; padding:28px 32px 24px; text-align:center; }
  .login-logo   { font-size:40px; margin-bottom:8px; }
  .login-brand  { font-family:var(--font-ui); font-size:18px; font-weight:700; color:#fff; }
  .login-sub    { font-family:var(--font-data); font-size:10px; color:rgba(255,255,255,.45); margin-top:4px; letter-spacing:.6px; text-transform:uppercase; }
  .login-body   { padding:28px 32px 32px; }
  .login-title  { font-size:15px; font-weight:700; color:var(--ink); margin-bottom:4px; }
  .login-hint   { font-size:12px; color:var(--ink-3); margin-bottom:20px; }
  .login-error  { background:var(--red-dim); border:1px solid var(--red); border-radius:var(--radius); padding:10px 12px; font-size:12px; color:var(--red); font-weight:500; margin-bottom:14px; }
  .login-btn { width:100%; height:42px; background:var(--teal); color:#fff; border:none; border-radius:var(--radius); font-family:var(--font-ui); font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:18px; }
  .login-btn:hover:not(:disabled) { background:var(--emerald-mid); }
  .login-btn:disabled { background:var(--border); color:var(--ink-3); cursor:not-allowed; }
  .login-footer { text-align:center; margin-top:16px; font-size:10px; color:var(--ink-3); font-family:var(--font-data); }
  .cloud-badge { display:flex; align-items:center; gap:6px; margin-top:14px; padding:8px 10px; background:var(--teal-dim); border:1px solid var(--teal-light); border-radius:6px; font-size:10px; font-weight:600; color:var(--teal); }
`;

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError("Enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{S}</style>
      <div className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">💊</div>
            <div className="login-brand">Keji Pharmacy</div>
            <div className="login-sub">CEO Remote Dashboard</div>
          </div>
          <div className="login-body">
            <div className="login-title">CEO Sign In</div>
            <div className="login-hint">Access your pharmacy analytics from anywhere</div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="ceo@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="••••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" style={{ borderTopColor:"#fff" }}/> Signing in…</> : "Sign In →"}
              </button>
            </form>
            <div className="cloud-badge">🌐 Connected to cloud — live store data</div>
            <div className="login-footer">Keji Pharmacy CEO Dashboard v3.0</div>
          </div>
        </div>
      </div>
    </>
  );
}
