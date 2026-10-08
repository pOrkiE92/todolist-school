// routes/subjects.js
// Endpoint REST untuk manajemen mata pelajaran (tambah, lihat, hapus)
// Disimpan secara permanen di database SQLite tabel `subjects`.

"use strict";

const express = require("express");
const crypto = require("crypto");
const db = require("../db");

const router = express.Router();

const getAllSubjectsStmt = db.prepare("SELECT id, name, created_at FROM subjects ORDER BY name COLLATE NOCASE ASC");
const findByNameStmt = db.prepare("SELECT id, name FROM subjects WHERE LOWER(name) = LOWER(?)");
const findByIdStmt = db.prepare("SELECT id, name FROM subjects WHERE id = ?");
const countSubjectsStmt = db.prepare("SELECT COUNT(*) AS count FROM subjects");
const insertSubjectStmt = db.prepare("INSERT INTO subjects (id, name, created_at) VALUES (?, ?, ?)");
const deleteSubjectStmt = db.prepare("DELETE FROM subjects WHERE id = ?");

// ─── GET /api/subjects ─────────────────────────────────────────────────────────
router.get("/", (_req, res) => {
  try {
    const list = getAllSubjectsStmt.all();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat mata pelajaran", message: err.message });
  }
});

// ─── POST /api/subjects ────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const rawName = req.body && req.body.name;
    const name = typeof rawName === "string" ? rawName.trim() : "";

    if (!name) {
      return res.status(400).json({ error: "Nama mata pelajaran tidak boleh kosong" });
    }

    if (name.length > 60) {
      return res.status(400).json({ error: "Nama mata pelajaran maksimal 60 karakter" });
    }

    const existing = findByNameStmt.get(name);
    if (existing) {
      return res.status(409).json({ error: `Mata pelajaran "${name}" sudah ada`, subject: existing });
    }

    const id = "subj_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const createdAt = new Date().toISOString();

    insertSubjectStmt.run(id, name, createdAt);

    res.status(201).json({ id, name, created_at: createdAt });
  } catch (err) {
    res.status(500).json({ error: "Gagal menyimpan mata pelajaran", message: err.message });
  }
});

// ─── DELETE /api/subjects/:id ──────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const subject = findByIdStmt.get(id);

    if (!subject) {
      return res.status(404).json({ error: "Mata pelajaran tidak ditemukan" });
    }

    const total = countSubjectsStmt.get()?.count || 0;
    if (total <= 1) {
      return res.status(400).json({ error: "Minimal harus ada satu mata pelajaran tersisa" });
    }

    deleteSubjectStmt.run(id);

    res.json({ success: true, id: subject.id, name: subject.name });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus mata pelajaran", message: err.message });
  }
});

module.exports = router;
