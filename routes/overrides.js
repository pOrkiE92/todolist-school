// routes/overrides.js
// Pengecualian jadwal pada tanggal tertentu.
// ATURAN: Override tidak mengubah tabel schedule — jadwal mingguan dasar tetap utuh.

"use strict";

const express = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");

const router = express.Router();

const selectAllOvr = db.prepare("SELECT * FROM schedule_override ORDER BY date ASC, start_time ASC");
const selectOvrByDate = db.prepare("SELECT * FROM schedule_override WHERE date = ? ORDER BY date ASC, start_time ASC");
const getOvrById = db.prepare("SELECT * FROM schedule_override WHERE id = ?");
const deleteOvrById = db.prepare("DELETE FROM schedule_override WHERE id = ?");
const insertOvrStmt = db.prepare(`
  INSERT INTO schedule_override (id, date, type, mapel, start_time, end_time, ruangan, guru, keterangan)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateOvrStmt = db.prepare(`
  UPDATE schedule_override
  SET date = ?, type = ?, mapel = ?, start_time = ?, end_time = ?, ruangan = ?, guru = ?, keterangan = ?
  WHERE id = ?
`);

// ─── GET /api/schedule/overrides ─────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const { date } = req.query;
    if (date) {
      return res.json(selectOvrByDate.all(date));
    }
    res.json(selectAllOvr.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/schedule/overrides ────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const { date, type, mapel, start_time, end_time, ruangan, guru, keterangan } = req.body;

    const errors = {};
    if (!date) errors.date = "Tanggal wajib diisi";
    if (!type || !["replace", "cancel", "extra"].includes(type)) errors.type = "Tipe tidak valid";

    // Untuk replace dan extra: mapel wajib
    if (type !== "cancel" && !mapel) errors.mapel = "Mapel wajib diisi untuk tipe ini";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validasi gagal", errors });
    }

    const id = randomUUID();
    insertOvrStmt.run(
      id, date, type,
      type !== "cancel" ? mapel : null,
      start_time || null,
      end_time || null,
      ruangan || null,
      guru || null,
      keterangan || null
    );

    const item = getOvrById.get(id);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/schedule/overrides/:id ─────────────────────────────────────────
router.put("/:id", (req, res) => {
  try {
    const existing = getOvrById.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Pengecualian tidak ditemukan" });

    const {
      date = existing.date,
      type = existing.type,
      mapel,
      start_time,
      end_time,
      ruangan,
      guru,
      keterangan,
    } = req.body;

    const errors = {};
    if (!date) errors.date = "Tanggal wajib diisi";
    if (!["replace", "cancel", "extra"].includes(type)) errors.type = "Tipe tidak valid";
    const resolvedMapel = mapel !== undefined ? mapel : existing.mapel;
    if (type !== "cancel" && !resolvedMapel) errors.mapel = "Mapel wajib diisi untuk tipe ini";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validasi gagal", errors });
    }

    updateOvrStmt.run(
      date, type,
      type !== "cancel" ? (resolvedMapel || null) : null,
      start_time !== undefined ? (start_time || null) : existing.start_time,
      end_time !== undefined ? (end_time || null) : existing.end_time,
      ruangan !== undefined ? (ruangan || null) : existing.ruangan,
      guru !== undefined ? (guru || null) : existing.guru,
      keterangan !== undefined ? (keterangan || null) : existing.keterangan,
      req.params.id
    );

    const item = getOvrById.get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/schedule/overrides/:id ──────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const existing = getOvrById.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Pengecualian tidak ditemukan" });
    deleteOvrById.run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
