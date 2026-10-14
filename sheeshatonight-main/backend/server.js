const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============ INTERACTIVE API CONSOLE DASHBOARD ============
app.get('/', (req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  const mins = Math.floor(uptimeSec / 60);
  const secs = uptimeSec % 60;
  const uptimeFormatted = `${mins}m ${secs}s`;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SheeshaTonight - API Server Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0712;
      --card: #150f21;
      --card-border: #281c3d;
      --purple: #8e22c4;
      --purple-light: #b854ed;
      --gold: #f1a51d;
      --text: #f5eff9;
      --muted: #968ba3;
      --get: #10b981;
      --post: #3b82f6;
      --patch: #f59e0b;
      --delete: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 36px 20px 80px;
      min-height: 100vh;
      background-image: radial-gradient(circle at 50% -20%, rgba(142, 34, 196, 0.22) 0%, transparent 60%);
    }
    .container {
      max-width: 1080px;
      margin: 0 auto;
    }
    .top-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 18px;
      margin-bottom: 28px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: linear-gradient(135deg, #74189b, #b854ed);
      display: grid;
      place-items: center;
      font-size: 22px;
      box-shadow: 0 8px 24px rgba(116, 24, 155, 0.45);
    }
    .brand h1 {
      font-size: 21px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
    }
    .brand p {
      font-size: 12.5px;
      color: var(--muted);
      margin-top: 2px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .btn-primary {
      background: linear-gradient(135deg, #74189b, #a229db);
      color: white;
      border: 1px solid #c052f5;
      box-shadow: 0 4px 18px rgba(142, 34, 196, 0.35);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(142, 34, 196, 0.55);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      color: var(--text);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 16px;
      margin-bottom: 34px;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px 20px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .stat-card:hover {
      border-color: #4a3468;
      transform: translateY(-2px);
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--muted);
      margin-bottom: 8px;
      font-weight: 700;
    }
    .stat-val {
      font-size: 22px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 12px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #fff;
    }
    .section-desc {
      font-size: 12px;
      color: var(--muted);
    }
    .endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 36px;
    }
    .endpoint-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      transition: all 0.2s;
    }
    .endpoint-card:hover {
      border-color: #5d3f82;
      background: #191228;
    }
    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 9px;
      border-radius: 6px;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .badge-get { background: rgba(16, 185, 129, 0.15); color: var(--get); border: 1px solid rgba(16, 185, 129, 0.35); }
    .badge-post { background: rgba(59, 130, 246, 0.15); color: var(--post); border: 1px solid rgba(59, 130, 246, 0.35); }
    .badge-patch { background: rgba(245, 158, 11, 0.15); color: var(--patch); border: 1px solid rgba(245, 158, 11, 0.35); }
    .endpoint-info {
      min-width: 0;
    }
    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13.5px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .endpoint-desc {
      font-size: 12px;
      color: var(--muted);
      margin-top: 3px;
    }
    .test-btn {
      font-size: 11.5px;
      font-weight: 700;
      padding: 7px 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .test-btn:hover {
      background: var(--purple);
      border-color: var(--purple);
      color: white;
      transform: scale(1.04);
    }
    /* Response viewer */
    #viewer-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    #viewer-modal.open {
      display: flex;
    }
    .modal-box {
      background: #150f21;
      border: 1px solid var(--card-border);
      border-radius: 16px;
      max-width: 650px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      overflow: hidden;
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: var(--gold);
    }
    .modal-close {
      background: transparent;
      border: 0;
      color: var(--muted);
      font-size: 20px;
      cursor: pointer;
      padding: 4px 8px;
    }
    .modal-close:hover { color: #fff; }
    .modal-body {
      padding: 20px;
      overflow-y: auto;
    }
    pre {
      background: #0d0914;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      color: #a5f3fc;
      overflow-x: auto;
      line-height: 1.5;
    }
    .status-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 12px;
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-bar">
      <div class="brand">
        <div class="brand-icon">💨</div>
        <div>
          <h1>SheeshaTonight API Hub</h1>
          <p>Express Microservice Server • Port 5000</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-secondary" onclick="testEndpoint('GET', '/api/health')">⚡ Health Check</button>
        <a href="http://localhost:3000" class="btn btn-primary" target="_blank">🌐 Open Web Store (Port 3000)</a>
      </div>
    </div>

    <!-- Live Status Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">API Server Status</div>
        <div class="stat-val" style="color: #10b981;">
          <span class="status-dot"></span> Online (5000)
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Frontend Web App</div>
        <div class="stat-val" style="color: #c052f5;">
          🚀 Port 3000 Ready
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Uptime</div>
        <div class="stat-val" style="color: var(--gold); font-family: 'JetBrains Mono';">
          ${uptimeFormatted}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Environment</div>
        <div class="stat-val" style="font-size: 18px; color: #fff;">
          Node.js • Development
        </div>
      </div>
    </div>

    <!-- Interactive Endpoints -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Available API Endpoints</h2>
        <p class="section-desc">Click "Test API" on any route below to test and inspect the live JSON response.</p>
      </div>
    </div>

    <div class="endpoints-list">
      <!-- Health -->
      <div class="endpoint-card">
        <div class="endpoint-left">
          <span class="badge badge-get">GET</span>
          <div class="endpoint-info">
            <div class="endpoint-path">/api/health</div>
            <div class="endpoint-desc">Server health & uptime status check</div>
          </div>
        </div>
        <button class="test-btn" onclick="testEndpoint('GET', '/api/health')">Test API</button>
      </div>

      <!-- Search Discovery -->
      <div class="endpoint-card">
        <div class="endpoint-left">
          <span class="badge badge-get">GET</span>
          <div class="endpoint-info">
            <div class="endpoint-path">/api/search?lat=25.2048&lng=55.2708&radius=10</div>
            <div class="endpoint-desc">Nearby lounge and shisha vendor geolocation discovery</div>
          </div>
        </div>
        <button class="test-btn" onclick="testEndpoint('GET', '/api/search?lat=25.2048&lng=55.2708&radius=10')">Test API</button>
      </div>

      <!-- Products -->
      <div class="endpoint-card">
        <div class="endpoint-left">
          <span class="badge badge-get">GET</span>
          <div class="endpoint-info">
            <div class="endpoint-path">/api/products/v1</div>
            <div class="endpoint-desc">Product catalog details and live vendor inventory</div>
          </div>
        </div>
        <button class="test-btn" onclick="testEndpoint('GET', '/api/products/v1')">Test API</button>
      </div>

      <!-- Auth Login -->
      <div class="endpoint-card">
        <div class="endpoint-left">
          <span class="badge badge-post">POST</span>
          <div class="endpoint-info">
            <div class="endpoint-path">/api/auth/login</div>
            <div class="endpoint-desc">Customer OTP authentication & session generator</div>
          </div>
        </div>
        <button class="test-btn" onclick="testEndpoint('POST', '/api/auth/login', { phone: '+971501234567' })">Test API</button>
      </div>

      <!-- Age Gate Verify -->
      <div class="endpoint-card">
        <div class="endpoint-left">
          <span class="badge badge-post">POST</span>
          <div class="endpoint-info">
            <div class="endpoint-path">/api/auth/age-gate-verify</div>
            <div class="endpoint-desc">Legal 21+ age verification token exchange</div>
          </div>
        </div>
        <button class="test-btn" onclick="testEndpoint('POST', '/api/auth/age-gate-verify', { sessionId: 'sess_123', ageVerified: true })">Test API</button>
      </div>

      <!-- Orders Checkout -->
      <div class="endpoint-card">
        <div class="endpoint-left">
          <span class="badge badge-post">POST</span>
          <div class="endpoint-info">
            <div class="endpoint-path">/api/cart/checkout</div>
            <div class="endpoint-desc">Process booking, cart checkout and order dispatch</div>
          </div>
        </div>
        <button class="test-btn" onclick="testEndpoint('POST', '/api/cart/checkout', { userId: 'u1', vendorId: 'v1', totalAmount: 189 })">Test API</button>
      </div>

      <!-- Pending Vendors -->
      <div class="endpoint-card">
        <div class="endpoint-left">
          <span class="badge badge-get">GET</span>
          <div class="endpoint-info">
            <div class="endpoint-path">/api/admin/vendors/pending</div>
            <div class="endpoint-desc">Admin review queue for vendor KYC & commercial licenses</div>
          </div>
        </div>
        <button class="test-btn" onclick="testEndpoint('GET', '/api/admin/vendors/pending')">Test API</button>
      </div>
    </div>
  </div>

  <!-- Live Response Modal -->
  <div id="viewer-modal" onclick="if(event.target===this)closeModal()">
    <div class="modal-box">
      <div class="modal-header">
        <span class="modal-title" id="modal-req-title">GET /api/health</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="status-badge" id="modal-status-badge">HTTP 200 OK • 12ms</div>
        <pre><code id="modal-code">Loading...</code></pre>
      </div>
    </div>
  </div>

  <script>
    async function testEndpoint(method, url, body = null) {
      const modal = document.getElementById('viewer-modal');
      const title = document.getElementById('modal-req-title');
      const statusBadge = document.getElementById('modal-status-badge');
      const code = document.getElementById('modal-code');

      title.textContent = method + ' ' + url;
      statusBadge.textContent = 'Executing request...';
      code.textContent = 'Waiting for response...';
      modal.classList.add('open');

      const start = performance.now();
      try {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const duration = Math.round(performance.now() - start);
        const data = await res.json();
        
        statusBadge.textContent = 'HTTP ' + res.status + ' ' + res.statusText + ' • ' + duration + 'ms';
        statusBadge.style.background = res.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        statusBadge.style.color = res.ok ? '#10b981' : '#ef4444';
        code.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        statusBadge.textContent = 'Request Failed';
        statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        statusBadge.style.color = '#ef4444';
        code.textContent = err.toString();
      }
    }

    function closeModal() {
      document.getElementById('viewer-modal').classList.remove('open');
    }
  </script>
</body>
</html>`);
});

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/login', (req, res) => {
  const { phone, email } = req.body;
  console.log(`[AUTH] Login request: ${phone || email}`);
  
  res.json({
    success: true,
    message: 'OTP sent successfully',
    sessionId: `sess_${Date.now()}`,
  });
});

app.post('/api/auth/age-gate-verify', (req, res) => {
  const { sessionId, ageVerified } = req.body;
  
  if (!ageVerified) {
    return res.status(400).json({ success: false, message: 'Age verification required' });
  }
  
  res.json({
    success: true,
    message: 'Age verified',
    authToken: `token_${Date.now()}`,
    user: {
      id: 'user_123',
      role: 'CUSTOMER',
      email: 'user@sheesha.ae',
    },
  });
});

// ============ SEARCH & DISCOVERY ============
app.get('/api/search', (req, res) => {
  const { lat, lng, radius } = req.query;
  console.log(`[SEARCH] Nearby venues: lat=${lat}, lng=${lng}, radius=${radius}km`);
  
  res.json({
    success: true,
    data: [
      {
        id: 'v1',
        name: 'Bespoke Sheesha Co.',
        distance: 0.8,
        rating: 4.8,
        reviews: 342,
      },
      {
        id: 'v2',
        name: 'The Ember Room',
        distance: 1.2,
        rating: 4.6,
        reviews: 215,
      },
    ],
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[PRODUCTS] Fetching product: ${id}`);
  
  res.json({
    success: true,
    data: {
      id,
      title: 'Premium Turkish Blend',
      price: 89.99,
      stock: 45,
      vendor: 'Bespoke Sheesha Co.',
    },
  });
});

