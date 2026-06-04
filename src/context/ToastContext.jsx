// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "success", duration = 3500) => {
    const id = ++_id;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const toast = {
    success: m => add(m, "success"),
    error:   m => add(m, "error", 5000),
    info:    m => add(m, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:100, display:"flex", flexDirection:"column", gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding:"10px 16px", borderRadius:8, fontFamily:"var(--font-ui)",
            fontSize:12, fontWeight:600, minWidth:220,
            boxShadow:"0 4px 16px rgba(0,0,0,.15)",
            background: t.type==="error" ? "#DC2626" : t.type==="info" ? "#0369A1" : "#065F46",
            color:"#fff",
            animation:"slideUp .2s ease",
          }}>
            {t.type==="success"?"✓ ":t.type==="error"?"✕ ":"ℹ "}{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}
