import { FC } from "hono/jsx";
import DashboardLayout from "../layout/dashboard-layout";

const DashboardIndex: FC = () => {
  return (
    <DashboardLayout title="Dashboard" activePath="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Selamat datang di WA Gateway — Kelola sesi dan kirim pesan WhatsApp Anda</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:8px">
        <a href="/dashboard/sessions" style="text-decoration:none">
          <div class="card" style="cursor:pointer;transition:all 0.2s ease" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
              <div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);border-radius:10px;padding:10px;color:#22c55e">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <div>
                <p style="font-size:0.78rem;color:#4ade80;opacity:0.6;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Sesi Aktif</p>
                <h2 style="font-size:1.5rem;font-weight:700;color:#f0fdf4">Perangkat WA</h2>
              </div>
            </div>
            <p style="font-size:0.82rem;color:#64748b">Kelola koneksi WhatsApp dan scan QR code</p>
            <div style="margin-top:14px;display:flex;align-items:center;gap:6px;font-size:0.78rem;color:#22c55e;font-weight:600">
              Buka
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </div>
        </a>

        <a href="/dashboard/messages" style="text-decoration:none">
          <div class="card" style="cursor:pointer;transition:all 0.2s ease" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
              <div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);border-radius:10px;padding:10px;color:#22c55e">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <div>
                <p style="font-size:0.78rem;color:#4ade80;opacity:0.6;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Messaging</p>
                <h2 style="font-size:1.5rem;font-weight:700;color:#f0fdf4">Kirim Pesan</h2>
              </div>
            </div>
            <p style="font-size:0.82rem;color:#64748b">Kirim pesan teks ke nomor WhatsApp tujuan</p>
            <div style="margin-top:14px;display:flex;align-items:center;gap:6px;font-size:0.78rem;color:#22c55e;font-weight:600">
              Buka
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </div>
        </a>
      </div>

      <div class="card" style="margin-top:24px">
        <h2 style="font-size:0.95rem;font-weight:700;color:#4ade80;margin-bottom:10px">📖 Dokumentasi API</h2>
        <p style="font-size:0.85rem;color:#64748b;line-height:1.7">
          Lihat dokumentasi lengkap di{" "}
          <a target="_blank" href="https://github.com/mimamch/wa-gateway" style="color:#22c55e;text-decoration:underline">
            github.com/mimamch/wa-gateway
          </a>
        </p>
      </div>
    </DashboardLayout>
  );
};

export default DashboardIndex;
