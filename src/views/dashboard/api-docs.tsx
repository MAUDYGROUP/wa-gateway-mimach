import { FC } from "hono/jsx";
import DashboardLayout from "../layout/dashboard-layout";

const ApiDocsPage: FC = () => {
  return (
    <DashboardLayout activePath="api-docs" title="Panduan API">
      <div style="padding-bottom:40px;max-width:800px;margin:0 auto;">
        
        {/* Header */}
        <div style="margin-bottom:32px;">
          <h1 style="font-size:1.8rem;font-weight:700;color:#f0fdf4;margin-bottom:12px;letter-spacing:-0.02em;">
            Panduan Integrasi API
          </h1>
          <p style="color:#94a3b8;line-height:1.6;font-size:0.95rem;">
            Gunakan panduan ini untuk mengintegrasikan layanan pesan otomatis dari aplikasi eksternal (contohnya WHMCS, sistem billing, dsb) ke WA Gateway menggunakan Token API (JWT).
          </p>
        </div>

        {/* Section: Generate Token */}
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="font-size:1.2rem;font-weight:600;color:#f8fafc;margin-bottom:12px;">1. Membuat Token API</h2>
          <p style="color:#94a3b8;margin-bottom:16px;line-height:1.6;font-size:0.95rem;">
            Sebelum mulai mengirim pesan, Anda membutuhkan Token API untuk otentikasi. Token ini unik untuk setiap nomor WhatsApp (Sesi) yang sudah tertaut.
          </p>
          <ul style="color:#94a3b8;margin-left:20px;line-height:1.6;font-size:0.95rem;margin-bottom:16px;">
            <li style="margin-bottom:8px">Masuk ke menu <strong>Sesi</strong> di Dashboard.</li>
            <li style="margin-bottom:8px">Pastikan nomor WhatsApp sudah berstatus <strong>Connected</strong>.</li>
            <li style="margin-bottom:8px">Klik tombol ungu dengan ikon kunci (Generate API Token) di sebelah kanan sesi Anda.</li>
            <li style="margin-bottom:8px">Salin token JWT yang muncul. Token ini akan terus berlaku dan otomatis membawa data <i>Session ID</i> di dalamnya.</li>
          </ul>
        </div>

        {/* Section: How to use */}
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="font-size:1.2rem;font-weight:600;color:#f8fafc;margin-bottom:12px;">2. Menggunakan Token untuk Request</h2>
          <p style="color:#94a3b8;margin-bottom:16px;line-height:1.6;font-size:0.95rem;">
            Ketika memanggil endpoint API, Anda harus menyertakan token di <strong>HTTP Header</strong> Anda. Karena Session ID sudah ada di dalam token, Anda <strong>tidak perlu lagi</strong> menyertakan parameter <code>session</code> di payload JSON Anda.
          </p>

          <div style="background:#000;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;margin-bottom:16px;overflow-x:auto;">
            <pre style="color:#4ade80;font-family:monospace;font-size:0.85rem;line-height:1.5;">
              Authorization: Bearer &lt;PASTE_TOKEN_ANDA_DISINI&gt;
            </pre>
          </div>
        </div>

        {/* Section: Endpoint Send Message */}
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="font-size:1.2rem;font-weight:600;color:#f8fafc;margin-bottom:12px;">3. Contoh Request Pengiriman Pesan Teks</h2>
          <p style="color:#94a3b8;margin-bottom:16px;line-height:1.6;font-size:0.95rem;">
            Kirim permintaan <code>POST</code> ke endpoint <code>/message/send-text</code> menggunakan payload sederhana.
          </p>

          <h3 style="font-size:0.95rem;color:#e2e8f0;margin-bottom:8px;">Format Request (JSON):</h3>
          <div style="background:#000;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;margin-bottom:16px;overflow-x:auto;">
            <pre style="color:#e2e8f0;font-family:monospace;font-size:0.85rem;line-height:1.5;">
{`POST /message/send-text
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5c... (Token Anda)

{
  "to": "6281234567890",
  "text": "Halo, ini pesan dari sistem billing Anda!"
}`}
            </pre>
          </div>

          <h3 style="font-size:0.95rem;color:#e2e8f0;margin-bottom:8px;">Contoh cURL:</h3>
          <div style="background:#000;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;overflow-x:auto;">
            <pre style="color:#e2e8f0;font-family:monospace;font-size:0.85rem;line-height:1.5;">
{`curl -X POST https://wa.domainanda.com/message/send-text \\
  -H "Authorization: Bearer <TOKEN_ANDA>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "6281234567890",
    "text": "Halo, ini tagihan untuk bulan ini..."
  }'`}
            </pre>
          </div>
        </div>

        {/* Section: Other Endpoints */}
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:24px;">
          <h2 style="font-size:1.2rem;font-weight:600;color:#f8fafc;margin-bottom:12px;">4. Endpoint Tambahan</h2>
          <p style="color:#94a3b8;margin-bottom:16px;line-height:1.6;font-size:0.95rem;">
            Metode otentikasi <code>Authorization: Bearer &lt;Token&gt;</code> ini berlaku untuk semua endpoint pengiriman pesan. Di bawah ini beberapa endpoint alternatif:
          </p>

          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;text-align:left;color:#e2e8f0;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:12px 8px;color:#94a3b8;">Endpoint (POST)</th>
                <th style="padding:12px 8px;color:#94a3b8;">Parameter Body (JSON)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:12px 8px;font-family:monospace;color:#4ade80;">/message/send-image</td>
                <td style="padding:12px 8px;"><code>to</code>, <code>text</code> (opsional), <code>image_url</code></td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:12px 8px;font-family:monospace;color:#4ade80;">/message/send-document</td>
                <td style="padding:12px 8px;"><code>to</code>, <code>text</code> (nama file), <code>document_url</code></td>
              </tr>
              <tr>
                <td style="padding:12px 8px;font-family:monospace;color:#4ade80;">/message/send-video</td>
                <td style="padding:12px 8px;"><code>to</code>, <code>text</code> (opsional), <code>video_url</code></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ApiDocsPage;
