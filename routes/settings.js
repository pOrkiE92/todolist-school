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

module.exports = router;
