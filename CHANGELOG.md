# Changelog

Semua perubahan penting pada proyek ini didokumentasikan dalam file ini.

Format ini berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini mematuhi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-09-20

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
