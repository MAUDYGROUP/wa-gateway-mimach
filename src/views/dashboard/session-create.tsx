import { FC } from "hono/jsx";
import DashboardLayout from "../layout/dashboard-layout";

const CreateSessionPage: FC<{
  id: string;
}> = (props) => {
  return (
    <DashboardLayout title="Connect Session" activePath="sessions">
      <div class="page-header">
        <h1>Hubungkan Sesi</h1>
        <p>Scan QR code di bawah ini menggunakan WhatsApp Anda untuk terhubung</p>
      </div>

      <div style="max-width:480px">
        <div class="card" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px;padding:32px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:0.82rem;color:#94a3b8">Status:</span>
            <span id="status" style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.25)">MENUNGGU</span>
          </div>

          <p id="redirecting" style="font-size:0.82rem;color:#4ade80;display:none">Mengarahkan dalam beberapa detik...</p>

          <div style="background:white;border-radius:12px;padding:12px;display:inline-block">
            <div id="qr" style="min-width:200px;min-height:200px;display:flex;align-items:center;justify-content:center">
              <div style="color:#94a3b8;font-size:0.85rem">Memuat QR...</div>
            </div>
          </div>

          <p style="font-size:0.78rem;color:#64748b;line-height:1.6">
            Buka WhatsApp → Perangkat Tertaut → Tautkan Perangkat → Scan QR
          </p>

          <a href="/dashboard/sessions" style="display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;color:#94a3b8;text-decoration:none;margin-top:4px">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Kembali ke Daftar Sesi
          </a>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `const id = "${props.id}";`,
        }}
      ></script>
      <script src="/assets/js/qrcode.min.js"></script>
      <script src="/assets/js/create-session.js"></script>
    </DashboardLayout>
  );
};

export default CreateSessionPage;
