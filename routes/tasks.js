// routes/tasks.js
// CRUD tugas sekolah.
// ATURAN PENTING:
//   - `overdue` BUKAN status dan tidak disimpan di database.
//   - `is_overdue` dihitung saat baca: status != 'done' AND deadline < now.
//   - status hanya boleh: todo | in_progress | done

"use strict";

const express = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");

const router = express.Router();

// Helpers
function nowWIB() {
  // Kembalikan ISO 8601 dengan offset +07:00
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" }).replace(" ", "T") + "+07:00";
}

function isOverdue(task) {
  if (task.status === "done") return false;
  return new Date(task.deadline) < new Date();
}

function withOverdue(task) {
  return { ...task, is_overdue: isOverdue(task) };
}

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
// Query params: ?status=todo|in_progress|done  ?mapel=...  ?sort=asc|desc
router.get("/", (req, res) => {
  try {
    const { status, mapel, sort = "asc" } = req.query;

    let sql = "SELECT * FROM tasks WHERE 1=1";
    const params = [];

    if (status && ["todo", "in_progress", "done"].includes(status)) {
      sql += " AND status = ?";
      params.push(status);
    }

    if (mapel) {
      sql += " AND mapel = ?";
      params.push(mapel);
    }

    const order = sort === "desc" ? "DESC" : "ASC";
    sql += ` ORDER BY deadline ${order}`;

    const tasks = db.prepare(sql).all(...params).map(withOverdue);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const { mapel, judul, deadline, status = "todo", catatan } = req.body;

    // Validasi wajib
    const errors = {};
    if (!judul || !judul.trim()) errors.judul = "Judul tugas wajib diisi";
    if (!deadline) errors.deadline = "Deadline wajib diisi";
    if (deadline && isNaN(new Date(deadline).getTime())) errors.deadline = "Format deadline tidak valid";
    if (!["todo", "in_progress", "done"].includes(status)) errors.status = "Status tidak valid";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validasi gagal", errors });
    }

    const id = randomUUID();
    const ts = nowWIB();

    db.prepare(`
      INSERT INTO tasks (id, mapel, judul, deadline, status, catatan, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, mapel || "", judul.trim(), deadline, status, catatan || null, ts, ts);

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    res.status(201).json(withOverdue(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
    if (!task) return res.status(404).json({ error: "Tugas tidak ditemukan" });
    res.json(withOverdue(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Tugas tidak ditemukan" });

    const { mapel, judul, deadline, status, catatan } = req.body;

    // Validasi
    const errors = {};
    const newJudul = judul !== undefined ? judul : existing.judul;
    const newDeadline = deadline !== undefined ? deadline : existing.deadline;
    const newStatus = status !== undefined ? status : existing.status;

    if (!newJudul || !newJudul.trim()) errors.judul = "Judul tugas wajib diisi";
    if (!newDeadline) errors.deadline = "Deadline wajib diisi";
    if (newDeadline && isNaN(new Date(newDeadline).getTime())) errors.deadline = "Format deadline tidak valid";
    if (!["todo", "in_progress", "done"].includes(newStatus)) errors.status = "Status tidak valid";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validasi gagal", errors });
    }

    db.prepare(`
      UPDATE tasks
      SET mapel = ?, judul = ?, deadline = ?, status = ?, catatan = ?, updated_at = ?
      WHERE id = ?
    `).run(
      mapel !== undefined ? mapel : existing.mapel,
      newJudul.trim(),
      newDeadline,
      newStatus,
      catatan !== undefined ? (catatan || null) : existing.catatan,
      nowWIB(),
      req.params.id
    );

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
    res.json(withOverdue(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Tugas tidak ditemukan" });

    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
