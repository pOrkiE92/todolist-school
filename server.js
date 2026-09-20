// server.js — Entry point Express backend
// Melayani REST API dan file statis frontend (HTML/CSS/JS).

"use strict";

// Load .env sebelum apapun
require("dotenv").config();

// Paksa timezone WIB agar semua Date di Node.js konsisten
process.env.TZ = "Asia/Jakarta";

const express = require("express");
const path = require("path");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File statis frontend (public/)
app.use(express.static(path.join(__dirname, "public")));

// ─── Routes API ───────────────────────────────────────────────────────────────
const tasksRouter = require("./routes/tasks");
const scheduleRouter = require("./routes/schedule");
const overridesRouter = require("./routes/overrides");
const quicknotesRouter = require("./routes/quicknotes");
const convertRouter = require("./routes/convert");

app.use("/api/tasks", tasksRouter);
app.use("/api/schedule/overrides", overridesRouter);   // harus sebelum /api/schedule agar :id tidak konflik
app.use("/api/schedule", scheduleRouter);
app.use("/api/quicknotes", quicknotesRouter);
app.use("/api/convert", convertRouter);

// ─── Catch-all — serve index.html untuk SPA ──────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Tidak boleh silent error (PRD §10)
app.use((err, req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error: "Terjadi kesalahan server", message: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ Todolist Tugas Sekolah berjalan di http://localhost:${PORT}`);
  console.log(`   Timezone : Asia/Jakarta (WIB +07:00)`);
  console.log(`   Gemini AI: ${process.env.GEMINI_API_KEY ? "✓ Terkonfigurasi" : "✗ Tidak ada API key (AI dinonaktifkan)"}\n`);
});
