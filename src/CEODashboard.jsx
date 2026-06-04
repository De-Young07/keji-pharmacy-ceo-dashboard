import { useState } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --emerald:     #065F46;
    --emerald-mid: #047857;
    --teal:        #0F766E;
    --teal-light:  #14B8A6;
    --teal-dim:    #0F766E18;
    --surface:     #F0FDFA;
    --surface-2:   #CCFBF1;
    --white:       #FFFFFF;
    --ink:         #0F172A;
    --ink-2:       #334155;
    --ink-3:       #64748B;
    --border:      #CBD5E1;
    --border-2:    #E2E8F0;
    --red:         #DC2626;
    --red-dim:     #DC262612;
    --amber:       #D97706;
    --amber-dim:   #D9770612;
    --green:       #16A34A;
    --green-dim:   #16A34A12;
    --blue:        #0369A1;
    --blue-dim:    #0369A112;
    --font-data:   'IBM Plex Mono', monospace;
    --font-ui:     'Sora', sans-serif;
    --radius:      10px;
    --shadow:      0 1px 4px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.05);
    --shadow-md:   0 4px 16px rgba(0,0,0,.08);
  }

  body { background: #F1F5F9; font-family: var(--font-ui); color: var(--ink); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  /* ── Shell ── */
  .ceo-shell { display: flex; height: 100vh; overflow: hidden; }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px; flex-shrink: 0;
    background: var(--emerald);
    display: flex; flex-direction: column;
    padding: 0;
    border-right: 1px solid rgba(255,255,255,.08);
  }
  .sidebar-brand {
    padding: 20px 18px 16px;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }
  .brand-name {
    font-family: var(--font-ui); font-size: 14px; font-weight: 700;
    color: #fff; line-height: 1.3;
  }
  .brand-sub {
    font-family: var(--font-data); font-size: 9px;
    color: rgba(255,255,255,.45); margin-top: 2px; letter-spacing: .6px;
    text-transform: uppercase;
  }
  .sidebar-nav { flex: 1; padding: 12px 10px; }
  .nav-section-label {
    font-size: 9px; font-weight: 600; color: rgba(255,255,255,.35);
    letter-spacing: .8px; text-transform: uppercase;
    padding: 0 8px; margin: 14px 0 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: 7px;
    font-size: 12px; font-weight: 500; color: rgba(255,255,255,.65);
    cursor: pointer; transition: all .15s; margin-bottom: 2px;
  }
  .nav-item:hover { background: rgba(255,255,255,.08); color: #fff; }
  .nav-item.active { background: rgba(255,255,255,.14); color: #fff; font-weight: 600; }
  .nav-item svg { flex-shrink: 0; opacity: .7; }
  .nav-item.active svg { opacity: 1; }
  .nav-badge {
    margin-left: auto; background: var(--red);
    color: #fff; font-size: 9px; font-weight: 700;
    padding: 1px 6px; border-radius: 99px;
  }
  .sidebar-footer {
    padding: 14px 16px;
    border-top: 1px solid rgba(255,255,255,.1);
  }
  .ceo-avatar {
    display: flex; align-items: center; gap: 9px;
  }
  .avatar-circle {
    width: 30px; height: 30px; border-radius: 50%;
    background: var(--teal-light); display: flex; align-items: center;
    justify-content: center; font-size: 11px; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .avatar-info { font-size: 11px; }
  .avatar-name { font-weight: 600; color: #fff; }
  .avatar-role { color: rgba(255,255,255,.45); font-size: 9px; font-family: var(--font-data); }
  .online-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--teal-light); margin-left: auto;
    box-shadow: 0 0 0 2px rgba(20,184,166,.3);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 2px rgba(20,184,166,.3); }
    50%      { box-shadow: 0 0 0 5px rgba(20,184,166,.1); }
  }

  /* ── Main Content ── */
  .ceo-main {
    flex: 1; display: flex; flex-direction: column; overflow: hidden;
  }

  /* ── Top Bar ── */
  .ceo-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 56px;
    background: var(--white);
    border-bottom: 1px solid var(--border-2);
    flex-shrink: 0;
  }
  .page-title {
    font-family: var(--font-ui); font-size: 16px; font-weight: 700; color: var(--ink);
  }
  .page-sub { font-size: 11px; color: var(--ink-3); font-weight: 400; margin-top: 1px; }
  .topbar-actions { display: flex; align-items: center; gap: 10px; }
  .date-chip {
    font-family: var(--font-data); font-size: 11px; color: var(--ink-3);
    background: var(--surface); border: 1px solid var(--border-2);
    padding: 5px 10px; border-radius: 6px;
  }
  .sync-badge {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 6px;
    background: var(--green-dim); border: 1px solid var(--green);
    font-size: 10px; font-weight: 600; color: var(--green);
    font-family: var(--font-ui);
  }
  .sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

  /* ── Scrollable body ── */
  .ceo-body { flex: 1; overflow-y: auto; padding: 20px 24px; }

  /* ── Range tabs ── */
  .range-tabs {
    display: flex; gap: 4px; margin-bottom: 18px;
  }
  .range-tab {
    padding: 5px 14px; border-radius: 6px;
    border: 1.5px solid var(--border); background: var(--white);
    font-family: var(--font-ui); font-size: 11px; font-weight: 600;
    color: var(--ink-3); cursor: pointer; transition: all .12s;
  }
  .range-tab:hover { border-color: var(--teal-light); color: var(--teal); }
  .range-tab.active { border-color: var(--teal); background: var(--teal-dim); color: var(--teal); }

  /* ── KPI Cards ── */
  .kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
  }
  .kpi-card {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-2);
    padding: 16px; box-shadow: var(--shadow);
    position: relative; overflow: hidden;
  }
  .kpi-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    border-radius: var(--radius) var(--radius) 0 0;
  }
  .kpi-green::before  { background: var(--green); }
  .kpi-teal::before   { background: var(--teal-light); }
  .kpi-amber::before  { background: var(--amber); }
  .kpi-red::before    { background: var(--red); }

  .kpi-label {
    font-size: 10px; font-weight: 600; color: var(--ink-3);
    text-transform: uppercase; letter-spacing: .5px;
    font-family: var(--font-ui); margin-bottom: 8px;
  }
  .kpi-value {
    font-family: var(--font-data); font-size: 22px; font-weight: 600;
    color: var(--ink); letter-spacing: -1px; line-height: 1;
  }
  .kpi-value .sym { font-size: 13px; color: var(--ink-3); margin-right: 1px; }
  .kpi-delta {
    display: inline-flex; align-items: center; gap: 3px;
    margin-top: 8px; font-size: 10px; font-weight: 600;
    font-family: var(--font-ui); padding: 2px 6px;
    border-radius: 4px;
  }
  .delta-up   { background: var(--green-dim); color: var(--green); }
  .delta-down { background: var(--red-dim);   color: var(--red);   }
  .kpi-sub { font-size: 10px; color: var(--ink-3); margin-top: 6px; font-family: var(--font-ui); }

  /* ── Section header ── */
  .section-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .section-title {
    font-family: var(--font-ui); font-size: 13px; font-weight: 700; color: var(--ink);
    display: flex; align-items: center; gap: 6px;
  }
  .section-pill {
    padding: 2px 8px; border-radius: 99px; font-size: 10px;
    font-weight: 600; background: var(--surface-2); color: var(--teal);
  }
  .view-all-btn {
    font-size: 11px; font-weight: 600; color: var(--teal);
    background: none; border: none; cursor: pointer;
    font-family: var(--font-ui); padding: 0;
  }
  .view-all-btn:hover { text-decoration: underline; }

  /* ── Middle grid ── */
  .mid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }

  /* ── Expiry panel ── */
  .expiry-panel {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-2); box-shadow: var(--shadow); overflow: hidden;
  }
  .expiry-panel-header {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-2);
    background: linear-gradient(135deg, #FEF3C7 0%, #FFF 60%);
  }
  .expiry-tabs {
    display: flex; gap: 4px; margin-top: 8px;
  }
  .exp-tab {
    padding: 3px 10px; border-radius: 5px; border: 1px solid var(--border);
    font-size: 10px; font-weight: 600; cursor: pointer;
    font-family: var(--font-ui); transition: all .12s;
    background: var(--white); color: var(--ink-3);
  }
  .exp-tab.t30  { }
  .exp-tab.t30.active  { border-color: var(--red);   background: var(--red-dim);   color: var(--red); }
  .exp-tab.t60.active  { border-color: var(--amber); background: var(--amber-dim); color: var(--amber); }
  .exp-tab.t90.active  { border-color: var(--blue);  background: var(--blue-dim);  color: var(--blue); }
  .expiry-table-wrap { overflow-y: auto; max-height: 220px; }
  .expiry-table { width: 100%; border-collapse: collapse; font-family: var(--font-data); }
  .expiry-table th {
    padding: 6px 12px; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .5px;
    color: var(--ink-3); text-align: left; background: var(--surface);
    position: sticky; top: 0;
    border-bottom: 1px solid var(--border-2);
  }
  .expiry-table td { padding: 7px 12px; font-size: 11px; color: var(--ink-2); border-bottom: 1px solid var(--border-2); }
  .expiry-table tr:last-child td { border-bottom: none; }
  .exp-drug  { font-weight: 600; color: var(--ink); }
  .exp-batch { font-size: 10px; color: var(--ink-3); }
  .days-badge {
    padding: 2px 6px; border-radius: 4px;
    font-size: 10px; font-weight: 700;
  }
  .d30 { background: var(--red-dim);   color: var(--red); }
  .d60 { background: var(--amber-dim); color: var(--amber); }
  .d90 { background: var(--blue-dim);  color: var(--blue); }
  .at-risk-val { font-weight: 700; color: var(--ink); }

  /* ── Category bar chart ── */
  .category-panel {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-2); box-shadow: var(--shadow); overflow: hidden;
  }
  .category-panel-header { padding: 12px 14px; border-bottom: 1px solid var(--border-2); }
  .cat-bars { padding: 12px 14px; }
  .cat-bar-row {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px;
  }
  .cat-label {
    width: 100px; font-size: 10px; font-weight: 500; color: var(--ink-2);
    font-family: var(--font-ui); text-align: right; flex-shrink: 0;
  }
  .cat-bar-track {
    flex: 1; height: 14px; background: var(--surface); border-radius: 99px; overflow: hidden;
  }
  .cat-bar-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--teal) 0%, var(--teal-light) 100%);
    transition: width .6s cubic-bezier(.4,0,.2,1);
  }
  .cat-val {
    width: 60px; font-family: var(--font-data); font-size: 10px;
    font-weight: 600; color: var(--teal); text-align: right; flex-shrink: 0;
  }

  /* ── Price Controls ── */
  .price-panel {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-2); box-shadow: var(--shadow);
    margin-bottom: 18px; overflow: hidden;
  }
  .price-panel-header {
    padding: 12px 14px; border-bottom: 1px solid var(--border-2);
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, var(--teal-dim) 0%, var(--white) 60%);
  }
  .price-search {
    height: 30px; padding: 0 10px; width: 220px;
    border: 1.5px solid var(--border); border-radius: 6px;
    font-family: var(--font-data); font-size: 11px; color: var(--ink);
    background: var(--surface); outline: none; transition: border-color .12s;
  }
  .price-search:focus { border-color: var(--teal-light); }
  .price-table { width: 100%; border-collapse: collapse; font-family: var(--font-data); }
  .price-table th {
    padding: 7px 14px; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .5px; color: var(--ink-3);
    text-align: left; border-bottom: 1px solid var(--border-2);
    background: var(--surface);
  }
  .price-table td { padding: 8px 14px; font-size: 11px; color: var(--ink-2); border-bottom: 1px solid var(--border-2); }
  .price-table tr:last-child td { border-bottom: none; }
  .price-table tr:hover td { background: var(--surface); }
  .price-input {
    height: 28px; width: 110px; padding: 0 8px;
    border: 1.5px solid var(--border); border-radius: 5px;
    font-family: var(--font-data); font-size: 11px; color: var(--ink);
    background: var(--surface); outline: none; transition: border-color .12s;
  }
  .price-input:focus { border-color: var(--teal-light); box-shadow: 0 0 0 2px rgba(20,184,166,.15); }
  .margin-pill {
    display: inline-block; padding: 2px 7px; border-radius: 4px;
    font-size: 10px; font-weight: 700;
  }
  .margin-good { background: var(--green-dim); color: var(--green); }
  .margin-warn { background: var(--amber-dim); color: var(--amber); }
  .margin-low  { background: var(--red-dim);   color: var(--red);   }
  .save-price-btn {
    padding: 4px 10px; border-radius: 5px;
    border: 1px solid var(--teal); background: var(--teal-dim);
    font-family: var(--font-ui); font-size: 10px; font-weight: 700;
    color: var(--teal); cursor: pointer; transition: all .12s;
  }
  .save-price-btn:hover { background: var(--teal); color: #fff; }
  .saved-chip {
    padding: 4px 10px; border-radius: 5px;
    background: var(--green-dim); color: var(--green);
    font-size: 10px; font-weight: 700; font-family: var(--font-ui);
    border: 1px solid var(--green);
  }

  /* ── Debtors ── */
  .debtors-panel {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-2); box-shadow: var(--shadow);
    overflow: hidden; margin-bottom: 18px;
  }
  .debtors-header { padding: 12px 14px; border-bottom: 1px solid var(--border-2); }
  .debt-table { width: 100%; border-collapse: collapse; font-family: var(--font-data); }
  .debt-table th {
    padding: 7px 14px; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .5px; color: var(--ink-3);
    text-align: left; border-bottom: 1px solid var(--border-2); background: var(--surface);
  }
  .debt-table td { padding: 9px 14px; font-size: 12px; border-bottom: 1px solid var(--border-2); color: var(--ink-2); }
  .debt-table tr:last-child td { border-bottom: none; }
  .debt-name { font-weight: 600; color: var(--ink); font-family: var(--font-ui); font-size: 12px; }
  .debt-phone { font-family: var(--font-data); font-size: 10px; color: var(--ink-3); margin-top: 1px; }
  .debt-amount { font-weight: 700; color: var(--red); }
  .aging-badge {
    display: inline-block; padding: 2px 7px; border-radius: 4px;
    font-size: 10px; font-weight: 600;
  }
  .age-new    { background: var(--green-dim); color: var(--green); }
  .age-mid    { background: var(--amber-dim); color: var(--amber); }
  .age-old    { background: var(--red-dim);   color: var(--red); }
  .clear-debt-btn {
    padding: 4px 10px; border-radius: 5px;
    border: 1px solid var(--green); background: var(--green-dim);
    font-family: var(--font-ui); font-size: 10px; font-weight: 700;
    color: var(--green); cursor: pointer; transition: all .12s;
  }
  .clear-debt-btn:hover { background: var(--green); color: #fff; }
  .cleared-chip {
    font-size: 10px; font-weight: 700; color: var(--ink-3);
    font-family: var(--font-ui);
  }

  /* ── Staff performance ── */
  .staff-panel {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border-2); box-shadow: var(--shadow); overflow: hidden;
  }
  .staff-header { padding: 12px 14px; border-bottom: 1px solid var(--border-2); }
  .staff-rows { padding: 8px 14px; }
  .staff-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid var(--border-2);
  }
  .staff-row:last-child { border-bottom: none; }
  .staff-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
  .staff-info { flex: 1; }
  .staff-name { font-family: var(--font-ui); font-size: 12px; font-weight: 600; color: var(--ink); }
  .staff-role { font-family: var(--font-data); font-size: 10px; color: var(--ink-3); }
  .staff-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .staff-sales { font-family: var(--font-data); font-size: 12px; font-weight: 700; color: var(--teal); }
  .staff-txns  { font-size: 10px; color: var(--ink-3); font-family: var(--font-ui); }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 99;
    background: var(--emerald); color: #fff;
    padding: 10px 16px; border-radius: 8px;
    font-family: var(--font-ui); font-size: 12px; font-weight: 600;
    box-shadow: var(--shadow-md);
    animation: slideUp .2s ease;
  }
  @keyframes slideUp {
    from { opacity:0; transform: translateY(8px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

// ── Mock Data ──────────────────────────────────────────────────────────────────
const fmt = (n) => "₦" + Number(n).toLocaleString("en-NG");

const KPI_DATA = {
  today: { gross: 487500, profit: 183200, debt: 342000, expiringValue: 127600, gDelta: 12, pDelta: 8, txns: 34 },
  week:  { gross: 2340000, profit: 891000, debt: 342000, expiringValue: 127600, gDelta: 5, pDelta: -2, txns: 187 },
  month: { gross: 9870000, profit: 3610000, debt: 342000, expiringValue: 127600, gDelta: 18, pDelta: 11, txns: 804 },
};

const EXPIRY_BATCHES = [
  { id: "b1", drug: "Amoxil 500mg Caps", batch: "BATCH-25-11B", expiryDate: "2025-11-30", days: 24, qty: 12,  atRisk: 14400,  tier: 30 },
  { id: "b2", drug: "Vitamin C 200mg",   batch: "BATCH-26-06A", expiryDate: "2026-06-10", days: 51, qty: 5,   atRisk: 1000,   tier: 60 },
  { id: "b3", drug: "Lonart DS 80/480",  batch: "BATCH-26-08C", expiryDate: "2026-08-20", days: 72, qty: 88,  atRisk: 246400, tier: 90 },
  { id: "b4", drug: "Augmentin 625mg",   batch: "BATCH-26-07A", expiryDate: "2026-07-14", days: 55, qty: 36,  atRisk: 162000, tier: 60 },
  { id: "b5", drug: "Omeprazole 20mg",   batch: "BATCH-26-09B", expiryDate: "2026-09-22", days: 88, qty: 60,  atRisk: 36000,  tier: 90 },
];

const CATEGORIES = [
  { name: "Antimalarials",     sales: 2800000 },
  { name: "Antibiotics",       sales: 1920000 },
  { name: "Analgesics",        sales: 1340000 },
  { name: "Vitamins",          sales: 870000  },
  { name: "Gastrointestinals", sales: 640000  },
  { name: "Antihypertensives", sales: 410000  },
];

const DEBTORS = [
  { id: "d1", name: "Folake Adeyemi",     phone: "0803-456-7890", amount: 15000, daysAgo: 3,  cleared: false },
  { id: "d2", name: "Aminat Lawal",       phone: "0905-678-9012", amount: 7500,  daysAgo: 12, cleared: false },
  { id: "d3", name: "Babatunde Okafor",   phone: "0701-999-1234", amount: 32000, daysAgo: 31, cleared: false },
  { id: "d4", name: "Grace Eze",          phone: "0812-555-6677", amount: 4500,  daysAgo: 7,  cleared: false },
  { id: "d5", name: "Muhammed Abubakar",  phone: "0906-123-4567", amount: 11000, daysAgo: 45, cleared: false },
];

const PRICES_INIT = [
  { id: "p1", brand: "Panadol Extra",  generic: "Paracetamol+Caffeine", strength: "500mg/65mg", batch: "BATCH-26-03A", cost: 180,  price: 350  },
  { id: "p2", brand: "Amoxil",         generic: "Amoxicillin",          strength: "500mg",      batch: "BATCH-25-11B", cost: 700,  price: 1200 },
  { id: "p3", brand: "Lonart DS",      generic: "Artemether/Lumef.",    strength: "80/480mg",   batch: "BATCH-26-08C", cost: 1800, price: 2800 },
  { id: "p4", brand: "Flagyl",         generic: "Metronidazole",        strength: "200mg",      batch: "BATCH-27-12A", cost: 220,  price: 450  },
  { id: "p5", brand: "Coartem",        generic: "Artemether/Lumef.",    strength: "20/120mg",   batch: "BATCH-28-01A", cost: 2100, price: 3200 },
];

const STAFF = [
  { name: "Adaeze Okonkwo",  role: "Store Manager", sales: 1840000, txns: 112, color: "#0F766E" },
  { name: "Tijani Suleiman", role: "Store Manager", sales: 1290000, txns: 87,  color: "#0369A1" },
  { name: "Chinelo Ibe",     role: "Pharmacist",    sales: 960000,  txns: 61,  color: "#7C3AED" },
];

const NAV = [
  { id: "overview",  label: "Overview",       icon: "⊞" },
  { id: "prices",    label: "Price Controls",  icon: "⊙" },
  { id: "expiry",    label: "Expiry Alerts",   icon: "⚠" },
  { id: "debtors",   label: "Debtors",         icon: "◑", badge: 5 },
  { id: "staff",     label: "Staff Reports",   icon: "♟" },
  { id: "customers", label: "Customers",       icon: "⊛" },
];

function ageClass(d) { if (d <= 7) return "age-new"; if (d <= 21) return "age-mid"; return "age-old"; }
function ageLabel(d) { return `${d}d ago`; }
function marginClass(c, p) { const m = ((p-c)/p)*100; if (m >= 40) return "margin-good"; if (m >= 20) return "margin-warn"; return "margin-low"; }
function marginLabel(c, p) { return ((p-c)/p*100).toFixed(0) + "%"; }

// ── Component ──────────────────────────────────────────────────────────────────
export default function CEODashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [range, setRange] = useState("today");
  const [expTier, setExpTier] = useState(90);
  const [prices, setPrices] = useState(PRICES_INIT);
  const [savedRows, setSavedRows] = useState({});
  const [debtors, setDebtors] = useState(DEBTORS);
  const [toast, setToast] = useState(null);
  const [priceSearch, setPriceSearch] = useState("");

  const kpi = KPI_DATA[range];
  const maxCatSales = Math.max(...CATEGORIES.map(c => c.sales));
  const filteredExpiry = EXPIRY_BATCHES.filter(b => b.days <= expTier);
  const filteredPrices = PRICES_INIT.filter(p =>
    !priceSearch ||
    p.brand.toLowerCase().includes(priceSearch.toLowerCase()) ||
    p.generic.toLowerCase().includes(priceSearch.toLowerCase())
  );

  function flash(msg) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  function updatePrice(id, val) {
    setPrices(prev => prev.map(p => p.id === id ? { ...p, price: parseFloat(val) || p.price } : p));
    setSavedRows(s => ({ ...s, [id]: false }));
  }

  function savePrice(id) {
    setSavedRows(s => ({ ...s, [id]: true }));
    flash("Price update queued for sync to storefront");
    setTimeout(() => setSavedRows(s => ({ ...s, [id]: undefined })), 3000);
  }

  function clearDebt(id, name) {
    setDebtors(prev => prev.map(d => d.id === id ? { ...d, cleared: true } : d));
    flash(`${name.split(" ")[0]}'s debt marked as cleared`);
  }

  const totalDebt = debtors.filter(d => !d.cleared).reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <style>{STYLE}</style>
      <div className="ceo-shell">

        {/* ── Sidebar ── */}
        <div className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-name">Adabanija<br />Pharmacy</div>
            <div className="brand-sub">CEO Command Center</div>
          </div>

          <div className="sidebar-nav">
            <div className="nav-section-label">Management</div>
            {NAV.map(n => (
              <div key={n.id} className={`nav-item ${activeNav === n.id ? "active" : ""}`} onClick={() => setActiveNav(n.id)}>
                <span style={{ fontSize: 13 }}>{n.icon}</span>
                {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="ceo-avatar">
              <div className="avatar-circle">CC</div>
              <div className="avatar-info">
                <div className="avatar-name">CEO</div>
                <div className="avatar-role">REMOTE · CLOUD</div>
              </div>
              <div className="online-dot" />
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="ceo-main">

          {/* Topbar */}
          <div className="ceo-topbar">
            <div>
              <div className="page-title">
                {activeNav === "overview" && "Business Overview"}
                {activeNav === "prices" && "Price Controls"}
                {activeNav === "expiry" && "Expiry Alerts"}
                {activeNav === "debtors" && "Debtor Management"}
                {activeNav === "staff" && "Staff Performance"}
                {activeNav === "customers" && "Customer Directory"}
              </div>
              <div className="page-sub">
                {activeNav === "overview" && "Real-time storefront performance"}
                {activeNav === "prices" && "Update selling prices — changes sync to storefront"}
                {activeNav === "expiry" && "Batches at risk of expiry loss"}
                {activeNav === "debtors" && `${debtors.filter(d=>!d.cleared).length} active debtors · ${fmt(totalDebt)} outstanding`}
                {activeNav === "staff" && "Sales and transaction breakdown by staff"}
                {activeNav === "customers" && "All registered customer profiles"}
              </div>
            </div>
            <div className="topbar-actions">
              <div className="date-chip">
                {new Date().toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div className="sync-badge">
                <div className="sync-dot" />
                Live Sync
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="ceo-body">

            {/* ══ OVERVIEW ══ */}
            {activeNav === "overview" && (
              <>
                <div className="range-tabs">
                  {[["today","Today"],["week","This Week"],["month","This Month"]].map(([v,l]) => (
                    <button key={v} className={`range-tab ${range===v?"active":""}`} onClick={() => setRange(v)}>{l}</button>
                  ))}
                </div>

                {/* KPI Cards */}
                <div className="kpi-grid">
                  <div className="kpi-card kpi-green">
                    <div className="kpi-label">Gross Sales</div>
                    <div className="kpi-value"><span className="sym">₦</span>{(kpi.gross/1000).toFixed(0)}k</div>
                    <span className={`kpi-delta ${kpi.gDelta >= 0 ? "delta-up" : "delta-down"}`}>
                      {kpi.gDelta >= 0 ? "▲" : "▼"} {Math.abs(kpi.gDelta)}% vs last period
                    </span>
                    <div className="kpi-sub">{kpi.txns} transactions</div>
                  </div>
                  <div className="kpi-card kpi-teal">
                    <div className="kpi-label">Est. Net Profit</div>
                    <div className="kpi-value"><span className="sym">₦</span>{(kpi.profit/1000).toFixed(0)}k</div>
                    <span className={`kpi-delta ${kpi.pDelta >= 0 ? "delta-up" : "delta-down"}`}>
                      {kpi.pDelta >= 0 ? "▲" : "▼"} {Math.abs(kpi.pDelta)}% vs last period
                    </span>
                    <div className="kpi-sub">Margin: {((kpi.profit/kpi.gross)*100).toFixed(1)}%</div>
                  </div>
                  <div className="kpi-card kpi-amber">
                    <div className="kpi-label">Pending Debt</div>
                    <div className="kpi-value"><span className="sym">₦</span>{(kpi.debt/1000).toFixed(0)}k</div>
                    <span className="kpi-delta delta-down">▼ Owed by {debtors.filter(d=>!d.cleared).length} customers</span>
                    <div className="kpi-sub">Click Debtors to resolve</div>
                  </div>
                  <div className="kpi-card kpi-red">
                    <div className="kpi-label">Expiry-at-Risk Value</div>
                    <div className="kpi-value"><span className="sym">₦</span>{(kpi.expiringValue/1000).toFixed(0)}k</div>
                    <span className="kpi-delta delta-down">▲ {filteredExpiry.length} batches at risk</span>
                    <div className="kpi-sub">Stock expiring in &lt;90 days</div>
                  </div>
                </div>

                <div className="mid-grid">
                  {/* Expiry preview */}
                  <div className="expiry-panel">
                    <div className="expiry-panel-header">
                      <div className="section-hdr" style={{ margin: 0 }}>
                        <div className="section-title">⚠ Expiry Time Bomb <span className="section-pill">{filteredExpiry.length} batches</span></div>
                        <button className="view-all-btn" onClick={() => setActiveNav("expiry")}>See all →</button>
                      </div>
                      <div className="expiry-tabs">
                        {[[30,"30 days"],[60,"60 days"],[90,"90 days"]].map(([v,l]) => (
                          <button key={v} className={`exp-tab t${v} ${expTier===v?"active":""}`} onClick={() => setExpTier(v)}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div className="expiry-table-wrap">
                      <table className="expiry-table">
                        <thead><tr><th>Drug / Batch</th><th>Days Left</th><th>Qty</th><th>At Risk</th></tr></thead>
                        <tbody>
                          {filteredExpiry.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: "center", padding: "18px", color: "var(--ink-3)", fontSize: 11 }}>No batches expiring within {expTier} days</td></tr>
                          )}
                          {filteredExpiry.map(b => (
                            <tr key={b.id}>
                              <td>
                                <div className="exp-drug">{b.drug}</div>
                                <div className="exp-batch">{b.batch}</div>
                              </td>
                              <td><span className={`days-badge d${b.tier}`}>{b.days}d</span></td>
                              <td style={{ fontWeight: 600 }}>{b.qty}</td>
                              <td className="at-risk-val">{fmt(b.atRisk)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Category performance */}
                  <div className="category-panel">
                    <div className="category-panel-header">
                      <div className="section-title">Top Categories by Revenue</div>
                      <div style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--font-ui)", marginTop: 2 }}>{range === "today" ? "Today" : range === "week" ? "This week" : "This month"}</div>
                    </div>
                    <div className="cat-bars">
                      {CATEGORIES.map(c => (
                        <div className="cat-bar-row" key={c.name}>
                          <div className="cat-label">{c.name}</div>
                          <div className="cat-bar-track">
                            <div className="cat-bar-fill" style={{ width: (c.sales / maxCatSales * 100) + "%" }} />
                          </div>
                          <div className="cat-val">{fmt(c.sales/1000)}k</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Staff summary on overview */}
                <div className="staff-panel">
                  <div className="staff-header">
                    <div className="section-hdr" style={{ margin: 0 }}>
                      <div className="section-title">Staff Performance</div>
                      <button className="view-all-btn" onClick={() => setActiveNav("staff")}>Full report →</button>
                    </div>
                  </div>
                  <div className="staff-rows">
                    {STAFF.map(s => (
                      <div className="staff-row" key={s.name}>
                        <div className="staff-avatar" style={{ background: s.color }}>{s.name.split(" ").map(w=>w[0]).join("")}</div>
                        <div className="staff-info">
                          <div className="staff-name">{s.name}</div>
                          <div className="staff-role">{s.role}</div>
                        </div>
                        <div className="staff-stats">
                          <div className="staff-sales">{fmt(s.sales)}</div>
                          <div className="staff-txns">{s.txns} transactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ══ PRICE CONTROLS ══ */}
            {activeNav === "prices" && (
              <div className="price-panel">
                <div className="price-panel-header">
                  <div className="section-title">
                    Price Master Controls
                    <span className="section-pill">Changes sync to storefront</span>
                  </div>
                  <input className="price-search" placeholder="Search drug…"
                    value={priceSearch} onChange={e => setPriceSearch(e.target.value)} />
                </div>
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Drug / Batch</th>
                      <th>Strength</th>
                      <th>Cost Price</th>
                      <th>Selling Price</th>
                      <th>Margin</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.map(p => {
                      const current = prices.find(x => x.id === p.id) || p;
                      const isSaved = savedRows[p.id] === true;
                      const isDirty = savedRows[p.id] === false;
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 600, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink)" }}>{p.brand}</div>
                            <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.generic} · {p.batch}</div>
                          </td>
                          <td>{p.strength}</td>
                          <td style={{ color: "var(--ink-3)" }}>{fmt(p.cost)}</td>
                          <td>
                            <input
                              className="price-input"
                              type="number"
                              value={current.price}
                              onChange={e => updatePrice(p.id, e.target.value)}
                            />
                          </td>
                          <td>
                            <span className={`margin-pill ${marginClass(p.cost, current.price)}`}>
                              {marginLabel(p.cost, current.price)}
                            </span>
                          </td>
                          <td>
                            {isSaved
                              ? <span className="saved-chip">✓ Queued</span>
                              : <button className="save-price-btn" onClick={() => savePrice(p.id)}>
                                  {isDirty ? "⬆ Sync" : "Update"}
                                </button>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ══ EXPIRY ALERTS ══ */}
            {activeNav === "expiry" && (
              <div className="expiry-panel">
                <div className="expiry-panel-header">
                  <div className="section-hdr" style={{ margin: 0 }}>
                    <div className="section-title">⚠ Expiry Time Bomb <span className="section-pill">{EXPIRY_BATCHES.length} batches at risk</span></div>
                  </div>
                  <div className="expiry-tabs">
                    {[[30,"&lt;30 days"],[60,"&lt;60 days"],[90,"&lt;90 days"]].map(([v,l]) => (
                      <button key={v} className={`exp-tab t${v} ${expTier===v?"active":""}`} onClick={() => setExpTier(v)} dangerouslySetInnerHTML={{ __html: l }} />
                    ))}
                  </div>
                </div>
                <div className="expiry-table-wrap" style={{ maxHeight: "none" }}>
                  <table className="expiry-table">
                    <thead><tr><th>Drug / Batch</th><th>Expiry Date</th><th>Days Left</th><th>Qty Remaining</th><th>Value at Risk</th></tr></thead>
                    <tbody>
                      {EXPIRY_BATCHES.filter(b => b.days <= expTier).map(b => (
                        <tr key={b.id}>
                          <td>
                            <div className="exp-drug">{b.drug}</div>
                            <div className="exp-batch">{b.batch}</div>
                          </td>
                          <td style={{ fontFamily: "var(--font-data)", fontSize: 11 }}>{b.expiryDate}</td>
                          <td><span className={`days-badge d${b.tier}`}>{b.days} days</span></td>
                          <td style={{ fontWeight: 600 }}>{b.qty} units</td>
                          <td className="at-risk-val">{fmt(b.atRisk)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ DEBTORS ══ */}
            {activeNav === "debtors" && (
              <div className="debtors-panel">
                <div className="debtors-header">
                  <div className="section-hdr" style={{ margin: 0 }}>
                    <div className="section-title">
                      Active Debtors
                      <span className="section-pill">{fmt(totalDebt)} total outstanding</span>
                    </div>
                  </div>
                </div>
                <table className="debt-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Debt Amount</th>
                      <th>Age</th>
                      <th>Risk</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debtors.map(d => (
                      <tr key={d.id} style={{ opacity: d.cleared ? .4 : 1 }}>
                        <td>
                          <div className="debt-name">{d.name}</div>
                          <div className="debt-phone">{d.phone}</div>
                        </td>
                        <td className="debt-amount">{d.cleared ? <span style={{ color: "var(--green)", fontWeight: 700 }}>Cleared</span> : fmt(d.amount)}</td>
                        <td style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--ink-3)" }}>{ageLabel(d.daysAgo)}</td>
                        <td><span className={`aging-badge ${ageClass(d.daysAgo)}`}>{d.daysAgo <= 7 ? "New" : d.daysAgo <= 21 ? "Moderate" : "High Risk"}</span></td>
                        <td>
                          {d.cleared
                            ? <span className="cleared-chip">✓ Done</span>
                            : <button className="clear-debt-btn" onClick={() => clearDebt(d.id, d.name)}>Mark Cleared</button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ══ STAFF ══ */}
            {activeNav === "staff" && (
              <div className="staff-panel">
                <div className="staff-header">
                  <div className="section-title">Staff Sales Breakdown</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-ui)", marginTop: 2 }}>All-time totals · Click a manager to see daily drill-down</div>
                </div>
                <div className="staff-rows" style={{ padding: "12px 16px" }}>
                  {STAFF.map((s, i) => (
                    <div className="staff-row" key={s.name} style={{ padding: "12px 0" }}>
                      <div style={{ width: 24, fontFamily: "var(--font-data)", fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>#{i+1}</div>
                      <div className="staff-avatar" style={{ background: s.color, width: 36, height: 36 }}>{s.name.split(" ").map(w=>w[0]).join("")}</div>
                      <div className="staff-info">
                        <div className="staff-name">{s.name}</div>
                        <div className="staff-role">{s.role}</div>
                      </div>
                      <div style={{ flex: 1, padding: "0 20px" }}>
                        <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: (s.sales / STAFF[0].sales * 100) + "%", background: s.color, borderRadius: 99, transition: "width .6s" }} />
                        </div>
                      </div>
                      <div className="staff-stats">
                        <div className="staff-sales" style={{ color: s.color }}>{fmt(s.sales)}</div>
                        <div className="staff-txns">{s.txns} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ CUSTOMERS (placeholder) ══ */}
            {activeNav === "customers" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--ink-3)", fontFamily: "var(--font-ui)", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 32 }}>⊛</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Customer Directory</div>
                <div style={{ fontSize: 12 }}>Full customer profiles, debt history, and contact details — coming in Phase 3</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
