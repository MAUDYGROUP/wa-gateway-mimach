import { FC } from "hono/jsx";
import DashboardLayout from "../layout/dashboard-layout";

const MessageSendPage: FC<{
  sessions: string[];
}> = (props) => {
  return (
    <DashboardLayout title="Kirim Pesan" activePath="messages">
      <div class="page-header">
        <h1>Kirim Pesan</h1>
        <p>Kirim pesan teks menggunakan sesi WhatsApp yang aktif</p>
      </div>

      <div style="max-width:600px">
        <div class="card">
          <form id="sendMessageForm" style="display:flex;flex-direction:column;gap:18px">
            {/* Session select */}
            <div>
              <label for="session" style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">
                Pilih Sesi
              </label>
              <select
                id="session"
                name="session"
                required
                style="width:100%;padding:10px 14px;background:#0a1f13;border:1px solid rgba(34,197,94,0.2);border-radius:10px;color:#e2e8f0;font-size:0.9rem;outline:none;transition:border-color 0.2s"
                onfocus="this.style.borderColor='rgba(34,197,94,0.6)'" onblur="this.style.borderColor='rgba(34,197,94,0.2)'"
              >
                <option value="" style="color:#64748b">-- Pilih Sesi --</option>
                {props.sessions.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone number */}
            <div>
              <label for="to" style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">
                Nomor Tujuan
              </label>
              <input
                type="text"
                id="to"
                name="to"
                required
                placeholder="Contoh: 628123456789"
                style="width:100%;padding:10px 14px;background:#0a1f13;border:1px solid rgba(34,197,94,0.2);border-radius:10px;color:#e2e8f0;font-size:0.9rem;outline:none;transition:border-color 0.2s"
                onfocus="this.style.borderColor='rgba(34,197,94,0.6)'" onblur="this.style.borderColor='rgba(34,197,94,0.2)'"
              />
              <p style="margin-top:5px;font-size:0.75rem;color:#64748b">Format: kode negara + nomor HP tanpa tanda + (contoh: 628xxx)</p>
            </div>

            {/* Message */}
            <div>
              <label for="message" style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">
                Pesan
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Tulis pesan Anda di sini..."
                style="width:100%;padding:10px 14px;background:#0a1f13;border:1px solid rgba(34,197,94,0.2);border-radius:10px;color:#e2e8f0;font-size:0.9rem;outline:none;resize:vertical;transition:border-color 0.2s;font-family:inherit"
                onfocus="this.style.borderColor='rgba(34,197,94,0.6)'" onblur="this.style.borderColor='rgba(34,197,94,0.2)'"
              />
            </div>

            {/* Alert area */}
            <div id="messageAlert" style="display:none;padding:12px 16px;border-radius:10px;font-size:0.85rem"></div>

            {/* Submit */}
            <button
              type="submit"
              id="submitBtn"
              style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;background:linear-gradient(135deg,#16a34a,#15803d);border:none;border-radius:10px;color:white;font-size:0.92rem;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.02em"
              onmouseover="this.style.opacity='0.9';this.style.transform='translateY(-1px)'"
              onmouseout="this.style.opacity='1';this.style.transform='translateY(0)'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('sendMessageForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const alert = document.getElementById('messageAlert');
            const session = document.getElementById('session').value;
            const to = document.getElementById('to').value;
            const message = document.getElementById('message').value;

            btn.disabled = true;
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Mengirim...';
            btn.style.opacity = '0.7';

            try {
              const res = await fetch('/dashboard/messages/send-text-api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session, to, message })
              });
              const data = await res.json();
              if (res.ok && data.success) {
                alert.style.display = 'block';
                alert.style.background = 'rgba(34,197,94,0.1)';
                alert.style.border = '1px solid rgba(34,197,94,0.3)';
                alert.style.color = '#4ade80';
                alert.textContent = '✓ Pesan berhasil dikirim!';
                document.getElementById('message').value = '';
              } else {
                throw new Error(data.error || 'Gagal mengirim pesan');
              }
            } catch (err) {
              alert.style.display = 'block';
              alert.style.background = 'rgba(239,68,68,0.1)';
              alert.style.border = '1px solid rgba(239,68,68,0.3)';
              alert.style.color = '#f87171';
              alert.textContent = '✗ ' + (err.message || 'Terjadi kesalahan');
            } finally {
              btn.disabled = false;
              btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Kirim Pesan';
              btn.style.opacity = '1';
            }
          });
        `
      }} />
    </DashboardLayout>
  );
};

export default MessageSendPage;
