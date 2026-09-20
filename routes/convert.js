// routes/convert.js
// POST /api/convert — Mengekstrak Quick Note menjadi struktur Task menggunakan Gemini AI.
//
// ATURAN KEAMANAN:
//   - GEMINI_API_KEY hanya berada di .env backend, tidak pernah dikirim ke frontend.
//   - Output AI selalu harus dikonfirmasi/diedit user sebelum disimpan (frontend yg handle).
//   - Field yang tidak diketahui harus null, AI tidak boleh mengarang data.
//   - Jika AI gagal, return error HTTP agar frontend tampilkan fallback manual.

"use strict";

const express = require("express");
const router = express.Router();

function normalizeDeadlineToISO(raw) {
  if (!raw) return null;
  let s = String(raw).trim().replace(/\s*WIB\b/i, "");
  // Ubah 'YYYY-MM-DD HH:mm' menjadi 'YYYY-MM-DDTHH:mm'
  s = s.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/, "$1T$2");
  // Tambah detik :00 jika belum ada
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
    s += ":00";
  }
  // Tambah offset +07:00 jika tidak ada timezone
  if (!s.includes("+") && !s.includes("Z") && !s.includes("-0")) {
    s += "+07:00";
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ─── POST /api/convert ────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { teks } = req.body;

    if (!teks || !teks.trim()) {
      return res.status(400).json({ error: "Teks catatan tidak boleh kosong" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "AI tidak tersedia",
        message: "GEMINI_API_KEY belum dikonfigurasi di server. Gunakan input manual."
      });
    }

    // Waktu saat ini dalam WIB untuk resolusi tanggal relatif
    const nowWIB = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" }).replace(" ", "T") + "+07:00";
    const hariIni = new Date().toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    // Gunakan model aktif (gemini-3.6-flash atau gemini-flash-latest)
    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `Kamu adalah asisten yang membantu mengekstrak informasi tugas sekolah dari catatan singkat dalam Bahasa Indonesia.

Waktu saat ini: ${nowWIB}
Hari ini: ${hariIni}
Timezone: WIB (UTC+7)

Ekstrak informasi berikut dari catatan di bawah ini:
- mapel: nama mata pelajaran (Matematika/Bahasa Indonesia/Bahasa Inggris/IPA/IPS/Informatika/dll). Null jika tidak disebutkan.
- judul: judul singkat tugas (maksimal 60 karakter). Null jika tidak bisa ditentukan.
- deadline: tenggat waktu dalam format ISO 8601 dengan offset +07:00 (contoh: "2026-09-20T15:00:00+07:00"). Gunakan waktu saat ini sebagai referensi untuk kata seperti "besok", "lusa", "minggu depan", "Senin depan", dll. Null jika tidak disebutkan.
- catatan: isi lengkap catatan asli atau detail tambahan. Null jika tidak ada.

ATURAN PENTING:
- JANGAN mengarang informasi yang tidak ada dalam catatan.
- Field yang tidak diketahui harus null (bukan string kosong atau tebakan).
- Jika ada kata "jam X" atau "pukul X", gunakan jam tersebut untuk deadline. Jika tidak ada jam, gunakan 23:59 sebagai default.

Balas dalam format JSON murni:
{"mapel": "...", "judul": "...", "deadline": "...", "catatan": "..."}

Catatan yang akan diekstrak:
${teks.trim()}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON
    let parsed;
    try {
      const clean = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(502).json({
        error: "AI Convert gagal",
        message: "Respons AI tidak dapat diparse sebagai JSON. Gunakan input manual.",
        raw: text
      });
    }

    // Validasi schema output
    const allowed = ["mapel", "judul", "deadline", "catatan"];
    const output = {};
    for (const key of allowed) {
      const val = parsed[key];
      output[key] = (val !== undefined && val !== "" && val !== "null") ? val : null;
    }

    // Normalisasi format deadline ke format datetime yang valid
    if (output.deadline !== null) {
      output.deadline = normalizeDeadlineToISO(output.deadline);
    }

    res.json(output);
  } catch (err) {
    const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota");
    res.status(502).json({
      error: "AI Convert gagal",
      message: isQuota
        ? "Quota Gemini API habis. Gunakan input manual."
        : `Terjadi kesalahan saat menghubungi AI: ${err.message}. Gunakan input manual.`
    });
  }
});

module.exports = router;
