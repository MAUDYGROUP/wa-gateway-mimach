import { FC } from "hono/jsx";
import DashboardLayout from "../layout/dashboard-layout";
import { randomUUID } from "crypto";

const SessionPage: FC<{
  sessions: {
    session: string;
    status?: string;
    details?: {
      phoneNumber?: string;
      name?: string;
    };
  }[];
}> = (props) => {
  return (
    <DashboardLayout title="Perangkat WA" activePath="sessions">
      <div class="page-header">
        <h1>Perangkat WA</h1>
        <p>Kelola koneksi WhatsApp dan QR code sesi Anda</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        {/* Create session card */}
        <a
          href={`sessions/create?id=${randomUUID()}`}
          style="text-decoration:none"
        >
          <div class="card" style="border:1.5px dashed rgba(34,197,94,0.35);cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:160px;gap:12px" onmouseover="this.style.borderColor='rgba(34,197,94,0.7)';this.style.background='rgba(34,197,94,0.06)'" onmouseout="this.style.borderColor='rgba(34,197,94,0.35)';this.style.background='rgba(6,22,16,0.8)'">
            <div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;color:#22c55e">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div>
              <p style="font-size:0.92rem;font-weight:700;color:#22c55e">Tambah Sesi Baru</p>
              <p style="font-size:0.78rem;color:#64748b;margin-top:3px">Scan QR untuk menghubungkan WhatsApp</p>
            </div>
          </div>
        </a>

        {/* Session cards */}
        {props.sessions.map((session) => (
          <a
            key={session.session}
            href={
              session.status === "connected"
                ? undefined
                : `sessions/create?id=${session.session}`
            }
            style="text-decoration:none"
          >
            <div class="card" style="position:relative;transition:all 0.2s ease;min-height:160px" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              {/* Status badge */}
              <div style={`position:absolute;top:16px;right:16px;display:flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;letter-spacing:0.05em;${session.status === "connected" ? "background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3)" : "background:rgba(148,163,184,0.1);color:#94a3b8;border:1px solid rgba(148,163,184,0.2)"}`}>
                <div style={`width:5px;height:5px;border-radius:50%;${session.status === "connected" ? "background:#22c55e" : "background:#94a3b8"}`}></div>
                {session.status?.toUpperCase() || "UNKNOWN"}
              </div>

              <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;margin-right:90px">
                <div style="background:rgba(34,197,94,0.1);border-radius:10px;padding:9px;color:#22c55e;flex-shrink:0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <div style="overflow:hidden">
                  {session.details?.name && (
                    <p style="font-size:0.92rem;font-weight:700;color:#f0fdf4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{session.details.name}</p>
                  )}
                  {session.details?.phoneNumber && (
                    <p style="font-size:0.78rem;color:#4ade80;font-weight:600">+{session.details.phoneNumber}</p>
                  )}
                  {!session.details?.name && <p style="font-size:0.85rem;font-weight:600;color:#94a3b8">Sesi Tidak Aktif</p>}
                </div>
              </div>

              <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:8px 12px;margin-bottom:12px">
                <p style="font-size:0.65rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">Session ID</p>
                <div style="display:flex;align-items:center;gap:8px">
                  <p style="font-size:0.75rem;color:#94a3b8;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">{session.session}</p>
                  <button
                    data-copy={session.session}
                    style="flex-shrink:0;background:rgba(34,197,94,0.1);border:none;border-radius:6px;padding:4px 6px;cursor:pointer;color:#4ade80"
                  >
                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H7V13H3.5C3.22386 13 3 12.7761 3 12.5V2.5C3 2.22386 3.22386 2 3.5 2H4V2.25C4 2.66421 4.33579 3 4.75 3H10.25C10.6642 3 11 2.66421 11 2.25V2H11.5C11.7761 2 12 2.22386 12 2.5V7H13V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5ZM10.5 9C10.7761 9 11 8.77614 11 8.5C11 8.22386 10.7761 8 10.5 8C10.2239 8 10 8.22386 10 8.5C10 8.77614 10.2239 9 10.5 9ZM13 8.5C13 8.77614 12.7761 9 12.5 9C12.2239 9 12 8.77614 12 8.5C12 8.22386 12.2239 8 12.5 8C12.7761 8 13 8.22386 13 8.5ZM14.5 9C14.7761 9 15 8.77614 15 8.5C15 8.22386 14.7761 8 14.5 8C14.2239 8 14 8.22386 14 8.5C14 8.77614 14.2239 9 14.5 9ZM15 10.5C15 10.7761 14.7761 11 14.5 11C14.2239 11 14 10.7761 14 10.5C14 10.2239 14.2239 10 14.5 10C14.7761 10 15 10.2239 15 10.5ZM14.5 13C14.7761 13 15 12.7761 15 12.5C15 12.2239 14.7761 12 14.5 12C14.2239 12 14 12.2239 14 12.5C14 12.7761 14.2239 13 14.5 13ZM14.5 15C14.7761 15 15 14.7761 15 14.5C15 14.2239 14.7761 14 14.5 14C14.2239 14 14 14.2239 14 14.5C14 14.7761 14.2239 15 14.5 15ZM8.5 11C8.77614 11 9 10.7761 9 10.5C9 10.2239 8.77614 10 8.5 10C8.22386 10 8 10.2239 8 10.5C8 10.7761 8.22386 11 8.5 11ZM9 12.5C9 12.7761 8.77614 13 8.5 13C8.22386 13 8 12.7761 8 12.5C8 12.2239 8.22386 12 8.5 12C8.77614 12 9 12.2239 9 12.5ZM8.5 15C8.77614 15 9 14.7761 9 14.5C9 14.2239 8.77614 14 8.5 14C8.22386 14 8 14.2239 8 14.5C8 14.7761 8.22386 15 8.5 15ZM11 14.5C11 14.7761 10.7761 15 10.5 15C10.2239 15 10 14.7761 10 14.5C10 14.2239 10.2239 14 10.5 14C10.7761 14 11 14.2239 11 14.5ZM12.5 15C12.7761 15 13 14.7761 13 14.5C13 14.2239 12.7761 14 12.5 14C12.2239 14 12 14.2239 12 14.5C12 14.7761 12.2239 15 12.5 15Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style="display:flex;gap:8px">
                <button
                  id="send-text"
                  data-session={session.session}
                  disabled={session.status !== "connected"}
                  style={`flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:8px;border-radius:8px;border:1px solid rgba(34,197,94,0.25);background:rgba(34,197,94,0.08);color:#22c55e;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s;${session.status !== "connected" ? "opacity:0.4;cursor:not-allowed" : ""}`}
                >
                  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  Kirim Pesan
                </button>

                {session.details?.phoneNumber && (
                  <button
                    data-delete={session.session}
                    style="padding:8px 12px;border-radius:8px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.08);color:#f87171;cursor:pointer;transition:all 0.2s"
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  </button>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SessionPage;
