// routes/quicknotes.js
// Quick Notes — brain dump bebas tanpa struktur wajib.
// Tidak wajib dikonversi menjadi Task.

"use strict";

const express = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");

const router = express.Router();

function nowWIB() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" }).replace(" ", "T") + "+07:00";
}

// ─── GET /api/quicknotes ──────────────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const notes = db.prepare("SELECT * FROM quicknotes ORDER BY created_at DESC").all();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/quicknotes ─────────────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const { teks } = req.body;

    if (!teks || !teks.trim()) {
      return res.status(400).json({ error: "Validasi gagal", errors: { teks: "Isi catatan tidak boleh kosong" } });
    }

    const id = randomUUID();
    const ts = nowWIB();
    db.prepare("INSERT INTO quicknotes (id, teks, created_at, status) VALUES (?, ?, ?, 'raw')")
      .run(id, teks.trim(), ts);

    const note = db.prepare("SELECT * FROM quicknotes WHERE id = ?").get(id);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/quicknotes/:id ───────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM quicknotes WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Catatan tidak ditemukan" });
    db.prepare("DELETE FROM quicknotes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/quicknotes/:id/convert ───────────────────────────────────────
// Menandai catatan sebagai 'converted' setelah task berhasil dibuat dari catatan ini.
// Pembuat Task dilakukan terpisah via POST /api/tasks.
router.patch("/:id/convert", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM quicknotes WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Catatan tidak ditemukan" });

    db.prepare("UPDATE quicknotes SET status = 'converted' WHERE id = ?").run(req.params.id);
    const note = db.prepare("SELECT * FROM quicknotes WHERE id = ?").get(req.params.id);
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
