# Keji Pharmacy — Troubleshooting Guide
### How to diagnose and fix every probable failure

---

## Step 0 — Run the Diagnostic Tools First

Before reading the scenarios below, run these two tools. They will tell you
exactly which scenario applies to you.

### Backend diagnostic
```cmd
cd C:\Keji\backend
venv\Scripts\activate
python diagnose.py
```
Read the output top to bottom. Fix every ✗ line before moving on.

### Frontend diagnostic

1. Add `DiagnosePage.jsx` to your `src/pages/` folder
2. In `App.jsx`, add this route inside the protected block:
   ```jsx
   <Route path="diag" element={<DiagnosePage />} />
   ```
3. Log in normally, then go to `http://localhost:5173/diag`
4. Click **Run All Tests**
5. Every red row is a broken API call — the status code and error message
   tell you exactly which scenario below to follow

---

## How to Read HTTP Status Codes

| Code | Meaning | Where the error is |
|------|---------|--------------------|
| 401  | Unauthenticated — token is missing, wrong, or expired | JWT / auth_utils |
| 403  | Authenticated but wrong role (manager hitting CEO route) | Normal — not a bug |
| 404  | Route does not exist | Router not registered in main.py |
| 422  | Request body/params failed validation | Pydantic schema mismatch |
| 500  | Python exception on the server | Check uvicorn terminal |
| 0/ERR | Fetch failed before reaching server | Backend not running |

---

## Scenario A — 401 on Every Protected Route After Login

**Symptom:** Login succeeds, but every subsequent request (Sales, Customers,
Inventory, CEO) immediately returns 401 and logs you out.

**Root cause options (in order of likelihood):**

### A1 — `python-jose` is still installed alongside `PyJWT`

They conflict. Jose intercepts the `jwt` namespace and breaks decoding.

**Check:**
```cmd
pip list | findstr jose
pip list | findstr jwt
```

You should see `PyJWT` and nothing containing `jose`.

**Fix:**
```cmd
pip uninstall python-jose python-jose[cryptography] -y
pip install PyJWT==2.8.0
```

Restart uvicorn after.

---

### A2 — `SECRET_KEY` in `.env` does not match what was used to sign the token

If you changed the SECRET_KEY after logging in, all existing tokens are invalid.

**Fix:** Log out, log back in. The new token will be signed with the current key.

---

### A3 — Token is not being sent from the frontend

The token lives in memory (`_token` variable in `api/index.js`). If you
refreshed the page, it is gone — the app does not persist it to localStorage.

**Check:** Open Chrome DevTools → Application tab → Local Storage and
Session Storage. Both should be empty (we intentionally store nothing there).

**Fix:** Every time you refresh the page, you must log in again. This is
by design for a shared pharmacy terminal. In production, you would add
`sessionStorage` to persist across refreshes without surviving a tab close.

**Quick sessionStorage fix** — in `src/context/AuthContext.jsx`, change the
`login` function:

```jsx
const login = useCallback(async (email, password) => {
  const data = await api.login(email, password);
  // Persist token so page refresh does not log you out
  sessionStorage.setItem("ada_token", data.access_token);
  setUser({
    user_id:   data.user_id,
    full_name: data.full_name,
    role:      data.role,
  });
  return data;
}, []);
```

And restore it on load:

```jsx
// Add this useEffect inside AuthProvider, after the useState declarations:
useEffect(() => {
  const saved = sessionStorage.getItem("ada_token");
  if (saved) {
    api.setToken(saved);
    api.getMyProfile()
      .then(profile => setUser({
        user_id:   profile.id,
        full_name: profile.full_name,
        role:      profile.role,
      }))
      .catch(() => {
        sessionStorage.removeItem("ada_token");
        api.clearToken();
      });
  }
}, []);
```

And in the logout function:
```jsx
const logout = useCallback(() => {
  sessionStorage.removeItem("ada_token");
  api.clearToken();
  setUser(null);
}, []);
```

---

### A4 — The `sub` field in the token payload is not a plain string

