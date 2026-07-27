/**
 * Message Store — in-memory storage untuk log pesan masuk dan keluar.
 * Data akan hilang saat server restart (tidak ada database).
 * Maks 500 pesan tersimpan (FIFO ketika penuh).
 */

export type MessageDirection = "sent" | "received";
export type MessageStatus = "success" | "failed" | "pending";
export type MessageType = "text" | "image" | "video" | "document" | "audio" | "sticker";

export interface StoredMessage {
  id: string;
  direction: MessageDirection;
  status: MessageStatus;
  session: string;
  from?: string;   // untuk pesan masuk: nomor pengirim
  to?: string;     // untuk pesan keluar: nomor tujuan
  text: string | null;
  type: MessageType;
  media?: {
    image?: string | null;
    video?: string | null;
    document?: string | null;
    audio?: string | null;
  };
  timestamp: number;
  errorMessage?: string;
  // Data yang diperlukan untuk resend
  resendPayload?: {
    session: string;
    to: string;
    text: string;
  };
}

const MAX_MESSAGES = 500;
const messages: StoredMessage[] = [];

export const messageStore = {
  /**
   * Tambah pesan baru ke store (FIFO jika penuh)
   */
  add(msg: StoredMessage): void {
    if (messages.length >= MAX_MESSAGES) {
      messages.shift(); // hapus yang paling lama
    }
    messages.unshift(msg); // tambah di depan (terbaru di atas)
  },

  /**
   * Ambil semua pesan (terbaru di atas)
   */
  getAll(): StoredMessage[] {
    return [...messages];
  },

  /**
   * Ambil pesan berdasarkan ID
   */
  getById(id: string): StoredMessage | undefined {
    return messages.find((m) => m.id === id);
  },

  /**
   * Update status pesan (untuk resend)
   */
  updateStatus(id: string, status: MessageStatus, errorMessage?: string): void {
    const idx = messages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      messages[idx].status = status;
      if (errorMessage !== undefined) {
        messages[idx].errorMessage = errorMessage;
      }
    }
  },

  /**
   * Ambil jumlah pesan
   */
  count(): number {
    return messages.length;
  },

  /**
   * Filter pesan berdasarkan session
   */
  getBySession(session: string): StoredMessage[] {
    return messages.filter((m) => m.session === session);
  },
};
