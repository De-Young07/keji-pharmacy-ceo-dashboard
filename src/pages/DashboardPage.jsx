// src/pages/DashboardPage.jsx
// ═══════════════════════════════════════════════════════════════════════════
// The complete CEO remote dashboard.
// Mobile-first layout — designed for your sister to use on her phone.
// Reads from the Railway backend which reads from Supabase.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as api   from "../api/index.js";
import { useAuth }  from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const fmt     = n  => "₦" + Number(n || 0).toLocaleString("en-NG");
const fmtDate = d  => d ? new Date(d).toLocaleDateString("en-NG", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ── Tiny sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data, valueKey }) {
  if (!data || data.length < 2) return null;
  const vals  = data.map(d => Number(d[valueKey] || 0));
  const max   = Math.max(...vals); const min = Math.min(...vals);
  const range = max - min || 1;
  const W = 280, H = 48;
  const pts = vals.slice(0, 14).reverse().map((v, i, arr) => {
    const x = (i / (arr.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block", marginTop:8 }}>
      <polyline points={pts} fill="none" stroke="var(--teal-light)" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const S = `
  .dash-shell { display:flex; flex-direction:column; height:100vh; overflow:hidden; background:var(--bg); }

  /* Topbar */
  .dash-topbar {
    display:flex; align-items:center; justify-content:space-between;
    padding:0 16px; height:52px;
    background:var(--emerald);
    flex-shrink:0;
  }
  .dash-brand  { font-size:14px; font-weight:700; color:#fff; }
  .dash-sub    { font-size:9px; color:rgba(255,255,255,.5); margin-top:1px; font-family:var(--font-data); letter-spacing:.4px; }
  .topbar-right { display:flex; align-items:center; gap:8px; }
  .live-dot { width:7px; height:7px; border-radius:50%; background:var(--teal-light); animation:pulse 2s infinite; }
  .logout-btn { background:rgba(255,255,255,.15); border:none; color:#fff; border-radius:6px; padding:4px 10px; font-size:11px; font-weight:600; cursor:pointer; font-family:var(--font-ui); transition:background .12s; }
  .logout-btn:hover { background:rgba(255,255,255,.25); }

  /* Bottom nav tabs */
  .dash-tabs {
    display:flex; background:var(--white);
    border-top:1px solid var(--border-2);
    flex-shrink:0;
  }
  .dash-tab {
    flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:8px 4px; border:none; background:none; cursor:pointer;
    font-family:var(--font-ui); font-size:9px; font-weight:600; color:var(--ink-3);
    letter-spacing:.3px; text-transform:uppercase; transition:all .12s;
    border-top:2px solid transparent; position:relative;
  }
  .dash-tab.active { color:var(--teal); border-top-color:var(--teal); }
  .dash-tab-icon   { font-size:18px; margin-bottom:2px; }
  .tab-badge {
    position:absolute; top:6px; right:calc(50% - 14px);
    background:var(--red); color:#fff; font-size:8px; font-weight:700;
    padding:1px 4px; border-radius:99px; min-width:14px; text-align:center;
  }

  /* Body */
  .dash-body { flex:1; overflow-y:auto; padding:14px 14px 8px; }

  /* Range selector */
  .range-row { display:flex; gap:6px; margin-bottom:14px; }
  .range-btn { flex:1; height:32px; border-radius:var(--radius); border:1.5px solid var(--border); background:var(--white); font-family:var(--font-ui); font-size:11px; font-weight:600; color:var(--ink-3); cursor:pointer; transition:all .12s; }
  .range-btn.active { border-color:var(--teal); background:var(--teal-dim); color:var(--teal); }

  /* KPI grid — 2 cols on mobile */
  .kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
  .kpi-card {
    background:var(--white); border:1px solid var(--border-2);
    border-radius:var(--radius); padding:12px;
    position:relative; overflow:hidden;
  }
  .kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:var(--radius) var(--radius) 0 0; }
  .kpi-green::before { background:var(--green); }
  .kpi-teal::before  { background:var(--teal-light); }
  .kpi-amber::before { background:var(--amber); }
  .kpi-red::before   { background:var(--red); }
  .kpi-label { font-size:9px; font-weight:700; color:var(--ink-3); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .kpi-value { font-family:var(--font-data); font-size:18px; font-weight:700; color:var(--ink); letter-spacing:-1px; line-height:1; }
  .kpi-sym   { font-size:11px; color:var(--ink-3); }
  .kpi-sub   { font-size:9px; color:var(--ink-3); margin-top:6px; font-family:var(--font-ui); }

  /* Section card */
  .section { background:var(--white); border:1px solid var(--border-2); border-radius:var(--radius); margin-bottom:12px; overflow:hidden; }
  .section-hdr { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid var(--border-2); }
  .section-title { font-size:12px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:6px; }
  .section-body  { padding:10px 12px; }

  /* Bar chart */
  .bar-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
  .bar-label { width:90px; font-size:9px; font-weight:500; color:var(--ink-2); text-align:right; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bar-track { flex:1; height:12px; background:var(--surface-2); border-radius:99px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; background:linear-gradient(90deg, var(--teal) 0%, var(--teal-light) 100%); transition:width .6s cubic-bezier(.4,0,.2,1); }
  .bar-val   { width:50px; font-family:var(--font-data); font-size:9px; font-weight:700; color:var(--teal); text-align:right; flex-shrink:0; }

  /* Debtor row */
  .debtor-row { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--border-2); }
  .debtor-row:last-child { border-bottom:none; }
  .debtor-name  { font-size:12px; font-weight:700; color:var(--ink); }
  .debtor-phone { font-family:var(--font-data); font-size:10px; color:var(--ink-3); margin-top:1px; }
  .debtor-amt   { font-family:var(--font-data); font-size:13px; font-weight:700; color:var(--red); }

  /* Expiry row */
  .expiry-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-2); }
  .expiry-row:last-child { border-bottom:none; }
  .expiry-drug  { font-size:12px; font-weight:700; color:var(--ink); }
  .expiry-batch { font-family:var(--font-data); font-size:9px; color:var(--ink-3); margin-top:1px; }
  .expiry-right { text-align:right; }
  .expiry-days  { font-family:var(--font-data); font-size:11px; font-weight:700; }
  .expiry-val   { font-family:var(--font-data); font-size:10px; color:var(--red); margin-top:2px; font-weight:700; }

  /* Price control row */
  .price-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border-2); }
  .price-row:last-child { border-bottom:none; }
  .price-info  { flex:1; min-width:0; }
  .price-name  { font-size:11px; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .price-batch { font-family:var(--font-data); font-size:9px; color:var(--ink-3); }
  .price-input { width:90px; height:28px; padding:0 6px; border:1.5px solid var(--border); border-radius:5px; font-family:var(--font-data); font-size:11px; color:var(--ink); background:var(--surface); outline:none; flex-shrink:0; }
  .price-input:focus { border-color:var(--teal-light); }
  .price-save { height:28px; padding:0 10px; border-radius:5px; border:1px solid var(--teal); background:var(--teal-dim); font-family:var(--font-ui); font-size:10px; font-weight:700; color:var(--teal); cursor:pointer; flex-shrink:0; transition:all .12s; }
  .price-save:hover { background:var(--teal); color:#fff; }
  .price-saved { font-size:10px; font-weight:700; color:var(--green); flex-shrink:0; }

  /* Staff row */
  .staff-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--border-2); }
  .staff-row:last-child { border-bottom:none; }
  .staff-avatar { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
  .staff-name  { font-size:12px; font-weight:600; color:var(--ink); }
  .staff-txns  { font-size:10px; color:var(--ink-3); margin-top:2px; }
  .staff-sales { font-family:var(--font-data); font-size:12px; font-weight:700; }
  .staff-bar   { height:4px; background:var(--surface-2); border-radius:99px; margin-top:5px; overflow:hidden; }
  .staff-bar-fill { height:100%; border-radius:99px; transition:width .6s; }

  .refresh-row { display:flex; justify-content:flex-end; margin-bottom:12px; }
  .last-updated { font-family:var(--font-data); font-size:10px; color:var(--ink-3); }
`;

const TABS    = [
  { id:"overview", icon:"⊞", label:"Overview" },
  { id:"expiry",   icon:"⚠", label:"Expiry" },
  { id:"debtors",  icon:"◑", label:"Debtors" },
  { id:"prices",   icon:"⊙", label:"Prices" },
  { id:"staff",    icon:"♟", label:"Staff" },
];
const STAFF_COLORS = ["#0F766E","#0369A1","#7C3AED","#B45309","#DC2626"];

function expDays(days) {
  if (days < 0)  return { cls:"badge-red",   label:"Expired" };
  if (days < 30) return { cls:"badge-red",   label:`${days}d` };
  if (days < 60) return { cls:"badge-amber", label:`${days}d` };
  return               { cls:"badge-blue",  label:`${days}d` };
}

export default function DashboardPage() {
  const { user, logout }  = useAuth();
  const toast             = useToast();
  const navigate          = useNavigate();

  const [tab,       setTab]       = useState("overview");
  const [range,     setRange]     = useState("today");
  const [loading,   setLoading]   = useState(true);
  const [lastSync,  setLastSync]  = useState(null);

  const [kpi,        setKpi]        = useState(null);
  const [daily,      setDaily]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [debtors,    setDebtors]    = useState([]);
  const [staff,      setStaff]      = useState([]);
  const [expiry,     setExpiry]     = useState([]);
  const [products,   setProducts]   = useState([]);
  const [expiryDays, setExpiryDays] = useState(90);

  // Price edits: { batchId: newPrice }
  const [priceEdits,  setPriceEdits]  = useState({});
  const [savedPrices, setSavedPrices] = useState({});

  function rangeParams() {
    const now = new Date(), iso = d => d.toISOString().slice(0,10);
    if (range === "today") return { dateFrom: iso(now), dateTo: iso(now) };
    if (range === "week")  { const f = new Date(now); f.setDate(now.getDate()-7); return { dateFrom:iso(f), dateTo:iso(now) }; }
    const f = new Date(now); f.setDate(1); return { dateFrom:iso(f), dateTo:iso(now) };
  }

  const load = useCallback(async () => {
    setLoading(true);
    const { dateFrom, dateTo } = rangeParams();
    try {
      const [k, d, cat, dbt, st, exp, prods] = await Promise.all([
        api.getKPI(dateFrom, dateTo),
        api.getDailySummary(14),
        api.getCategoryPerf(dateFrom, dateTo),
        api.getDebtors(),
        api.getStaffPerformance(dateFrom, dateTo),
        api.getExpiryAlerts(expiryDays),
        api.getProducts(""),
      ]);
      setKpi(k); setDaily(d); setCategories(cat);
      setDebtors(dbt); setStaff(st); setExpiry(exp); setProducts(prods);
      setLastSync(new Date());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [range, expiryDays]);

  useEffect(() => { load(); }, [load]);

  async function savePrice(batchId, productName, tiers) {
    const hasAny = Object.values(tiers).some(v => v !== "" && v != null);
    if (!hasAny) { toast.error("Enter at least one price."); return; }
    try {
      await api.updateBatchPrice(batchId, tiers, "CEO remote update");
      setSavedPrices(s => ({ ...s, [batchId]: true }));
      toast.success(`${productName} prices updated. Syncing to store…`);
      setTimeout(() => setSavedPrices(s => { const n={...s}; delete n[batchId]; return n; }), 3000);
    } catch (err) {
      toast.error(err.message);
    }
  }

  function handleLogout() { logout(); navigate("/login", { replace:true }); }

  const maxCat   = Math.max(...categories.map(c => Number(c.total_revenue||0)), 1);
  const maxStaff = Math.max(...staff.map(s => Number(s.total_sales||0)), 1);

  return (
    <>
      <style>{S}</style>
      <div className="dash-shell">

        {/* Topbar */}
        <div className="dash-topbar">
          <div>
            <div className="dash-brand">Keji Pharmacy</div>
            <div className="dash-sub">CEO Dashboard · {user?.full_name}</div>
          </div>
          <div className="topbar-right">
            <div className="live-dot" />
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        {/* Body */}
        <div className="dash-body">

          {loading && (
            <div className="loading-overlay" style={{ height:200 }}>
              <span className="spinner" /> Loading data…
            </div>
          )}

          {!loading && (
            <>
              {/* Refresh row */}
              <div className="refresh-row">
                {lastSync && (
                  <span className="last-updated">
                    Last updated: {lastSync.toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}
                  </span>
                )}
                <button className="btn btn-sm btn-ghost" style={{ marginLeft:8 }} onClick={load}>↻ Refresh</button>
              </div>

              {/* ══ OVERVIEW ══ */}
              {tab === "overview" && kpi && (
                <>
                  <div className="range-row">
                    {[["today","Today"],["week","Week"],["month","Month"]].map(([v,l]) => (
                      <button key={v} className={`range-btn ${range===v?"active":""}`} onClick={()=>setRange(v)}>{l}</button>
                    ))}
                  </div>

                  <div className="kpi-grid">
                    <div className="kpi-card kpi-green">
                      <div className="kpi-label">Gross Sales</div>
                      <div className="kpi-value"><span className="kpi-sym">₦</span>{(Number(kpi.gross_revenue||0)/1000).toFixed(1)}k</div>
                      <div className="kpi-sub">{kpi.total_transactions} transactions</div>
                    </div>
                    <div className="kpi-card kpi-teal">
                      <div className="kpi-label">Net Profit</div>
                      <div className="kpi-value"><span className="kpi-sym">₦</span>{(Number(kpi.net_profit||0)/1000).toFixed(1)}k</div>
                      <div className="kpi-sub">Margin: {Number(kpi.margin_percent||0).toFixed(1)}%</div>
                    </div>
                    <div className="kpi-card kpi-amber">
                      <div className="kpi-label">Pending Debt</div>
                      <div className="kpi-value"><span className="kpi-sym">₦</span>{(Number(kpi.total_outstanding||0)/1000).toFixed(1)}k</div>
                      <div className="kpi-sub">{kpi.total_debtors} customers</div>
                    </div>
                    <div className="kpi-card kpi-red">
                      <div className="kpi-label">Expiry Risk</div>
                      <div className="kpi-value" style={{ fontSize:16 }}>{kpi.expiring_batches} batches</div>
                      <div className="kpi-sub">{kpi.low_stock_products} low/out of stock</div>
                    </div>
                  </div>

                  {/* Revenue trend */}
                  <div className="section">
                    <div className="section-hdr">
                      <span className="section-title">Revenue Trend <span className="badge badge-teal">14 days</span></span>
                    </div>
                    <div className="section-body" style={{ paddingBottom:4 }}>
                      <Sparkline data={daily} valueKey="gross_revenue" />
                      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"var(--font-data)", fontSize:9, color:"var(--ink-3)", marginTop:4 }}>
                        <span>{daily[daily.length-1]?.sale_day?.slice(5)||""}</span>
                        <span>{daily[0]?.sale_day?.slice(5)||""}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category performance */}
                  <div className="section">
                    <div className="section-hdr">
                      <span className="section-title">Category Revenue</span>
                    </div>
                    <div className="section-body">
                      {categories.length === 0 && <div className="empty-state" style={{ padding:16 }}><div className="empty-state-sub">No sales data yet</div></div>}
                      {categories.map(c => (
                        <div key={c.category} className="bar-row">
                          <div className="bar-label">{c.category}</div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width:(Number(c.total_revenue||0)/maxCat*100)+"%" }} />
                          </div>
                          <div className="bar-val">{fmt(Number(c.total_revenue||0)/1000)}k</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ══ EXPIRY ══ */}
              {tab === "expiry" && (
                <>
                  <div className="range-row">
                    {[[30,"<30d"],[60,"<60d"],[90,"<90d"]].map(([v,l]) => (
                      <button key={v} className={`range-btn ${expiryDays===v?"active":""}`} onClick={()=>setExpiryDays(v)}>{l}</button>
                    ))}
                  </div>
                  <div className="section">
                    <div className="section-hdr">
                      <span className="section-title">⚠ Expiry Alerts <span className="badge badge-red">{expiry.length}</span></span>
                    </div>
                    <div className="section-body">
                      {expiry.length === 0 && (
                        <div className="empty-state" style={{ padding:24 }}>
                          <div className="empty-state-icon">✅</div>
                          <div className="empty-state-sub">No batches expiring within {expiryDays} days</div>
                        </div>
                      )}
                      {expiry.map(b => {
                        const d = expDays(b.days_until_expiry);
                        return (
                          <div key={b.batch_id} className="expiry-row">
                            <div>
                              <div className="expiry-drug">{b.brand_name}</div>
                              <div className="expiry-batch">{b.batch_number} · {b.quantity_remaining} units</div>
                            </div>
                            <div className="expiry-right">
                              <span className={`badge ${d.cls}`}>{d.label}</span>
                              <div className="expiry-val">{fmt(b.value_at_risk)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ══ DEBTORS ══ */}
              {tab === "debtors" && (
                <div className="section">
                  <div className="section-hdr">
                    <span className="section-title">Active Debtors</span>
                    <span className="badge badge-red">{fmt(debtors.reduce((s,d)=>s+Number(d.current_balance||0),0))} total</span>
                  </div>
                  <div className="section-body">
                    {debtors.length === 0 && (
                      <div className="empty-state" style={{ padding:24 }}>
                        <div className="empty-state-icon">🎉</div>
                        <div className="empty-state-sub">No outstanding debts</div>
                      </div>
                    )}
                    {debtors.map(d => (
                      <div key={d.customer_id} className="debtor-row">
                        <div>
                          <div className="debtor-name">{d.full_name}</div>
                          <div className="debtor-phone">{d.phone || "No phone"}</div>
                        </div>
                        <div className="debtor-amt">{fmt(d.current_balance)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ PRICES ══ */}
              {tab === "prices" && (
                <div className="section">
                  <div className="section-hdr">
                    <span className="section-title">Price Controls</span>
                    <span style={{ fontSize:9, color:"var(--ink-3)", fontFamily:"var(--font-data)" }}>syncs in ~60s</span>
                  </div>
                  <div className="section-body">
                    {products.filter(p => p.active_batch_id).map(p => {
                      const bid = p.active_batch_id;
                      const edits = priceEdits[bid] || {};
                      const isSaved = savedPrices[bid];

                      const tierFields = [
                        ["retail_general",       "Retail · General",       p.price_retail_general],
                        ["retail_subsidized",    "Retail · Subsidized",    p.price_retail_subsidized],
                        ["wholesale_general",    "Wholesale · General",    p.price_wholesale_general],
                        ["wholesale_subsidized", "Wholesale · Subsidized", p.price_wholesale_subsidized],
                        ["wholesale_bulk",       "Wholesale · Bulk",       p.price_wholesale_bulk],
                      ];

                      const baseVal = edits.retail_general ?? p.price_retail_general ?? p.current_selling_price;
                      const margin  = baseVal && p.current_cost_price
                        ? Math.round(((baseVal - p.current_cost_price) / baseVal) * 100) : 0;

                      return (
                        <div key={p.product_id} className="price-row" style={{ flexDirection:"column", alignItems:"stretch", gap:8 }}>
                          <div className="price-info">
                            <div className="price-name">{p.brand_name} {p.strength}</div>
                            <div className="price-batch">
                              {p.active_batch_number} · <span style={{ color: margin>=20?"var(--green)":"var(--red)", fontWeight:700 }}>{margin}% margin</span>
                            </div>
                          </div>

                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                            {tierFields.map(([key, label, currentVal]) => (
                              <div key={key} style={{ display:"flex", flexDirection:"column", gap:2 }}>
                                <span style={{ fontSize:9, color:"var(--ink-3)", fontWeight:600 }}>{label}</span>
                                <input
                                  className="price-input"
                                  type="number"
                                  step="0.01"
                                  placeholder={currentVal ? `₦${currentVal}` : "Not set"}
                                  value={edits[key] ?? ""}
                                  onChange={e => setPriceEdits(prev => ({
                                    ...prev,
                                    [bid]: { ...prev[bid], [key]: e.target.value }
                                  }))}
                                />
                              </div>
                            ))}
                          </div>

                          {isSaved
                            ? <span className="price-saved">✓ Sent to store</span>
                            : <button className="price-save" style={{ width:"100%" }}
                                onClick={() => savePrice(bid, p.brand_name, {
                                  retail_general:       edits.retail_general       ? parseFloat(edits.retail_general)       : undefined,
                                  retail_subsidized:    edits.retail_subsidized    ? parseFloat(edits.retail_subsidized)    : undefined,
                                  wholesale_general:    edits.wholesale_general    ? parseFloat(edits.wholesale_general)    : undefined,
                                  wholesale_subsidized: edits.wholesale_subsidized ? parseFloat(edits.wholesale_subsidized) : undefined,
                                  wholesale_bulk:       edits.wholesale_bulk       ? parseFloat(edits.wholesale_bulk)       : undefined,
                                })}>
                                Save All Prices
                              </button>
                          }
                        </div>
                      );
                    })}
                    {products.filter(p => p.active_batch_id).length === 0 && (
                      <div className="empty-state" style={{ padding:24 }}>
                        <div className="empty-state-sub">No products with active batches found</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ STAFF ══ */}
              {tab === "staff" && (
                <>
                  <div className="range-row">
                    {[["today","Today"],["week","Week"],["month","Month"]].map(([v,l]) => (
                      <button key={v} className={`range-btn ${range===v?"active":""}`} onClick={()=>setRange(v)}>{l}</button>
                    ))}
                  </div>
                  <div className="section">
                    <div className="section-hdr">
                      <span className="section-title">Staff Performance</span>
                    </div>
                    <div className="section-body">
                      {staff.length === 0 && (
                        <div className="empty-state" style={{ padding:24 }}>
                          <div className="empty-state-sub">No sales data for this period</div>
                        </div>
                      )}
                      {staff.map((s, i) => (
                        <div key={s.user_id} className="staff-row">
                          <div className="staff-avatar" style={{ background:STAFF_COLORS[i%STAFF_COLORS.length] }}>
                            {s.full_name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="staff-name">{s.full_name}</div>
                            <div className="staff-txns">{s.total_transactions} transactions</div>
                            <div className="staff-bar">
                              <div className="staff-bar-fill" style={{ width:(Number(s.total_sales||0)/maxStaff*100)+"%", background:STAFF_COLORS[i%STAFF_COLORS.length] }} />
                            </div>
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0 }}>
                            <div className="staff-sales" style={{ color:STAFF_COLORS[i%STAFF_COLORS.length] }}>{fmt(s.total_sales)}</div>
                            <div style={{ fontFamily:"var(--font-data)", fontSize:9, color:"var(--green)", marginTop:2 }}>+{fmt(s.total_profit)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="dash-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`dash-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
              {t.id === "expiry"  && expiry.length  > 0 && <span className="tab-badge">{expiry.length}</span>}
              {t.id === "debtors" && debtors.length > 0 && <span className="tab-badge">{debtors.length}</span>}
              <span className="dash-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