PyJWT is strict: if `sub` is a UUID object instead of a string, encoding
succeeds but decoding produces a different type, causing the user lookup to fail.

**Check in `diagnose.py`:** Look at test #10 — it simulates a full login and
prints the decoded `sub`. It should be a plain UUID string like:
`00000000-0000-0000-0000-000000000001`

**Fix:** Already applied in the fixed `auth_utils.py`. Make sure you copied it.
The key line in `routers/auth.py` is:
```python
token = create_access_token(data={"sub": str(user.id), "role": user.role})
```

---

## Scenario B — 500 Internal Server Error

**Symptom:** The request reaches the server but crashes with a 500.
The browser shows a 500 status code. The uvicorn terminal shows a Python traceback.

**How to read the traceback:**
The uvicorn terminal is your most important tool. Find the last few lines of
the red traceback — they show the exact file, line number, and Python error.

Common 500 causes:

### B1 — `column "balance_due" is a generated column`

SQLAlchemy is trying to INSERT or UPDATE the `balance_due` column, which is
a PostgreSQL `GENERATED ALWAYS AS` computed column. Python is not allowed to
write to it.

**Fix in `models.py`:** The `balance_due`, `line_total`, and `line_profit`
columns must be declared without `Computed()`:
```python
balance_due = Column(Numeric(12, 2))   # read-only, computed by Postgres
```
Already fixed in the updated `models.py`. Make sure you copied it.

**Fix in `routers/sales.py`:** Never set `balance_due` directly when
constructing a Sale object. SQLAlchemy must only set `total_amount`
and `total_paid`.

---

### B2 — `relation "product_stock_summary" does not exist`

The view was not created when you ran `schema.sql`, or it failed silently.

**Fix:**
```cmd
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d Keji_pharmacy
```
```sql
-- Check if the view exists
\dv

-- If not, create it manually — copy the CREATE OR REPLACE VIEW block
-- from schema.sql and paste it here
```

---

### B3 — `No module named 'routers'`

Python cannot find the routers package.

**Fix:** Make sure `C:\Keji\backend\routers\__init__.py` exists (it can
be completely empty):
```cmd
type nul > C:\Keji\backend\routers\__init__.py
```

Also make sure uvicorn is being run from inside the `backend` folder:
```cmd
cd C:\Keji\backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### B4 — `operator does not exist: uuid = character varying`

PostgreSQL is comparing a UUID column to a plain string and refusing.

**Fix:** This happens when `as_uuid=True` is used in SQLAlchemy but the
value passed is a string. The fixed `models.py` uses `as_uuid=False`
throughout, which stores and compares as `varchar`. If you still see this:

```python
# In any query, wrap IDs in str() explicitly:
db.query(models.User).filter(models.User.id == str(user_id))
```

---

## Scenario C — 422 Validation Error

**Symptom:** The request reaches the server but fails with 422. The DiagnosePage
shows the error message in red. It usually looks like:
`body.items.0.quantity: value is not a valid integer`

This means the data shape sent from the frontend does not match what the
FastAPI Pydantic schema expects.

### C1 — Sale items missing `batch_id`

In `POSPage.jsx`, the cart item must have `active_batch_id` populated.
If a product has no active batch (out of stock), `active_batch_id` is null,
and the sale will fail validation.

**Fix:** The add-to-cart button is already disabled for out-of-stock items.
But if you're building the payload manually, check:
```js
items: cart.map(i => ({
  product_id: i.product_id,   // must be a non-null UUID string
  batch_id:   i.active_batch_id,  // must be a non-null UUID string
  quantity:   i.qty,          // must be a positive integer
}))
```

### C2 — Payment amount is 0 for an unpaid sale

The backend validates that `amount > 0`. For unpaid sales, send an empty
payments array:
```js
payments: payStatus === "unpaid" ? [] : [{ payment_type: payType, amount: paid }]
```

---

## Scenario D — CEO Page is Blank / Shows No Data

**Symptom:** The CEO dashboard loads (no 401), but all KPI cards show zeros
or the page is empty.

### D1 — No sales in the database yet

The reports endpoints aggregate sales data. If there are no sales, the KPIs
return zeros. This is correct behaviour.

**Fix:** Make a test sale on the POS first, then check the dashboard.

### D2 — Date range mismatch

The CEO page sends `date_from` and `date_to` to the reports API. If the
sales in the database are from seed data with old dates (e.g., timestamps
from the future or past), they may fall outside the "Today" range.

**Check:**
```sql
SELECT sale_date FROM sales ORDER BY sale_date DESC LIMIT 5;
```

If the dates don't match today, either switch to "This Month" on the
dashboard, or make a fresh sale.

### D3 — The reports router is not registered in `main.py`

**Check:** Go to `http://localhost:8000/docs` and look for the "Reports"
section. If it's missing, the router was not registered.

