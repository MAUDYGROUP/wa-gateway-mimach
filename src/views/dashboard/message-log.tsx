import { FC } from "hono/jsx";
import DashboardLayout from "../layout/dashboard-layout";
import type { StoredMessage } from "../../message-store";

const MessageLogPage: FC<{
  messages: StoredMessage[];
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

  const formatPhone = (jid?: string) => {
    if (!jid) return "-";
    return jid.replace("@s.whatsapp.net", "").replace("@g.us", " (Grup)");
  };

  return (
    <DashboardLayout title="Log Pesan" activePath="log">
      <div class="page-header">
        <h1>Log Pesan</h1>
        <p>Riwayat pesan masuk dan keluar dari semua sesi WhatsApp</p>
      </div>

      {/* Stats row */}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:24px">
        {[
          { label: "Total Pesan", value: props.messages.length, color: "#22c55e" },
          {
            label: "Dikirim",
            value: props.messages.filter((m) => m.direction === "sent").length,
            color: "#60a5fa",
          },
          {
            label: "Diterima",
            value: props.messages.filter((m) => m.direction === "received").length,
            color: "#a78bfa",
          },
          {
            label: "Gagal",
            value: props.messages.filter((m) => m.status === "failed").length,
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
            <p style="font-size:0.75rem;color:#64748b;font-weight:600;margin-top:3px;text-transform:uppercase;letter-spacing:0.06em">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter & Refresh */}
      <div
        style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap"
      >
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          {["all", "sent", "received", "failed"].map((f) => (
            <button
              key={f}
              onclick={`filterMessages('${f}')`}
              data-filter={f}
              class={`filter-btn${f === "all" ? " active" : ""}`}
              style={`padding:6px 14px;border-radius:20px;border:1px solid;font-size:0.78rem;font-weight:600;cursor:pointer;transition:all 0.15s;${
                f === "all"
                  ? "background:rgba(34,197,94,0.15);border-color:rgba(34,197,94,0.4);color:#22c55e"
                  : "background:transparent;border-color:rgba(255,255,255,0.1);color:#64748b"
              }`}
            >
              {f === "all" ? "Semua" : f === "sent" ? "Dikirim" : f === "received" ? "Diterima" : "Gagal"}
            </button>
          ))}
        </div>
        <button
          onclick="window.location.reload()"
          style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(34,197,94,0.2);background:rgba(34,197,94,0.07);color:#4ade80;font-size:0.8rem;font-weight:600;cursor:pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      {/* Message list */}
      {props.messages.length === 0 ? (
        <div
          class="card"
          style="text-align:center;padding:60px 24px;color:#64748b"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;opacity:0.3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p style="font-size:1rem;font-weight:600">Belum ada pesan</p>
          <p style="font-size:0.82rem;margin-top:6px">Pesan yang dikirim dan diterima akan muncul di sini</p>
        </div>
      ) : (
        <div id="messageList" style="display:flex;flex-direction:column;gap:10px">
          {props.messages.map((msg) => (
            <div
              key={msg.id}
              data-direction={msg.direction}
              data-status={msg.status}
              class="msg-card card"
              style="padding:0;overflow:hidden;cursor:pointer;transition:all 0.15s"
              onclick={`toggleMessage('${msg.id}')`}
            >
              {/* Header row */}
              <div style="display:flex;align-items:center;gap:12px;padding:14px 16px">
                {/* Direction icon */}
                <div
                  style={`flex-shrink:0;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;${
                    msg.direction === "received"
                      ? "background:rgba(167,139,250,0.12);color:#a78bfa"
                      : msg.status === "failed"
                        ? "background:rgba(248,113,113,0.12);color:#f87171"
                        : msg.status === "pending"
                          ? "background:rgba(251,191,36,0.12);color:#fbbf24"
                          : "background:rgba(96,165,250,0.12);color:#60a5fa"
                  }`}
                >
                  {msg.direction === "received" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 19 19 12"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 5 5 12"/></svg>
                  )}
                </div>

                {/* Info */}
                <div style="flex:1;overflow:hidden">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <span style="font-size:0.82rem;font-weight:700;color:#e2e8f0">
                      {msg.direction === "received"
                        ? `Dari: ${formatPhone(msg.from)}`
                        : `Ke: ${formatPhone(msg.to)}`}
                    </span>
                    {/* Status badge */}
                    <span
                      style={`padding:1px 8px;border-radius:20px;font-size:0.68rem;font-weight:700;${
                        msg.status === "success"
                          ? "background:rgba(34,197,94,0.12);color:#22c55e;border:1px solid rgba(34,197,94,0.25)"
                          : msg.status === "failed"
                            ? "background:rgba(248,113,113,0.12);color:#f87171;border:1px solid rgba(248,113,113,0.25)"
                            : "background:rgba(251,191,36,0.12);color:#fbbf24;border:1px solid rgba(251,191,36,0.25)"
                      }`}
                    >
                      {msg.status === "success" ? "✓ Terkirim" : msg.status === "failed" ? "✗ Gagal" : "⏳ Pending"}
                    </span>
                    {/* Type badge */}
                    {msg.type !== "text" && (
                      <span style="padding:1px 8px;border-radius:20px;font-size:0.68rem;font-weight:700;background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.08)">
                        {msg.type.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p style="font-size:0.78rem;color:#475569;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:400px">
                    {msg.text || `[${msg.type}]`}
                  </p>
                </div>

                {/* Right: time + actions */}
                <div style="flex-shrink:0;text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                  <p style="font-size:0.7rem;color:#475569">{formatTime(msg.timestamp)}</p>
                  <div style="display:flex;gap:6px;align-items:center">
                    <span style="font-size:0.7rem;color:#334155;font-family:monospace">{msg.session.substring(0, 8)}...</span>
                    {msg.status === "failed" && msg.resendPayload && (
                      <button
                        onclick={`event.stopPropagation();resendMessage('${msg.id}')`}
                        style="display:flex;align-items:center;gap:4px;padding:3px 10px;border-radius:6px;border:1px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.1);color:#fbbf24;font-size:0.7rem;font-weight:700;cursor:pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        Resend
                      </button>
                    )}
                    <svg
                      id={`chevron-${msg.id}`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      style="color:#475569;transition:transform 0.2s"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expandable body */}
              <div id={`body-${msg.id}`} style="display:none;border-top:1px solid rgba(255,255,255,0.05);padding:14px 16px 16px;background:rgba(0,0,0,0.15)">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
                  <div>
                    <p style="font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:3px">Session</p>
                    <p style="font-size:0.78rem;color:#94a3b8;font-family:monospace">{msg.session}</p>
                  </div>
                  <div>
                    <p style="font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:3px">ID Pesan</p>
                    <p style="font-size:0.78rem;color:#94a3b8;font-family:monospace">{msg.id}</p>
                  </div>
                  <div>
                    <p style="font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:3px">{msg.direction === "received" ? "Pengirim" : "Penerima"}</p>
                    <p style="font-size:0.78rem;color:#94a3b8">{formatPhone(msg.direction === "received" ? msg.from : msg.to)}</p>
                  </div>
                  <div>
                    <p style="font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:3px">Waktu</p>
                    <p style="font-size:0.78rem;color:#94a3b8">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>

                {msg.text && (
                  <div style="margin-bottom:12px">
                    <p style="font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:6px">Isi Pesan</p>
                    <div style="background:#0a1f13;border:1px solid rgba(34,197,94,0.15);border-radius:8px;padding:12px;font-size:0.85rem;color:#e2e8f0;line-height:1.6;white-space:pre-wrap;word-break:break-word">
                      {msg.text}
                    </div>
                  </div>
                )}

                {msg.errorMessage && (
                  <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:10px 12px;margin-bottom:12px">
                    <p style="font-size:0.7rem;color:#f87171;font-weight:700;margin-bottom:3px">⚠ Error</p>
                    <p style="font-size:0.8rem;color:#fca5a5">{msg.errorMessage}</p>
                  </div>
                )}

                {msg.media && (
                  <div>
                    <p style="font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">Media</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                      {msg.media.image && (
                        <a href={`/media/${msg.media.image}`} target="_blank" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;border:1px solid rgba(96,165,250,0.25);background:rgba(96,165,250,0.08);color:#60a5fa;font-size:0.78rem;font-weight:600;text-decoration:none">
                          🖼 Lihat Gambar
                        </a>
                      )}
                      {msg.media.video && (
                        <a href={`/media/${msg.media.video}`} target="_blank" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;border:1px solid rgba(167,139,250,0.25);background:rgba(167,139,250,0.08);color:#a78bfa;font-size:0.78rem;font-weight:600;text-decoration:none">
                          🎥 Lihat Video
                        </a>
                      )}
                      {msg.media.document && (
                        <a href={`/media/${msg.media.document}`} target="_blank" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;border:1px solid rgba(251,191,36,0.25);background:rgba(251,191,36,0.08);color:#fbbf24;font-size:0.78rem;font-weight:600;text-decoration:none">
                          📄 Lihat Dokumen
                        </a>
                      )}
                      {msg.media.audio && (
                        <a href={`/media/${msg.media.audio}`} target="_blank" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;border:1px solid rgba(34,197,94,0.25);background:rgba(34,197,94,0.08);color:#22c55e;font-size:0.78rem;font-weight:600;text-decoration:none">
                          🎵 Dengar Audio
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <script dangerouslySetInnerHTML={{
        __html: `
          // Toggle expand/collapse
          function toggleMessage(id) {
            const body = document.getElementById('body-' + id);
            const chevron = document.getElementById('chevron-' + id);
            const isOpen = body.style.display !== 'none';
            body.style.display = isOpen ? 'none' : 'block';
            chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
          }

          // Filter messages
          function filterMessages(filter) {
            document.querySelectorAll('.filter-btn').forEach(btn => {
              const isActive = btn.dataset.filter === filter;
              btn.style.background = isActive ? 'rgba(34,197,94,0.15)' : 'transparent';
              btn.style.borderColor = isActive ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)';
              btn.style.color = isActive ? '#22c55e' : '#64748b';
            });

            document.querySelectorAll('.msg-card').forEach(card => {
              let show = true;
              if (filter === 'sent') show = card.dataset.direction === 'sent';
              else if (filter === 'received') show = card.dataset.direction === 'received';
              else if (filter === 'failed') show = card.dataset.status === 'failed';
              card.style.display = show ? 'block' : 'none';
            });
          }

          // Resend failed message
          async function resendMessage(msgId) {
            const btn = event.target.closest('button');
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.textContent = 'Mengirim...';

            try {
              const res = await fetch('/dashboard/messages/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: msgId })
              });
              const data = await res.json();
              if (res.ok && data.success) {
                btn.textContent = '✓ Terkirim';
                btn.style.background = 'rgba(34,197,94,0.1)';
                btn.style.borderColor = 'rgba(34,197,94,0.3)';
                btn.style.color = '#22c55e';
              } else {
                throw new Error(data.error || 'Gagal');
              }
            } catch (err) {
              btn.disabled = false;
              btn.style.opacity = '1';
              btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Resend';
              alert('Gagal: ' + err.message);
            }
          }
        `
      }} />
    </DashboardLayout>
  );
};

export default MessageLogPage;
