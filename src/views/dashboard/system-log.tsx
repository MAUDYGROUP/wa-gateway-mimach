import { FC } from "hono/jsx";
import DashboardLayout from "../layout/dashboard-layout";
import type { SystemLog } from "../../log-store";

const SystemLogPage: FC<{
  logs: SystemLog[];
}> = (props) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "INFO":
        return { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", color: "#60a5fa", label: "INFO" };
      case "WARN":
        return { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", color: "#fbbf24", label: "WARN" };
      case "ERROR":
        return { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", color: "#f87171", label: "ERROR" };
      default:
        return { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.3)", color: "#94a3b8", label: level };
    }
  };

  const getEventBadge = (event: string) => {
    switch (event) {
      case "CONNECTED":
      case "SERVER_START":
      case "TOKEN_GENERATED":
        return { bg: "rgba(34,197,94,0.15)", color: "#22c55e" };
      case "DISCONNECTED":
      case "DELETE_SESSION":
        return { bg: "rgba(239,68,68,0.15)", color: "#f87171" };
      case "RECONNECTING":
      case "CONNECTING":
        return { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" };
      default:
        return { bg: "rgba(100,116,139,0.15)", color: "#cbd5e1" };
    }
  };

  return (
    <DashboardLayout title="Log Sistem" activePath="system-logs">
      <div class="page-header">
        <h1>Log Sistem & Koneksi</h1>
        <p>Catatan aktivitas server dan detail penyebab koneksi putus/sambung pada WhatsApp</p>
      </div>

      {/* Retention Policy Alert */}
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:14px 18px;margin-bottom:24px;display:flex;align-items:center;gap:14px">
        <div style="color:#fbbf24;flex-shrink:0">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div>
          <p style="font-size:0.88rem;font-weight:600;color:#fcd34d">Kebijakan Retensi Log Otomatis (7 Hari)</p>
          <p style="font-size:0.8rem;color:#94a3b8;margin-top:2px">
            Semua aktivitas koneksi, error, dan log sistem di bawah ini akan dipertahankan selama 7 hari. Log yang usianya lebih dari 7 hari dihapus secara otomatis untuk menghemat ruang penyimpanan server.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:24px">
        {[
          { label: "Total Log (7 Hari)", value: props.logs.length, color: "#22c55e" },
          {
            label: "Info / Sukses",
            value: props.logs.filter((l) => l.level === "INFO").length,
            color: "#60a5fa",
          },
          {
            label: "Warning / Retry",
            value: props.logs.filter((l) => l.level === "WARN").length,
            color: "#fbbf24",
          },
          {
            label: "Error / Putus",
            value: props.logs.filter((l) => l.level === "ERROR").length,
            color: "#f87171",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            class="card"
            style="text-align:center;padding:16px 12px"
          >
            <p style={`font-size:1.8rem;font-weight:800;color:${stat.color}`}>
              {stat.value}
            </p>
            <p style="font-size:0.75rem;color:#64748b;font-weight:600;margin-top:3px;text-transform:uppercase;letter-spacing:0.05em">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter & Refresh */}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          {["all", "INFO", "WARN", "ERROR"].map((f) => (
            <button
              key={f}
              onclick={`filterLogs('${f}')`}
              data-filter={f}
              class={`filter-btn${f === "all" ? " active" : ""}`}
              style={`padding:6px 14px;border-radius:20px;border:1px solid;font-size:0.78rem;font-weight:600;cursor:pointer;transition:all 0.15s;${
                f === "all"
                  ? "background:rgba(34,197,94,0.15);border-color:rgba(34,197,94,0.4);color:#22c55e"
                  : "background:transparent;border-color:rgba(255,255,255,0.1);color:#64748b"
              }`}
            >
              {f === "all" ? "Semua Level" : f}
            </button>
          ))}
        </div>
        <button
          onclick="window.location.reload()"
          style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(34,197,94,0.2);background:rgba(34,197,94,0.07);color:#4ade80;font-size:0.8rem;font-weight:600;cursor:pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh Log
        </button>
      </div>

      {/* Logs List */}
      {props.logs.length === 0 ? (
        <div class="card" style="text-align:center;padding:60px 20px;color:#64748b">
          <p style="font-size:1.1rem;font-weight:600;color:#94a3b8">Belum ada catatan aktivitas sistem</p>
          <p style="font-size:0.85rem;margin-top:4px">Setiap kali ada koneksi terhubung, terputus, atau aktivitas aplikasi lain, log akan muncul di sini.</p>
        </div>
      ) : (
        <div style="display:flex;flex-direction:column;gap:10px" id="logsContainer">
          {props.logs.map((log) => {
            const levelBadge = getLevelBadge(log.level);
            const eventBadge = getEventBadge(log.event);
            return (
              <div
                key={log.id}
                class="card log-item"
                data-level={log.level}
                style={`padding:16px;display:flex;flex-direction:column;gap:10px;border-left:4px solid ${levelBadge.color};transition:all 0.15s`}
              >
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <span style={`font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:6px;background:${levelBadge.bg};border:1px solid ${levelBadge.border};color:${levelBadge.color};letter-spacing:0.05em`}>
                      {levelBadge.label}
                    </span>
                    <span style={`font-size:0.72rem;font-weight:700;padding:3px 8px;border-radius:6px;background:${eventBadge.bg};color:${eventBadge.color};letter-spacing:0.04em`}>
                      {log.event}
                    </span>
                    {log.session && (
                      <span style="font-size:0.75rem;font-weight:600;color:#e2e8f0;background:rgba(255,255,255,0.06);padding:3px 10px;border-radius:6px">
                        📱 Sesi: <strong>{log.session}</strong>
                      </span>
                    )}
                  </div>
                  <span style="font-size:0.75rem;color:#64748b;font-family:monospace">
                    {formatTime(log.timestamp)}
                  </span>
                </div>

                <div style="font-size:0.92rem;color:#e2e8f0;line-height:1.5;word-break:break-word">
                  {log.message}
                </div>

                {log.details && (
                  <details style="margin-top:4px">
                    <summary style="font-size:0.78rem;color:#64748b;cursor:pointer;user-select:none;font-weight:600">
                      Lihat Data Teknis / Payload Error
                    </summary>
                    <pre style="margin-top:6px;background:#030c07;border:1px solid rgba(255,255,255,0.08);padding:10px 12px;border-radius:8px;font-size:0.75rem;color:#a7f3d0;overflow-x:auto;white-space:pre-wrap">
                      {log.details}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      <script
        dangerouslySetInnerHTML={{
          __html: `
            function filterLogs(level) {
              const items = document.querySelectorAll('.log-item');
              const buttons = document.querySelectorAll('.filter-btn');
              
              buttons.forEach(btn => {
                if (btn.getAttribute('data-filter') === level) {
                  btn.style.background = 'rgba(34,197,94,0.15)';
                  btn.style.borderColor = 'rgba(34,197,94,0.4)';
                  btn.style.color = '#22c55e';
                  btn.classList.add('active');
                } else {
                  btn.style.background = 'transparent';
                  btn.style.borderColor = 'rgba(255,255,255,0.1)';
                  btn.style.color = '#64748b';
                  btn.classList.remove('active');
                }
              });

              items.forEach(item => {
                if (level === 'all' || item.getAttribute('data-level') === level) {
                  item.style.display = 'flex';
                } else {
                  item.style.display = 'none';
                }
              });
            }
          `,
        }}
      />
    </DashboardLayout>
  );
};

export default SystemLogPage;
