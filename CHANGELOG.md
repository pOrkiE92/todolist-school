# Changelog

Semua perubahan penting pada proyek ini didokumentasikan dalam file ini.

Format ini berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini mematuhi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-09-20

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
