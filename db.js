// db.js — Inisialisasi database SQLite dan skema tabel
// Menggunakan node:sqlite (bawaan Node.js 22, synchronous, 100% native tanpa compile C++).

"use strict";

const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "todolist.db");

// Buat folder data jika belum ada
const fs = require("fs");
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Aktifkan WAL mode dan foreign keys
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// ─────────────────────────────────────────────
// SKEMA TABEL
// ─────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id         TEXT PRIMARY KEY,
    mapel      TEXT NOT NULL,
    judul      TEXT NOT NULL,
    deadline   TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'todo'
               CHECK(status IN ('todo', 'in_progress', 'done')),
    catatan    TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id          TEXT PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time  TEXT NOT NULL,
    end_time    TEXT NOT NULL,
    mapel       TEXT NOT NULL,
    ruangan     TEXT,
    guru        TEXT
  );

  CREATE TABLE IF NOT EXISTS schedule_override (
    id         TEXT PRIMARY KEY,
    date       TEXT NOT NULL,
    type       TEXT NOT NULL CHECK(type IN ('replace', 'cancel', 'extra')),
    mapel      TEXT,
    start_time TEXT,
    end_time   TEXT,
    ruangan    TEXT,
    guru       TEXT,
    keterangan TEXT
  );

  CREATE TABLE IF NOT EXISTS quicknotes (
    id         TEXT PRIMARY KEY,
    teks       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'raw'
               CHECK(status IN ('raw', 'converted'))
  );