**Fix in `main.py`:**
```python
from routers import auth, products, inventory, sales, customers, payments, reports
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
```

### D4 — `daily_sales_summary` view missing

Same as B2 but for the daily view. Check with `\dv` in psql and recreate
if missing.

---

## Scenario E — Frontend Tabs Appear Empty (No Error, Just Blank)

**Symptom:** The page loads without logging you out, no error toast appears,
but the table is empty even though data exists in the database.

### E1 — API call succeeds but returns empty array

The filter params are too restrictive. Check the Network tab in DevTools:
click the request for `/api/sales` or `/api/customers` and look at the
**Response** tab. If it returns `[]`, the query ran fine but found nothing.

**Common cause:** The sales router filters by `served_by = current_user.id`
for managers. If the logged-in manager has never made a sale, their history
will be empty. Log in as CEO to see all sales.

### E2 — Component crashes silently before rendering

Open Chrome DevTools → **Console** tab. Look for red JavaScript errors.
A crash in the component's render function produces a blank page with no
toast because the toast system itself may not have rendered.

The error message in the console will point to the exact line.

---

## Scenario F — Cannot Connect (ERR or Status 0)

**Symptom:** DiagnosePage shows status 0 or "Cannot reach the server" on all tests.

### F1 — Backend not running

```cmd
# Check if port 8000 is in use
netstat -an | findstr 8000
```

If nothing shows, the backend is not running. Start it:
```cmd
cd C:\Keji\backend
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### F2 — Vite proxy not working

The frontend uses Vite's proxy to forward `/api` to `localhost:8000`.
If the proxy breaks, all API calls fail with status 0.

**Check `vite.config.js`:**
```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
    },
  },
},
```

Restart `npm run dev` after any change to `vite.config.js`.

---

## Quick Reference — Uvicorn Log Reading

Every request the backend processes appears in the uvicorn terminal.
Here is how to read it:

```
INFO:     127.0.0.1:52341 - "GET /api/sales HTTP/1.1" 200 OK           ← Normal
INFO:     127.0.0.1:52342 - "GET /api/reports/kpi HTTP/1.1" 401        ← Auth failure
INFO:     127.0.0.1:52343 - "POST /api/sales HTTP/1.1" 422             ← Bad request body
ERROR:    Exception in ASGI application                                 ← Python crash follows
Traceback (most recent call last):
  File "routers/sales.py", line 87, in create_sale                     ← Exact location
    batch.quantity_remaining -= v["quantity"]
AttributeError: 'NoneType' object has no attribute ...                  ← Exact error
```

The traceback tells you the file, line number, and error type. That is
enough to fix any 500 error.

---

## The 3-Minute Diagnosis Checklist

If something breaks and you are not sure where to start:

1. **Check the uvicorn terminal** — is there a red traceback?
   Yes → read the last 5 lines. That is your error.

2. **Check the browser Console** (F12 → Console) — is there a red JS error?
   Yes → that is a frontend crash, not a backend issue.

3. **Check the browser Network tab** (F12 → Network) — find the red request.
   What is the status code? → match it to the scenarios above.

4. **Run `python diagnose.py`** — does it report any ✗?
   Yes → fix those first before anything else.

5. **Run the DiagnosePage** — which specific endpoints are failing?
   That narrows it to one router file.

In almost every case, steps 1–3 alone will identify the problem in under
3 minutes.