// ============ BOOKING & ORDERS ============
app.post('/api/cart/checkout', (req, res) => {
  const { userId, vendorId, items, totalAmount } = req.body;
  console.log(`[CHECKOUT] Order for user ${userId}, vendor ${vendorId}, total ${totalAmount}`);
  
  const orderId = `ORD-2026-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`;
  
  res.json({
    success: true,
    orderId,
    status: 'PREPARING',
    message: 'Order placed successfully',
  });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`[ORDERS] Update order ${id} status: ${status}`);
  
  res.json({
    success: true,
    orderId: id,
    newStatus: status,
  });
});

// ============ ADMIN OPERATIONS ============
app.get('/api/admin/vendors/pending', (req, res) => {
  console.log('[ADMIN] Fetching pending vendor KYC approvals');
  
  res.json({
    success: true,
    data: [
      {
        vendorId: 'v1',
        name: 'Bespoke Sheesha Co.',
        status: 'PENDING',
        licenseUrl: 'https://s3.../license-001.pdf',
      },
      {
        vendorId: 'v2',
        name: 'The Ember Room',
        status: 'PENDING',
        identityUrl: 'https://s3.../identity-002.pdf',
      },
    ],
  });
});

app.patch('/api/admin/vendors/:id/approve', (req, res) => {
  const { id } = req.params;
  console.log(`[ADMIN] Approved vendor ${id}`);
  
  res.json({
    success: true,
    vendorId: id,
    newStatus: 'APPROVED',
  });
});

app.patch('/api/admin/vendors/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  console.log(`[ADMIN] Rejected vendor ${id}: ${reason}`);
  
  res.json({
    success: true,
    vendorId: id,
    newStatus: 'REJECTED',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SheeshaTonight Backend running on port ${PORT}`);
});
