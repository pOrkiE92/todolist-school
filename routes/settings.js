// routes/settings.js
// Endpoint untuk preferensi pengguna (tema, aksen warna, bahasa, format waktu)
// Disimpan di tabel _meta database SQLite.

"use strict";

const express = require("express");
const db = require("../db");

const router = express.Router();

const DEFAULT_SETTINGS = {
  theme: "system",     // "light" | "dark" | "system"
  accent: "navy",      // "navy" | "cream" | "emerald" | "violet" | "amber" | "rose" | "slate"
  lang: "id",          // "id" | "en"
  timeFormat: "24",    // "24" | "12"
};

// ─── GET /api/settings ────────────────────────────────────────────────────────
router.get("/", (_req, res) => {
  try {
    const row = db.prepare("SELECT value FROM _meta WHERE key = 'user_settings'").get();
    if (!row || !row.value) {
      return res.json(DEFAULT_SETTINGS);
    }
    const saved = JSON.parse(row.value);
    res.json({ ...DEFAULT_SETTINGS, ...saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/settings ────────────────────────────────────────────────────────
router.put("/", (req, res) => {
  try {
    const { theme, accent, lang, timeFormat } = req.body;

    const row = db.prepare("SELECT value FROM _meta WHERE key = 'user_settings'").get();
    const existing = row && row.value ? JSON.parse(row.value) : DEFAULT_SETTINGS;

    const validThemes = ["light", "dark", "system"];
    const validAccents = ["navy", "cream", "emerald", "violet", "amber", "rose", "slate"];
    const validLangs = ["id", "en"];
    const validTimeFormats = ["24", "12"];

    const updated = {
      theme: validThemes.includes(theme) ? theme : existing.theme,
      accent: validAccents.includes(accent) ? accent : existing.accent,
      lang: validLangs.includes(lang) ? lang : existing.lang,
      timeFormat: validTimeFormats.includes(timeFormat) ? timeFormat : existing.timeFormat,
    };

    db.prepare(`
      INSERT OR REPLACE INTO _meta (key, value)
      VALUES ('user_settings', ?)
    `).run(JSON.stringify(updated));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/settings/import ──────────────────────────────────────────────────
router.post("/import", (req, res) => {
  try {
    const payload = req.body.backup || req.body;
    const mode = req.body.mode === "replace" ? "replace" : "merge";

    const data = payload.data || payload;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Format file cadangan tidak valid" });
    }

    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const schedules = Array.isArray(data.schedules) ? data.schedules : [];
    const overrides = Array.isArray(data.overrides) ? data.overrides : [];
    const notes = Array.isArray(data.notes) ? data.notes : [];

    db.exec("BEGIN TRANSACTION;");
    try {
      if (mode === "replace") {
        db.exec("DELETE FROM tasks;");
        db.exec("DELETE FROM schedule;");
        db.exec("DELETE FROM schedule_override;");
        db.exec("DELETE FROM quicknotes;");
      }

      const insertTask = db.prepare(`
        INSERT OR REPLACE INTO tasks (id, mapel, judul, deadline, status, catatan, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of tasks) {
        if (!t.id || !t.judul || !t.deadline) continue;
        insertTask.run(
          t.id,
          t.mapel || "Umum",
          t.judul,
          t.deadline,
          ["todo", "in_progress", "done"].includes(t.status) ? t.status : "todo",
          t.catatan || null,
          t.created_at || new Date().toISOString(),
          t.updated_at || new Date().toISOString()
        );
      }

      const insertSched = db.prepare(`
        INSERT OR REPLACE INTO schedule (id, day_of_week, start_time, end_time, mapel, ruangan, guru)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of schedules) {
        if (!s.id || s.day_of_week === undefined || !s.start_time || !s.end_time || !s.mapel) continue;
        insertSched.run(
          s.id,
          Number(s.day_of_week),
          s.start_time,
          s.end_time,
          s.mapel,
          s.ruangan || null,
          s.guru || null
        );
      }

      const insertOvr = db.prepare(`
        INSERT OR REPLACE INTO schedule_override (id, date, type, mapel, start_time, end_time, ruangan, guru, keterangan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const o of overrides) {
        if (!o.id || !o.date || !o.type) continue;
        insertOvr.run(
          o.id,
          o.date,
          o.type,
          o.mapel || null,
          o.start_time || null,
          o.end_time || null,
          o.ruangan || null,
          o.guru || null,
          o.keterangan || null
        );
      }

      const insertNote = db.prepare(`
        INSERT OR REPLACE INTO quicknotes (id, teks, created_at, status)
        VALUES (?, ?, ?, ?)
      `);
      for (const n of notes) {
        if (!n.id || !n.teks) continue;
        insertNote.run(
          n.id,
          n.teks,
          n.created_at || new Date().toISOString(),
          n.status === "converted" ? "converted" : "raw"
        );
      }

      db.exec("COMMIT;");

      res.json({
        success: true,
        mode,
        imported: {
          tasks: tasks.length,
          schedules: schedules.length,
          overrides: overrides.length,
          notes: notes.length,
        },
      });
    } catch (txErr) {
      db.exec("ROLLBACK;");
      throw txErr;
    }
  } catch (err) {
    res.status(500).json({ error: "Gagal mengimpor data: " + err.message });
  }
});

module.exports = router;
