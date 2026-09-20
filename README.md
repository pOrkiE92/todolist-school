# Todolist Tugas Sekolah

Aplikasi web personal untuk melacak tugas sekolah, jadwal pelajaran mingguan, schedule override (libur/pengganti), serta Quick Notes dengan konversi gemini api (on progress still not usable).

## Fitur Utama

- **Dashboard**: Menampilkan jadwal hari ini, override aktif, serta task prioritas (overdue, deadline hari ini/besok).
- **Tasks**: Manajemen tugas dengan status (`todo`, `in_progress`, `done`), filter mapel, dan filter status.
- **Weekly Schedule**: Jadwal pelajaran mingguan berulang.
- **Schedule Override**: Penanganan perubahan jadwal per tanggal tertentu (`replace`, `cancel`/libur, `extra`).
- **Quick Notes**: Catatan cepat / brain dump tanpa format kaku.
- **AI Convert**: Konversi otomatis catatan menjadi Task terstruktur via Gemini API dengan modal konfirmasi & edit sebelum disimpan.
- **Offline & Manual Friendly**: Tetap berfungsi 100% tanpa koneksi AI.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: SQLite (`node:sqlite` / WAL mode)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Mobile-first SPA)
- **AI**: Google Gemini API via `@google/generative-ai`

## Cara Menjalankan

### 1. Install Dependensi

```bash
npm install
```

### 2. Konfigurasi Environment

Salin `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Buka `.env` dan sesuaikan nilainya:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Catatan: Jika `GEMINI_API_KEY` tidak diisi, fitur AI dinonaktifkan tetapi seluruh fungsi aplikasi tetap berjalan normal, untuk saat ini fitur convert menggunakan api gemini masih unusable).*

### 3. Jalankan Aplikasi

```bash
npm start
```

Buka browser di `http://localhost:3000` (atau port yang disetel).
Jika diakses dari HP pada jaringan Wi-Fi yang sama, buka `http://<IP-HOST>:3000`.
