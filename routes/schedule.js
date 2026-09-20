// routes/schedule.js
// Jadwal mingguan berulang (schedule) dan endpoint jadwal efektif hari ini.
// ATURAN: Jadwal dasar TIDAK berubah ketika ada override pada tanggal tertentu.

"use strict";

const express = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");

const router = express.Router();

// ─── Porting effectiveScheduleForDate dari lib/schedule-utils.ts ──────────────
// Menggabungkan jadwal mingguan + override tanpa mutasi data dasar.

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function effectiveScheduleForDate(date, schedules, overrides) {
  const dow = date.getDay();
  const key = toDateKey(date);
  const dayOverrides = overrides.filter((o) => o.date === key);

  const base = schedules
    .filter((s) => s.day_of_week === dow)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Cancel override → seluruh hari libur
  const dayCancel = dayOverrides.find((o) => o.type === "cancel");
  if (dayCancel) {
    return [{
      id: dayCancel.id,
      start_time: dayCancel.start_time,
      end_time: dayCancel.end_time,
      mapel: null,
      ruangan: null,
      guru: null,
      kind: "cancel",
      keterangan: dayCancel.keterangan,
    }];
  }

  const slots = [];
  const replaces = dayOverrides.filter((o) => o.type === "replace");
  const usedBase = new Set();

  for (const rep of replaces) {
    const target =
      base.find((b) => !usedBase.has(b.id) && b.start_time === rep.start_time) ??
      base.find((b) => !usedBase.has(b.id));
    if (target) usedBase.add(target.id);
    slots.push({
      id: rep.id,
      start_time: rep.start_time ?? target?.start_time ?? null,
      end_time: rep.end_time ?? target?.end_time ?? null,
      mapel: rep.mapel,
      ruangan: rep.ruangan,
      guru: rep.guru,
      kind: "replace",
      keterangan: rep.keterangan,
    });
  }

  for (const b of base) {
    if (usedBase.has(b.id)) continue;
    slots.push({
      id: b.id,
      start_time: b.start_time,
      end_time: b.end_time,
      mapel: b.mapel,
      ruangan: b.ruangan,
      guru: b.guru,
      kind: "base",
      keterangan: null,
    });
  }

  for (const ex of dayOverrides.filter((o) => o.type === "extra")) {
    slots.push({
      id: ex.id,
      start_time: ex.start_time,
      end_time: ex.end_time,
      mapel: ex.mapel,
      ruangan: ex.ruangan,
      guru: ex.guru,
      kind: "extra",
      keterangan: ex.keterangan,
    });
  }

  return slots.sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
}

// ─── GET /api/schedule ────────────────────────────────────────────────────────
// Query param: ?day=0-6 untuk filter per hari
router.get("/", (req, res) => {
  try {
    const { day } = req.query;
    let sql = "SELECT * FROM schedule";
    const params = [];

    if (day !== undefined) {
      const dow = parseInt(day, 10);
      if (isNaN(dow) || dow < 0 || dow > 6) {
        return res.status(400).json({ error: "Parameter day harus antara 0-6" });
      }
      sql += " WHERE day_of_week = ?";
      params.push(dow);
    }

    sql += " ORDER BY day_of_week ASC, start_time ASC";
    const schedules = db.prepare(sql).all(...params);
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/schedule/today ──────────────────────────────────────────────────
// Jadwal efektif hari ini setelah menerapkan override. Digunakan oleh Dashboard.
router.get("/today", (req, res) => {
  try {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const schedules = db.prepare("SELECT * FROM schedule").all();
    const overrides = db.prepare("SELECT * FROM schedule_override").all();
    const slots = effectiveScheduleForDate(today, schedules, overrides);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/schedule ───────────────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const { day_of_week, start_time, end_time, mapel, ruangan, guru } = req.body;

    const errors = {};
    if (day_of_week === undefined || day_of_week === null) errors.day_of_week = "Hari wajib dipilih";
    if (![0,1,2,3,4,5,6].includes(Number(day_of_week))) errors.day_of_week = "Hari tidak valid (0-6)";
    if (!start_time) errors.start_time = "Jam mulai wajib diisi";
    if (!end_time) errors.end_time = "Jam selesai wajib diisi";
    if (start_time && end_time && end_time <= start_time) errors.end_time = "Jam selesai harus setelah jam mulai";
    if (!mapel || !mapel.trim()) errors.mapel = "Mapel wajib diisi";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validasi gagal", errors });
    }

    const id = randomUUID();
    db.prepare(`
      INSERT INTO schedule (id, day_of_week, start_time, end_time, mapel, ruangan, guru)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, Number(day_of_week), start_time, end_time, mapel.trim(), ruangan || null, guru || null);

    const item = db.prepare("SELECT * FROM schedule WHERE id = ?").get(id);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/schedule/:id ────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM schedule WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Jadwal tidak ditemukan" });

    const {
      day_of_week = existing.day_of_week,
      start_time = existing.start_time,
      end_time = existing.end_time,
      mapel = existing.mapel,
      ruangan,
      guru,
    } = req.body;

    const errors = {};
    if (![0,1,2,3,4,5,6].includes(Number(day_of_week))) errors.day_of_week = "Hari tidak valid";
    if (end_time <= start_time) errors.end_time = "Jam selesai harus setelah jam mulai";
    if (!mapel || !String(mapel).trim()) errors.mapel = "Mapel wajib diisi";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validasi gagal", errors });
    }

    db.prepare(`
      UPDATE schedule
      SET day_of_week = ?, start_time = ?, end_time = ?, mapel = ?, ruangan = ?, guru = ?
      WHERE id = ?
    `).run(
      Number(day_of_week), start_time, end_time, String(mapel).trim(),
      ruangan !== undefined ? (ruangan || null) : existing.ruangan,
      guru !== undefined ? (guru || null) : existing.guru,
      req.params.id
    );

    const item = db.prepare("SELECT * FROM schedule WHERE id = ?").get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/schedule/:id ─────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM schedule WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Jadwal tidak ditemukan" });
    db.prepare("DELETE FROM schedule WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