`);

// ─────────────────────────────────────────────
// SEED INITIAL DATA (JIKA DATABASE MASIH KOSONG)
// Sesuai PRD §13 Mock Data
// ─────────────────────────────────────────────

const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get().count;

if (taskCount === 0) {
  const at = (dayOffset, hour, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const iso = (dayOffset) => at(dayOffset, 9, 0);

  // 1. Seed Tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, mapel, judul, deadline, status, catatan, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialTasks = [
    { id: "task_1", mapel: "Matematika", judul: "PR Bab 3 — Trigonometri", deadline: at(-1, 23, 59), status: "todo", catatan: "Kerjakan soal nomor 1–20 di buku paket.", created_at: iso(-5), updated_at: iso(-2) },
    { id: "task_2", mapel: "Bahasa Inggris", judul: "Essay: My Holiday Plan", deadline: at(-2, 12, 0), status: "in_progress", catatan: "Minimal 250 kata, kumpulkan lewat email guru.", created_at: iso(-6), updated_at: iso(-1) },
    { id: "task_3", mapel: "IPA", judul: "Laporan Praktikum Fotosintesis", deadline: at(0, 17, 0), status: "in_progress", catatan: null, created_at: iso(-4), updated_at: iso(0) },
    { id: "task_4", mapel: "Bahasa Indonesia", judul: "Rangkuman Teks Eksposisi", deadline: at(0, 21, 0), status: "todo", catatan: "Satu halaman folio.", created_at: iso(-3), updated_at: iso(-1) },
    { id: "task_5", mapel: "Informatika", judul: "Tugas: Flowchart Algoritma", deadline: at(1, 15, 0), status: "todo", catatan: "Gunakan draw.io atau gambar tangan.", created_at: iso(-2), updated_at: iso(-2) },
    { id: "task_6", mapel: "IPS", judul: "Presentasi Kelompok — Sejarah Kemerdekaan", deadline: at(4, 10, 0), status: "todo", catatan: "Bagi tugas dengan anggota kelompok.", created_at: iso(-1), updated_at: iso(-1) },
    { id: "task_7", mapel: "Matematika", judul: "Latihan Soal Statistika", deadline: at(-3, 20, 0), status: "done", catatan: null, created_at: iso(-8), updated_at: iso(-3) },
    { id: "task_8", mapel: "Bahasa Inggris", judul: "Vocabulary Quiz Prep", deadline: at(2, 8, 0), status: "done", catatan: "Hafalkan 30 kata unit 4.", created_at: iso(-2), updated_at: iso(0) },
  ];

  for (const t of initialTasks) {
    insertTask.run(t.id, t.mapel, t.judul, t.deadline, t.status, t.catatan, t.created_at, t.updated_at);
  }

  // 2. Seed Weekly Schedule (Senin = 1 s/d Jumat = 5)
  const insertSchedule = db.prepare(`
    INSERT INTO schedule (id, day_of_week, start_time, end_time, mapel, ruangan, guru)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const initialSchedules = [
    { id: "sch_1", day_of_week: 1, start_time: "07:00", end_time: "08:30", mapel: "Matematika", ruangan: "R. 9A", guru: "Bu Sari" },
    { id: "sch_2", day_of_week: 1, start_time: "08:30", end_time: "10:00", mapel: "Bahasa Indonesia", ruangan: "R. 9A", guru: "Pak Budi" },
    { id: "sch_3", day_of_week: 1, start_time: "10:15", end_time: "11:45", mapel: "IPA", ruangan: "Lab IPA", guru: "Bu Rina" },
    { id: "sch_4", day_of_week: 2, start_time: "07:00", end_time: "08:30", mapel: "Bahasa Inggris", ruangan: "R. 9A", guru: "Ms. Dewi" },
    { id: "sch_5", day_of_week: 2, start_time: "08:30", end_time: "10:00", mapel: "Informatika", ruangan: "Lab Komputer", guru: "Pak Andi" },
    { id: "sch_6", day_of_week: 3, start_time: "07:00", end_time: "08:30", mapel: "IPS", ruangan: "R. 9A", guru: "Bu Wati" },
    { id: "sch_7", day_of_week: 3, start_time: "08:30", end_time: "10:00", mapel: "Matematika", ruangan: "R. 9A", guru: "Bu Sari" },
    { id: "sch_8", day_of_week: 4, start_time: "07:00", end_time: "08:30", mapel: "IPA", ruangan: "Lab IPA", guru: "Bu Rina" },
    { id: "sch_9", day_of_week: 4, start_time: "10:15", end_time: "11:45", mapel: "Bahasa Inggris", ruangan: "R. 9A", guru: "Ms. Dewi" },
    { id: "sch_10", day_of_week: 5, start_time: "07:00", end_time: "08:30", mapel: "Informatika", ruangan: "Lab Komputer", guru: "Pak Andi" },
    { id: "sch_11", day_of_week: 5, start_time: "08:30", end_time: "10:00", mapel: "Bahasa Indonesia", ruangan: "R. 9A", guru: "Pak Budi" },
  ];

  for (const s of initialSchedules) {
    insertSchedule.run(s.id, s.day_of_week, s.start_time, s.end_time, s.mapel, s.ruangan, s.guru);
  }

  // 3. Seed Overrides
  const insertOverride = db.prepare(`
    INSERT INTO schedule_override (id, date, type, mapel, start_time, end_time, ruangan, guru, keterangan)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dateForDow = (targetDow) => {
    const d = new Date();
    const diff = (targetDow - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const initialOverrides = [
    { id: "ovr_1", date: dateForDow(1), type: "replace", mapel: "Bahasa Inggris", start_time: "07:00", end_time: "08:30", ruangan: "R. 9A", guru: "Ms. Dewi", keterangan: "Matematika diganti Bahasa Inggris" },
    { id: "ovr_2", date: dateForDow(3), type: "cancel", mapel: null, start_time: null, end_time: null, ruangan: null, guru: null, keterangan: "Libur — rapat guru" },
    { id: "ovr_3", date: dateForDow(5), type: "extra", mapel: "Matematika", start_time: "13:00", end_time: "14:30", ruangan: "R. 9A", guru: "Bu Sari", keterangan: "Tambahan kelas persiapan ujian" },
  ];

  for (const o of initialOverrides) {
    insertOverride.run(o.id, o.date, o.type, o.mapel, o.start_time, o.end_time, o.ruangan, o.guru, o.keterangan);
  }

  // 4. Seed Quick Notes
  const insertNote = db.prepare(`
    INSERT INTO quicknotes (id, teks, created_at, status)
    VALUES (?, ?, ?, ?)
  `);

  const initialNotes = [
    { id: "note_1", teks: "Besok bawa penggaris & jangka buat matematika", created_at: at(0, 6, 30), status: "raw" },
    { id: "note_2", teks: "Kumpulin tugas informatika flowchart hari jumat jam 3 sore", created_at: at(-1, 20, 15), status: "raw" },
    { id: "note_3", teks: "Tanya Ms. Dewi soal format essay bahasa inggris", created_at: at(-2, 15, 45), status: "converted" },
  ];

  for (const n of initialNotes) {
    insertNote.run(n.id, n.teks, n.created_at, n.status);
  }
}

module.exports = db;
