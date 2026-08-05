import { Child, FC } from "hono/jsx";

const DashboardLayout: FC<{
  children: Child;
  title?: string;
  activePath?: string;
}> = (props) => {
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      path: "dashboard",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    },
    {
      label: "Perangkat WA",
      href: "/dashboard/sessions",
      path: "sessions",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    },
    {
      label: "Kirim Pesan",
      href: "/dashboard/messages",
      path: "messages",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    },
    {
      label: "Log Pesan",
      href: "/dashboard/log",
      path: "log",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    },
    {
      label: "Log Sistem",
      href: "/dashboard/system-logs",
      path: "system-logs",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    },
    {
      label: "Panduan API",
      href: "/dashboard/api-docs",
      path: "api-docs",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    },
  ];

  return (
    <html>
      <head>
        <title>{props.title || "WA Gateway"}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/style.css" />
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #071a0f; color: #e2e8f0; font-family: 'Inter', 'Segoe UI', sans-serif; min-height: 100vh; display: flex; }

          /* Sidebar */
          .sidebar {
            width: 260px;
            min-height: 100vh;
            background: #061610;
            border-right: 1px solid rgba(0,200,80,0.12);
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 100;
            transition: transform 0.3s ease;
          }
          .sidebar-logo {
            padding: 28px 24px 20px 24px;
            border-bottom: 1px solid rgba(0,200,80,0.1);
          }
          .sidebar-logo-title {
            font-size: 1.15rem;
            font-weight: 800;
            color: #22c55e;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .sidebar-logo-sub {
            font-size: 0.7rem;
            color: #4ade80;
            opacity: 0.6;
            margin-top: 2px;
            letter-spacing: 0.05em;
          }
          .sidebar-section-label {
            font-size: 0.65rem;
            font-weight: 700;
            color: #4ade80;
            opacity: 0.5;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            padding: 20px 24px 8px 24px;
          }
          .sidebar-nav { padding: 4px 12px; flex: 1; }
          .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 11px 14px;
            border-radius: 10px;
            color: #94a3b8;
            text-decoration: none;
            font-size: 0.92rem;
            font-weight: 500;
            transition: all 0.18s ease;
            margin-bottom: 2px;
            position: relative;
          }
          .nav-item:hover {
            background: rgba(34,197,94,0.09);
            color: #4ade80;
          }
          .nav-item.active {
            background: rgba(34,197,94,0.13);
            color: #22c55e;
            font-weight: 600;
            border: 1px solid rgba(34,197,94,0.25);
          }
          .nav-item.active::before {
            content: '';
            position: absolute;
            left: -12px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 60%;
            background: #22c55e;
            border-radius: 0 4px 4px 0;
            box-shadow: 0 0 10px rgba(34,197,94,0.5);
          }
          .nav-icon { flex-shrink: 0; opacity: 0.8; }
          .nav-item.active .nav-icon { opacity: 1; }

          /* Sidebar footer */
          .sidebar-footer {
            padding: 16px 20px;
            border-top: 1px solid rgba(0,200,80,0.1);
          }
          .sidebar-logout {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 14px;
            border-radius: 8px;
            color: #f87171;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.18s ease;
          }
          .sidebar-logout:hover { background: rgba(239,68,68,0.12); }

          /* Main content */
          .main-wrapper {
            margin-left: 260px;
            flex: 1;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          /* Top bar */
          .topbar {
            height: 58px;
            background: rgba(6,22,16,0.85);
            border-bottom: 1px solid rgba(0,200,80,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 28px;
            position: sticky;
            top: 0;
            z-index: 50;
            backdrop-filter: blur(8px);
          }
          .topbar-title {
            font-size: 0.88rem;
            color: #4ade80;
            opacity: 0.7;
            font-weight: 500;
          }
          .topbar-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            color: #22c55e;
            background: rgba(34,197,94,0.1);
            border: 1px solid rgba(34,197,94,0.2);
            padding: 4px 12px;
            border-radius: 20px;
          }
          .topbar-badge-dot {
            width: 6px; height: 6px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(0.85); }
          }

          /* Page content */
          .page-content {
            padding: 32px 32px;
            flex: 1;
          }
          .page-header {
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(0,200,80,0.1);
          }
          .page-header h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #f0fdf4;
          }
          .page-header p {
            font-size: 0.85rem;
            color: #64748b;
            margin-top: 4px;
          }

          /* Cards */
          .card {
            background: rgba(6,22,16,0.8);
            border: 1px solid rgba(34,197,94,0.15);
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
          }
          .card:hover {
            border-color: rgba(34,197,94,0.3);
            transition: border-color 0.2s ease;
          }

          /* Mobile hamburger */
          .hamburger { display: none; cursor: pointer; color: #4ade80; }
          .sidebar-overlay { display: none; }

          @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .main-wrapper { margin-left: 0; }
            .hamburger { display: block; }
            .page-content { padding: 20px 16px; }
            .sidebar-overlay {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.5);
              z-index: 99;
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.3s;
            }
            .sidebar-overlay.open { opacity: 1; pointer-events: auto; }
          }
        `}</style>
      </head>
      <body>
        {/* Sidebar */}
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-logo">
            <div class="sidebar-logo-title">WA Gateway</div>
            <div class="sidebar-logo-sub">MAUDY NETWORK SYSTEM</div>
          </div>

          <div class="sidebar-section-label">MAIN</div>
          <nav class="sidebar-nav">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.href}
                class={`nav-item${props.activePath === item.path ? " active" : ""}`}
              >
                <span
                  class="nav-icon"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                {item.label}
              </a>
            ))}
          </nav>

          <div class="sidebar-footer">
            <div style="margin-bottom: 12px; padding: 0 4px;">
              <label for="notification-sound-select" style="display:block;font-size:0.7rem;color:#64748b;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700">Suara Notifikasi</label>
              <select id="notification-sound-select" style="width:100%; background: rgba(0,0,0,0.2); color: #94a3b8; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 6px 8px; font-size: 0.8rem; cursor: pointer; outline: none;">
                <option value="none">Mute</option>
                <option value="beep">Beep</option>
                <option value="drop">Water Drop</option>
                <option value="boing">Boing</option>
              </select>
            </div>
            <a href="/auth/logout" class="sidebar-logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </a>
          </div>
        </aside>

        {/* Mobile overlay */}
        <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

        {/* Main content */}
        <div class="main-wrapper">
          <header class="topbar">
            <div style="display:flex;align-items:center;gap:12px">
              <button class="hamburger" id="hamburgerBtn" onclick="toggleSidebar()">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <span class="topbar-title">{props.title || "Dashboard"}</span>
            </div>
            <div class="topbar-badge">
              <div class="topbar-badge-dot"></div>
              Online
            </div>
          </header>

          <main class="page-content">
            {props.children}
          </main>
        </div>

        <script src="/assets/js/script.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            function toggleSidebar() {
              document.getElementById('sidebar').classList.toggle('open');
              document.getElementById('sidebarOverlay').classList.toggle('open');
            }
            function closeSidebar() {
              document.getElementById('sidebar').classList.remove('open');
              document.getElementById('sidebarOverlay').classList.remove('open');
            }
          `
        }} />

        <audio id="audio-beep" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto"></audio>
        <audio id="audio-drop" src="https://actions.google.com/sounds/v1/water/drop_sounds.ogg" preload="auto"></audio>
        <audio id="audio-boing" src="https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg" preload="auto"></audio>

        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
        
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const soundSelect = document.getElementById('notification-sound-select');
              
              // Load saved preference
              const savedSound = localStorage.getItem('wa_gateway_notif_sound') || 'beep';
              if (soundSelect) {
                soundSelect.value = savedSound;
                soundSelect.addEventListener('change', (e) => {
                  localStorage.setItem('wa_gateway_notif_sound', e.target.value);
                  // Play a test sound when selected
                  if (e.target.value !== 'none') {
                    const audio = document.getElementById('audio-' + e.target.value);
                    if (audio) {
                      audio.currentTime = 0;
                      audio.play().catch(err => console.log('Audio test blocked:', err));
                    }
                  }
                });
              }

              let lastCount = -1;
              function pollMessages() {
                fetch('/dashboard/messages/poll-json')
                  .then(res => res.json())
                  .then(data => {
                    if (data && typeof data.count === 'number') {
                      if (lastCount !== -1 && data.count > lastCount) {
                        const newMsgs = data.count - lastCount;
                        Toastify({
                          text: "Ada " + newMsgs + " pesan baru diterima!",
                          duration: 4000,
                          close: true,
                          gravity: "top",
                          position: "right",
                          style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)",
                          }
                        }).showToast();

                        const currentSound = localStorage.getItem('wa_gateway_notif_sound') || 'beep';
                        if (currentSound !== 'none') {
                          const audio = document.getElementById('audio-' + currentSound);
                          if (audio) {
                            audio.currentTime = 0;
                            // Play audio and ignore un-interacted DOM exceptions
                            audio.play().catch(e => console.log("Audio play failed, user must interact first", e));
                          }
                        }
                      }
                      lastCount = data.count;
                    }
                  })
                  .catch(err => console.error('Polling error', err))
                  .finally(() => {
                    setTimeout(pollMessages, 3000);
                  });
              }
              // Start polling
              pollMessages();
            });
          `
        }} />
      </body>
    </html>
  );
};

export default DashboardLayout;
