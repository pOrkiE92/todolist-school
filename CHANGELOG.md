# Changelog

Semua perubahan penting pada proyek ini didokumentasikan dalam file ini.

Format ini berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini mematuhi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-10

### Added
- **UI & UX Modern Rework**:
  - Desain antarmuka baru dengan tipografi Poppins dan skema visual modern yang konsisten.
  - Notifikasi toast akselerasi GPU (hardware-accelerated animations).
  - Manajemen Mata Pelajaran Kustom (Custom Subjects): penambahan tabel `subjects` dan API `/api/subjects` (tambah, lihat, hapus mapel dinamis dengan proteksi duplikasi case-insensitive).
  - Integrasi pemilihan mapel kustom pada modal Task dan Schedule secara realtime.
  - Impor Cadangan Data (Backup Import): dukungan mode `merge` dan `replace` dengan atomic transaction SQLite (`BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`).
  - Runner startup fleksibel: mendukung `node start`, `node dev` (dengan auto-reload `--watch` dan propagasi sinyal shutdown), `node prod`, serta script npm (`npm start`, `npm run dev`).
  - Opsi format waktu 12 Jam (AM/PM) dan 24 Jam di seluruh tampilan UI dan modal.

### Fixed
- **Schedule UI & Modals**:
  - Memperbaiki event handler `schedule-add-btn` dan backdrop modal jadwal.
  - Memindahkan posisi input guru ke bawah input ruangan untuk mencegah horizontal scroll pada layar mobile.
  - Menghilangkan link label berulang pada modal mata pelajaran dan merapikan layout tombol tambah mapel.
  - Sinkronisasi instan counter navigasi dan render tampilan saat penghapusan slot jadwal tanpa memerlukan refresh halaman.
- **Quick Notes Formatting**:
  - Menghapus indentasi template literal pada kartu catatan bebas sehingga baris pertama teks tidak lagi bergeser/offset.
- **Pengaturan & Lokalisasi**:
  - Menyelesaikan desinkronisasi bahasa antarmuka saat halaman dimuat ulang.

### Performance
- Optimasi performa full-stack pada kueri SQLite, Express middleware, caching aset statis, dan siklus rendering DOM.

---

## [1.1.0] - 2026-09-20

### Added
- **Fitur Pengaturan (Settings Tab)**:
  - Tab Pengaturan baru pada navigasi desktop dan mobile bottom-nav.
  - REST API `/api/settings` (GET & PUT) dengan penyimpanan permanen ke tabel SQLite `_meta` dan sinkronisasi `localStorage`.
  - **Sistem Warna & Aksen Lengkap (Light/Dark Mode per Aksen)**:
    - Mode Tema: Terang (*Light*), Gelap (*Dark*), dan Otomatis (*System*).
    - 7 Pilihan Warna Aksen yang masing-masing memiliki variasi mode Terang & Gelap:
      1. **Cream / Warm Latte** (`cream`) — Nuansa krem/kopi susu hangat nan tenang.
      2. **Navy Ocean** (`navy`) — Biru laut klasik yang teduh.
      3. **Forest Emerald** (`emerald`) — Hijau hutan segar.
      4. **Royal Violet** (`violet`) — Ungu amethyst elegan.
      5. **Sunset Amber** (`amber`) — Kuning/oranye keemasan hangat.
      6. **Rose Berry** (`rose`) — Raspberry / mawar lembut.
      7. **Monochrome Slate** (`slate`) — Abu-abu minimalis modern.
    - Pratinjau langsung (*Live Preview*) warna tombol dan badge di tab Pengaturan.
  - **Sistem Multi-Bahasa (i18n)**:
    - Dukungan Bahasa Indonesia (`id`) dan English (`en`) secara menyeluruh tanpa perlu reload halaman.
    - Translasi otomatis pada navigasi, status, override, modal, form, format tanggal, dan notifikasi.
  - **Preferensi Format Jam**:
    - Pilihan format jam 24 Jam (14:30) atau 12 Jam (02:30 PM).
  - **Ekspor Cadangan Data**:
    - Tombol ekspor satu klik untuk mengunduh seluruh data aplikasi dalam format JSON.

### Fixed
- **Database Persistence on Service Termination**:
  - Mengubah SQLite `journal_mode` dari `WAL` menjadi `DELETE` serta menyetel `synchronous = NORMAL` di `db.js`. Menghilangkan ketergantungan pada shared memory (`.db-shm` / `.db-wal`) yang tidak ter-*flush* dengan benar saat service di-terminate di lingkungan Termux/PRoot.
  - Menambahkan *graceful shutdown* pada `server.js` untuk menangani sinyal `SIGINT` (Ctrl+C) dan `SIGTERM`, memastikan koneksi SQLite ditutup secara bersih via `db.close()`.
  - Memperbaiki bug *re-seed crash* pada `db.js` dengan memperkenalkan tabel `_meta` dan klausa `INSERT OR IGNORE`. Database tidak akan mencoba men-seed ulang saat tabel `tasks` kosong sehingga mencegah error `UNIQUE constraint failed: schedule.id`.

### Changed
- Konfigurasi port default diselaraskan ke `PORT=3000` agar sesuai dengan konfigurasi firewall dan panduan `README.md`.

---

## [1.0.0] - 2026-09-20

### Added
- Rilis awal Website Todolist Tugas Sekolah.
- REST API Express untuk Tasks, Schedule, Schedule Overrides, Quick Notes, dan AI Convert.
- Database SQLite native (`node:sqlite`) dengan skema lengkap dan data awal.
- Mobile-first Single Page Application (HTML, CSS, Vanilla JS) di folder `public/`.
- Integrasi Google Gemini API untuk konversi catatan bebas menjadi task terstruktur.
