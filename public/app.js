// app.js — Production Client (SPA Vanilla JavaScript)
// Mengonsumsi Express REST API (/api/tasks, /api/schedule, /api/quicknotes, /api/convert).

"use strict";

const MAPEL_LIST = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "Informatika",
];

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const STATUS_LABEL = {
  todo: "Belum dikerjakan",
  in_progress: "Sedang dikerjakan",
  done: "Selesai",
};

const OVERRIDE_TYPE_LABEL = {
  replace: "Diganti",
  cancel: "Libur",
  extra: "Tambahan",
};

// ──────────── GLOBAL STATE ────────────
let currentTab = "dashboard";
let scheduleSubTab = "weekly";
let selectedDay = new Date().getDay(); // 0 = Minggu ... 6 = Sabtu
let convertingNoteId = null;
let editingTaskId = null;
let editingScheduleId = null;
let editingOverrideId = null;
let sourceNoteIdForTask = null;
let confirmCallback = null;

// ──────────── API HELPER ────────────
async function api(path, options = {}) {
  const opts = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };
  if (opts.body && typeof opts.body === "object") {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch("/api" + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || "Terjadi kesalahan";
    throw new Error(msg);
  }
  return data;
}

// ──────────── DATE HELPERS ────────────
function formatFullDate(date = new Date()) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDeadline(iso, now = new Date()) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "-";

  const time = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const diffDays = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86400000);

  if (diffDays === 0) return `Hari ini, ${time}`;
  if (diffDays === 1) return `Besok, ${time}`;
  if (diffDays === -1) return `Kemarin, ${time}`;
  if (diffDays > 1 && diffDays <= 6) {
    const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
    return `${rtf.format(diffDays, "day")}, ${time}`;
  }

  const dateStr = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
  return `${dateStr}, ${time}`;
}

function toInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function fromInputValue(val) {
  if (!val) return "";
  return new Date(val).toISOString();
}

// ──────────── TOAST ────────────
function toast(msg, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${type === "error" ? "⚠" : "✓"}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 200);
  }, 2800);
}

// ──────────── TABS NAVIGATION ────────────
function setTab(tabName) {
  currentTab = tabName;

  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  const panel = document.getElementById(`panel-${tabName}`);
  if (panel) panel.classList.add("active");

  document.querySelectorAll(".nav-btn, .bottom-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
  });

  if (tabName === "dashboard") loadDashboard();
  if (tabName === "tasks") loadTasks();
  if (tabName === "schedule") {
    if (scheduleSubTab === "weekly") loadSchedule();
    else loadOverrides();
  }
  if (tabName === "notes") loadNotes();
}

function setScheduleSubTab(sub) {
  scheduleSubTab = sub;
  const isWeekly = sub === "weekly";
  document.getElementById("subtab-weekly").classList.toggle("active", isWeekly);
  document.getElementById("subtab-overrides").classList.toggle("active", !isWeekly);
  document.getElementById("subpanel-weekly").hidden = !isWeekly;
  document.getElementById("subpanel-overrides").hidden = isWeekly;

  const addBtn = document.getElementById("schedule-add-btn");
  if (addBtn) {
    addBtn.textContent = isWeekly ? "+ Tambah Jadwal" : "+ Tambah Pengecualian";
    addBtn.onclick = isWeekly ? () => openScheduleModal() : () => openOverrideModal();
  }

  if (isWeekly) loadSchedule();
  else loadOverrides();
}

// ──────────── DASHBOARD MODULE ────────────
async function loadDashboard() {
  try {
    const [todaySlots, allTasks, notes] = await Promise.all([
      api("/schedule/today").catch(() => []),
      api("/tasks").catch(() => []),
      api("/quicknotes").catch(() => []),
    ]);

    const now = new Date();

    // 1. Jadwal Hari Ini
    const schedContainer = document.getElementById("dashboard-schedule");
    if (!todaySlots || todaySlots.length === 0) {
      schedContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-title">Tidak ada jadwal hari ini</p>
          <p class="empty-sub">Tidak ada mata pelajaran yang terjadwal. Nikmati waktu luangmu!</p>
        </div>
      `;
    } else {
      schedContainer.innerHTML = todaySlots.map((s) => renderEffectiveSlot(s)).join("");
    }

    // 2. Tugas Perlu Perhatian (Prioritas: Overdue -> Hari ini -> Besok -> Mendatang)
    // Non-goals & PRD: Task 'done' tidak dimasukkan ke daftar prioritas!
    const activeTasks = allTasks.filter((t) => t.status !== "done");

    const overdueList = [];
    const todayList = [];
    const tomorrowList = [];
    const upcomingList = [];

    for (const t of activeTasks) {
      const d = new Date(t.deadline);
      const diffDays = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000);

      if (t.is_overdue) {
        overdueList.push(t);
      } else if (diffDays === 0) {
        todayList.push(t);
      } else if (diffDays === 1) {
        tomorrowList.push(t);
      } else {
        upcomingList.push(t);
      }
    }

    const priorityTasks = [...overdueList, ...todayList, ...tomorrowList, ...upcomingList];

    // Overdue Alert Banner & Badges
    const alertEl = document.getElementById("overdue-alert");
    const alertText = document.getElementById("overdue-alert-text");
    const dotDesktop = document.getElementById("overdue-dot-desktop");
    const badgeMobile = document.getElementById("overdue-badge");

    if (overdueList.length > 0) {
      alertEl.hidden = false;
      alertEl.style.display = "flex";
      const titles = overdueList.map((t) => `"${t.judul}"`).join(", ");
      alertText.textContent = `${overdueList.length} tugas lewat tenggat: ${titles}`;
      dotDesktop.hidden = false;
      badgeMobile.hidden = false;
      badgeMobile.textContent = overdueList.length;
    } else {
      alertEl.hidden = true;
      alertEl.style.display = "none";
      alertText.textContent = "";
      dotDesktop.hidden = true;
      badgeMobile.hidden = true;
    }

    const tasksContainer = document.getElementById("dashboard-tasks");
    if (priorityTasks.length === 0) {
      tasksContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-title">Semua tugas beres!</p>
          <p class="empty-sub">Tidak ada tugas mendesak atau yang belum selesai saat ini.</p>
        </div>
      `;
    } else {
      tasksContainer.innerHTML = priorityTasks.slice(0, 4).map((t) => renderTaskCard(t)).join("");
    }

    // 3. Counter link notes
    const notesLink = document.getElementById("notes-count-link");
    if (notesLink) {
      notesLink.textContent = `Buka notes (${notes.length}) ›`;
    }
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

function renderEffectiveSlot(slot) {
  if (slot.kind === "cancel") {
    return `
      <div class="slot-item cancel">
        <div class="slot-body">
          <div class="slot-mapel">
            <span>Libur hari ini</span>
            <span class="badge badge-override-cancel">Libur</span>
          </div>
          ${slot.keterangan ? `<p class="help-text" style="margin-top:2px;">${escapeHtml(slot.keterangan)}</p>` : ""}
        </div>
      </div>
    `;
  }

  let badge = "";
  if (slot.kind === "replace") badge = '<span class="badge badge-override-replace">Diganti</span>';
  if (slot.kind === "extra") badge = '<span class="badge badge-override-extra">Tambahan</span>';

  return `
    <div class="slot-item">
      <div class="slot-time-badge">
        <span class="slot-time-start">${slot.start_time || "--"}</span>
        <span class="slot-time-end">${slot.end_time || ""}</span>
      </div>
      <div class="slot-body">
        <div class="slot-mapel">
          <span>${escapeHtml(slot.mapel || "-")}</span>
          ${badge}
        </div>
        <div class="slot-meta">
          ${slot.ruangan ? `<span>📍 ${escapeHtml(slot.ruangan)}</span>` : ""}
          ${slot.guru ? `<span>👤 ${escapeHtml(slot.guru)}</span>` : ""}
          ${slot.keterangan && slot.kind !== "base" ? `<span>⏱ ${escapeHtml(slot.keterangan)}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

// ──────────── TASKS MODULE ────────────
async function loadTasks() {
  const status = document.getElementById("filter-status").value;
  const mapel = document.getElementById("filter-mapel").value;
  const sort = document.getElementById("filter-sort").value;

  let query = `?sort=${sort}`;
  if (status !== "all") query += `&status=${status}`;
  if (mapel !== "all") query += `&mapel=${encodeURIComponent(mapel)}`;

  const container = document.getElementById("tasks-list");
  try {
    const tasks = await api(`/tasks${query}`);
    if (!tasks || tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-title">Tidak ada tugas ditemukan</p>
          <p class="empty-sub">Coba sesuaikan filter atau tambahkan tugas baru.</p>
          <button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="openTaskModal()">+ Tambah Tugas</button>
        </div>
      `;
      return;
    }
    container.innerHTML = tasks.map((t) => renderTaskCard(t)).join("");
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="empty-title">Gagal memuat tugas</p><p class="empty-sub">${err.message}</p></div>`;
  }
}

function renderTaskCard(task) {
  const isDone = task.status === "done";
  const isOverdue = !!task.is_overdue;
  const formattedDeadline = formatDeadline(task.deadline);

  return `
    <div class="card ${isOverdue ? "overdue" : ""} ${isDone ? "done" : ""}" data-task-id="${task.id}">
      <div class="card-header-row">
        <div>
          <span class="badge badge-mapel">📖 ${escapeHtml(task.mapel || "Umum")}</span>
          <h3 class="card-title" style="margin-top:6px;">${escapeHtml(task.judul)}</h3>
          ${task.catatan ? `<p class="card-desc" style="margin-top:4px;">${escapeHtml(task.catatan)}</p>` : ""}
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <button class="btn btn-ghost btn-sm" onclick="editTask('${task.id}')" title="Edit">✏</button>
          <button class="btn btn-ghost btn-sm" onclick="confirmDeleteTask('${task.id}')" title="Hapus">🗑</button>
        </div>
      </div>
      <div class="card-footer-row">
        <span class="badge-deadline ${isOverdue ? "overdue" : ""}">
          ${isOverdue ? "⚠ Terlambat · " : "🕒 "} ${formattedDeadline}
        </span>
        <select class="select-sm badge-status ${task.status}" onchange="changeTaskStatus('${task.id}', this.value)">
          <option value="todo" ${task.status === "todo" ? "selected" : ""}>Belum dikerjakan</option>
          <option value="in_progress" ${task.status === "in_progress" ? "selected" : ""}>Sedang dikerjakan</option>
          <option value="done" ${task.status === "done" ? "selected" : ""}>Selesai</option>
        </select>
      </div>
    </div>
  `;
}

async function changeTaskStatus(id, newStatus) {
  try {
    await api(`/tasks/${id}`, {
      method: "PUT",
      body: { status: newStatus },
    });
    toast(`Status diubah: ${STATUS_LABEL[newStatus]}`);
    loadDashboard();
    if (currentTab === "tasks") loadTasks();
  } catch (err) {
    toast(`Gagal mengubah status: ${err.message}`, "error");
  }
}

// ──────────── SCHEDULE MODULE ────────────
function renderDayPills() {
  const container = document.getElementById("day-pills");
  if (!container) return;
  // Urutan Senin (1) s/d Minggu (0)
  const ordered = [1, 2, 3, 4, 5, 6, 0];
  const todayDow = new Date().getDay();

  container.innerHTML = ordered.map((d) => {
    const isSelected = selectedDay === d;
    const isToday = todayDow === d;
    return `
      <button class="day-pill ${isSelected ? "active" : ""}" onclick="selectDay(${d})">
        <span>${DAY_NAMES[d]}</span>
        ${isToday ? '<span class="today-dot"></span>' : ""}
      </button>
    `;
  }).join("");
}

function selectDay(dow) {
  selectedDay = dow;
  renderDayPills();
  loadSchedule();
}

async function loadSchedule() {
  renderDayPills();
  const container = document.getElementById("schedule-list");
  try {
    const list = await api(`/schedule?day=${selectedDay}`);
    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-title">Belum ada jadwal hari ${DAY_NAMES[selectedDay]}</p>
          <p class="empty-sub">Tambahkan jadwal pelajaran rutin untuk hari ini.</p>
          <button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="openScheduleModal()">+ Tambah Jadwal</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((item) => `
      <div class="slot-item">
        <div class="slot-time-badge">
          <span class="slot-time-start">${item.start_time}</span>
          <span class="slot-time-end">${item.end_time}</span>
        </div>
        <div class="slot-body">
          <div class="slot-mapel">${escapeHtml(item.mapel)}</div>
          <div class="slot-meta">
            ${item.ruangan ? `<span>📍 ${escapeHtml(item.ruangan)}</span>` : ""}
            ${item.guru ? `<span>👤 ${escapeHtml(item.guru)}</span>` : ""}
          </div>
        </div>
        <div class="slot-actions">
          <button class="btn btn-ghost btn-sm" onclick="editSchedule('${item.id}')" title="Edit">✏</button>
          <button class="btn btn-ghost btn-sm" onclick="confirmDeleteSchedule('${item.id}')" title="Hapus">🗑</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="empty-title">Gagal memuat jadwal</p><p class="empty-sub">${err.message}</p></div>`;
  }
}

// ──────────── OVERRIDES MODULE ────────────
async function loadOverrides() {
  const container = document.getElementById("overrides-list");
  try {
    const list = await api("/schedule/overrides");
    const badgeCount = document.getElementById("override-count-badge");
    if (badgeCount) badgeCount.textContent = `(${list.length})`;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-title">Belum ada pengecualian jadwal</p>
          <p class="empty-sub">Tambahkan hari libur, jadwal pengganti, atau kelas ekstra.</p>
          <button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="openOverrideModal()">+ Tambah Pengecualian</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((ovr) => {
      const typeBadge = `<span class="badge badge-override-${ovr.type}">${OVERRIDE_TYPE_LABEL[ovr.type]}</span>`;
      return `
        <div class="card">
          <div class="card-header-row">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <strong>${ovr.date}</strong>
                ${typeBadge}
              </div>
              <p class="card-desc" style="margin-top:4px;">
                ${escapeHtml(ovr.keterangan || (ovr.type === "cancel" ? "Libur" : ovr.mapel))}
              </p>
            </div>
            <div style="display:flex; align-items:center; gap:4px;">
              <button class="btn btn-ghost btn-sm" onclick="editOverride('${ovr.id}')" title="Edit">✏</button>
              <button class="btn btn-ghost btn-sm" onclick="confirmDeleteOverride('${ovr.id}')" title="Hapus">🗑</button>
            </div>
          </div>
          ${ovr.type !== "cancel" ? `
            <div class="slot-meta" style="border-top:1px solid var(--border); padding-top:6px; margin-top:4px;">
              ${ovr.mapel ? `<span>Mapel: <strong>${escapeHtml(ovr.mapel)}</strong></span>` : ""}
              ${ovr.start_time ? `<span>Waktu: ${ovr.start_time} - ${ovr.end_time}</span>` : ""}
              ${ovr.ruangan ? `<span>Ruang: ${escapeHtml(ovr.ruangan)}</span>` : ""}
              ${ovr.guru ? `<span>Guru: ${escapeHtml(ovr.guru)}</span>` : ""}
            </div>
          ` : ""}
        </div>
      `;
    }).join("");
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="empty-title">Gagal memuat pengecualian</p><p class="empty-sub">${err.message}</p></div>`;
  }
}

// ──────────── QUICK NOTES MODULE ────────────
async function loadNotes() {
  const container = document.getElementById("notes-list");
  try {
    const list = await api("/quicknotes");
    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-title">Belum ada catatan</p>
          <p class="empty-sub">Tulis apa pun yang sedang kepikiran di atas untuk disimpan.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((n) => `
      <div class="card">
        <div class="card-header-row">
          <p class="card-desc" style="color:var(--card-foreground); font-size:13px; font-weight:500;">
            ${escapeHtml(n.teks)}
          </p>
          ${n.status === "converted" ? '<span class="badge" style="background:var(--success-light); color:#047857; flex-shrink:0;">✓ Jadi tugas</span>' : ""}
        </div>
        <p class="hint-text" style="margin-top:4px;">${formatDeadline(n.created_at)}</p>
        <div class="card-footer-row" style="margin-top:8px;">
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="convertNoteManual('${n.id}', '${escapeAttr(n.teks)}')">
              + Jadikan Tugas
            </button>
            <button class="btn btn-outline btn-sm" style="border-color:var(--primary); color:var(--primary);" onclick="convertNoteAI('${n.id}', '${escapeAttr(n.teks)}')">
              ✨ Konversi AI
            </button>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="confirmDeleteNote('${n.id}')" title="Hapus">🗑</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="empty-title">Gagal memuat catatan</p><p class="empty-sub">${err.message}</p></div>`;
  }
}

async function saveQuickNote(teks) {
  const clean = (teks || "").trim();
  if (!clean) return;
  try {
    await api("/quicknotes", {
      method: "POST",
      body: { teks: clean },
    });
    toast("Catatan tersimpan");
    if (currentTab === "dashboard") loadDashboard();
    else loadNotes();
  } catch (err) {
    toast(`Gagal menyimpan: ${err.message}`, "error");
  }
}

// Convert Note: Manual
function convertNoteManual(noteId, text) {
  openTaskModal({
    title: "Jadikan Tugas",
    desc: "Lengkapi data tugas dari catatan cepat.",
    submitLabel: "Simpan Tugas",
    sourceNoteId: noteId,
    initial: {
      judul: text.length > 60 ? text.slice(0, 60) : text,
      catatan: text,
      status: "todo",
    },
  });
}

// Convert Note: AI Flow
async function convertNoteAI(noteId, text) {
  const loadingEl = document.getElementById("ai-loading");
  if (loadingEl) loadingEl.hidden = false;

  try {
    const result = await api("/convert", {
      method: "POST",
      body: { teks: text },
    });

    if (loadingEl) loadingEl.hidden = true;

    // Sesuai PRD §6: AI output selalu harus melalui konfirmasi/edit user sebelum disimpan!
    openTaskModal({
      title: "Konfirmasi Hasil AI",
      desc: "Hasil analisis Gemini AI. Periksa dan edit sebelum disimpan.",
      submitLabel: "Konfirmasi & Simpan",
      sourceNoteId: noteId,
      initial: {
        mapel: result.mapel || "",
        judul: result.judul || "",
        deadline: result.deadline || "",
        catatan: result.catatan || text,
        status: "todo",
      },
    });
  } catch (err) {
    if (loadingEl) loadingEl.hidden = true;
    toast(`AI Convert gagal: ${err.message}`, "error");

    // Fallback manual per PRD §6
    setTimeout(() => {
      convertNoteManual(noteId, text);
    }, 400);
  }
}

// ──────────── MODALS CONTROLLER ────────────

// 1. Task Modal
function openTaskModal(config = {}) {
  editingTaskId = config.id || null;
  sourceNoteIdForTask = config.sourceNoteId || null;

  document.getElementById("task-modal-title").textContent = config.title || (editingTaskId ? "Edit Tugas" : "Tambah Tugas");
  const descEl = document.getElementById("task-modal-desc");
  if (config.desc) {
    descEl.hidden = false;
    descEl.textContent = config.desc;
  } else {
    descEl.hidden = true;
  }
  document.getElementById("task-form-submit").textContent = config.submitLabel || (editingTaskId ? "Perbarui" : "Simpan");

  const initial = config.initial || {};
  document.getElementById("tf-mapel").value = initial.mapel || MAPEL_LIST[0];
  document.getElementById("tf-judul").value = initial.judul || "";
  document.getElementById("tf-deadline").value = toInputValue(initial.deadline);
  document.getElementById("tf-status").value = initial.status || "todo";
  document.getElementById("tf-catatan").value = initial.catatan || "";

  clearFormErrors("tf");
  document.getElementById("task-modal-backdrop").hidden = false;
}

function closeTaskModal() {
  document.getElementById("task-modal-backdrop").hidden = true;
  editingTaskId = null;
  sourceNoteIdForTask = null;
}

async function editTask(id) {
  try {
    const task = await api(`/tasks/${id}`);
    openTaskModal({
      id: task.id,
      title: "Edit Tugas",
      initial: {
        mapel: task.mapel,
        judul: task.judul,
        deadline: task.deadline,
        status: task.status,
        catatan: task.catatan,
      },
    });
  } catch (err) {
    toast(`Gagal membuka tugas: ${err.message}`, "error");
  }
}

// 2. Schedule Modal
function openScheduleModal(initial = null) {
  editingScheduleId = initial?.id || null;
  document.getElementById("schedule-modal-title").textContent = editingScheduleId ? "Edit Jadwal" : "Tambah Jadwal";

  document.getElementById("sf-day").value = String(initial?.day_of_week ?? selectedDay);
  document.getElementById("sf-start").value = initial?.start_time || "07:00";
  document.getElementById("sf-end").value = initial?.end_time || "08:30";
  document.getElementById("sf-mapel").value = initial?.mapel || MAPEL_LIST[0];
  document.getElementById("sf-ruangan").value = initial?.ruangan || "";
  document.getElementById("sf-guru").value = initial?.guru || "";

  clearFormErrors("sf");
  document.getElementById("schedule-modal-backdrop").hidden = false;
}

function closeScheduleModal() {
  document.getElementById("schedule-modal-backdrop").hidden = true;
  editingScheduleId = null;
}

async function editSchedule(id) {
  try {
    const list = await api("/schedule");
    const item = list.find((s) => s.id === id);
    if (item) openScheduleModal(item);
  } catch (err) {
    toast(`Gagal memuat jadwal: ${err.message}`, "error");
  }
}

// 3. Override Modal
function openOverrideModal(initial = null) {
  editingOverrideId = initial?.id || null;
  document.getElementById("override-modal-title").textContent = editingOverrideId ? "Edit Pengecualian" : "Tambah Pengecualian";

  const type = initial?.type || "replace";
  document.getElementById("of-type").value = type;
  document.getElementById("of-date").value = initial?.date || new Date().toISOString().slice(0, 10);
  document.getElementById("of-mapel").value = initial?.mapel || MAPEL_LIST[0];
  document.getElementById("of-start").value = initial?.start_time || "";
  document.getElementById("of-end").value = initial?.end_time || "";
  document.getElementById("of-ruangan").value = initial?.ruangan || "";
  document.getElementById("of-guru").value = initial?.guru || "";
  document.getElementById("of-ket").value = initial?.keterangan || "";

  handleOverrideTypeChange(type);
  clearFormErrors("of");
  document.getElementById("override-modal-backdrop").hidden = false;
}

function closeOverrideModal() {
  document.getElementById("override-modal-backdrop").hidden = true;
  editingOverrideId = null;
}

function handleOverrideTypeChange(type) {
  const details = document.getElementById("of-details");
  const hint = document.getElementById("of-type-hint");
  if (type === "cancel") {
    details.style.display = "none";
    hint.textContent = "Tandai tanggal ini libur (semua jadwal ditiadakan).";
  } else if (type === "replace") {
    details.style.display = "block";
    hint.textContent = "Ganti pelajaran pada tanggal ini.";
  } else {
    details.style.display = "block";
    hint.textContent = "Tambahkan kelas ekstra pada tanggal ini.";
  }
}

async function editOverride(id) {
  try {
    const list = await api("/schedule/overrides");
    const item = list.find((o) => o.id === id);
    if (item) openOverrideModal(item);
  } catch (err) {
    toast(`Gagal memuat pengecualian: ${err.message}`, "error");
  }
}

// 4. Confirm Delete Modal
function openConfirmModal(title, desc, onConfirm) {
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-desc").textContent = desc;
  confirmCallback = onConfirm;
  const backdrop = document.getElementById("confirm-modal-backdrop");
  backdrop.hidden = false;
  backdrop.style.display = "flex";
}

function closeConfirmModal() {
  const backdrop = document.getElementById("confirm-modal-backdrop");
  backdrop.hidden = true;
  backdrop.style.display = "none";
  confirmCallback = null;
}

async function confirmDeleteTask(id) {
  let title = "Tugas";
  try {
    const task = await api(`/tasks/${id}`);
    if (task && task.judul) title = task.judul;
  } catch {}

  openConfirmModal("Hapus Tugas?", `Tugas "${title}" akan dihapus secara permanen.`, async () => {
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      toast("Tugas telah dihapus");
      loadDashboard();
      if (currentTab === "tasks") loadTasks();
    } catch (err) {
      toast(`Gagal menghapus: ${err.message}`, "error");
    }
  });
}

async function confirmDeleteSchedule(id) {
  openConfirmModal("Hapus Jadwal?", "Jadwal pelajaran ini akan dihapus.", async () => {
    try {
      await api(`/schedule/${id}`, { method: "DELETE" });
      toast("Jadwal telah dihapus");
      loadSchedule();
      loadDashboard();
    } catch (err) {
      toast(`Gagal menghapus: ${err.message}`, "error");
    }
  });
}

async function confirmDeleteOverride(id) {
  openConfirmModal("Hapus Pengecualian?", "Pengecualian jadwal ini akan dihapus.", async () => {
    try {
      await api(`/schedule/overrides/${id}`, { method: "DELETE" });
      toast("Pengecualian telah dihapus");
      loadOverrides();
      loadDashboard();
    } catch (err) {
      toast(`Gagal menghapus: ${err.message}`, "error");
    }
  });
}

async function confirmDeleteNote(id) {
  openConfirmModal("Hapus Catatan?", "Catatan ini akan dihapus permanen.", async () => {
    try {
      await api(`/quicknotes/${id}`, { method: "DELETE" });
      toast("Catatan telah dihapus");
      loadNotes();
      loadDashboard();
    } catch (err) {
      toast(`Gagal menghapus: ${err.message}`, "error");
    }
  });
}

function clearFormErrors(prefix) {
  document.querySelectorAll(`[id^="${prefix}-"][id$="-error"]`).forEach((el) => {
    el.textContent = "";
    el.classList.remove("active");
  });
}

function setFormError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.add("active");
  }
}

// ──────────── UTILS ────────────
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ──────────── INIT & EVENT LISTENERS ────────────
document.addEventListener("DOMContentLoaded", () => {
  // Header date
  const dateEl = document.getElementById("header-date");
  if (dateEl) dateEl.textContent = formatFullDate();

  // Populate Mapel dropdowns
  const populateMapel = (selectId, includeAll = false) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = (includeAll ? '<option value="all">Semua Mapel</option>' : "") +
      MAPEL_LIST.map((m) => `<option value="${m}">${m}</option>`).join("");
  };

  populateMapel("filter-mapel", true);
  populateMapel("tf-mapel");
  populateMapel("sf-mapel");
  populateMapel("of-mapel");

  // Navigation tab clicks
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTab(btn.getAttribute("data-tab"));
    });
  });

  // Filter change events
  ["filter-status", "filter-mapel", "filter-sort"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", loadTasks);
  });

  // Add Task Button
  const addTaskBtn = document.getElementById("add-task-btn");
  if (addTaskBtn) addTaskBtn.addEventListener("click", () => openTaskModal());

  // Task Form Submit
  const taskForm = document.getElementById("task-form");
  if (taskForm) {
    taskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormErrors("tf");

      const mapel = document.getElementById("tf-mapel").value;
      const judul = document.getElementById("tf-judul").value.trim();
      const rawDeadline = document.getElementById("tf-deadline").value;
      const status = document.getElementById("tf-status").value;
      const catatan = document.getElementById("tf-catatan").value.trim();

      let hasError = false;
      if (!judul) {
        setFormError("tf-judul-error", "Judul tugas wajib diisi");
        hasError = true;
      }
      if (!rawDeadline) {
        setFormError("tf-deadline-error", "Deadline wajib diisi");
        hasError = true;
      }

      if (hasError) return;

      const payload = {
        mapel,
        judul,
        deadline: fromInputValue(rawDeadline),
        status,
        catatan: catatan || null,
      };

      try {
        if (editingTaskId) {
          await api(`/tasks/${editingTaskId}`, { method: "PUT", body: payload });
          toast("Tugas berhasil diperbarui");
        } else {
          await api("/tasks", { method: "POST", body: payload });
          toast("Tugas berhasil ditambahkan");
        }

        // Jika tugas dibuat dari Quick Note, tandai catatan as 'converted'
        if (sourceNoteIdForTask) {
          await api(`/quicknotes/${sourceNoteIdForTask}/convert`, { method: "PATCH" }).catch(() => {});
        }

        closeTaskModal();
        if (currentTab === "dashboard") loadDashboard();
        else if (currentTab === "tasks") loadTasks();
        else if (currentTab === "notes") loadNotes();
      } catch (err) {
        toast(`Gagal menyimpan tugas: ${err.message}`, "error");
      }
    });
  }

  // Schedule Form Submit
  const scheduleForm = document.getElementById("schedule-form");
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormErrors("sf");

      const day_of_week = Number(document.getElementById("sf-day").value);
      const start_time = document.getElementById("sf-start").value;
      const end_time = document.getElementById("sf-end").value;
      const mapel = document.getElementById("sf-mapel").value;
      const ruangan = document.getElementById("sf-ruangan").value.trim();
      const guru = document.getElementById("sf-guru").value.trim();

      let hasError = false;
      if (!start_time) {
        setFormError("sf-start-error", "Jam mulai wajib");
        hasError = true;
      }
      if (!end_time) {
        setFormError("sf-end-error", "Jam selesai wajib");
        hasError = true;
      }
      if (start_time && end_time && end_time <= start_time) {
        setFormError("sf-end-error", "Jam selesai harus setelah jam mulai");
        hasError = true;
      }
      if (!mapel) {
        setFormError("sf-mapel-error", "Mapel wajib");
        hasError = true;
      }

      if (hasError) return;

      const payload = {
        day_of_week,
        start_time,
        end_time,
        mapel,
        ruangan: ruangan || null,
        guru: guru || null,
      };

      try {
        if (editingScheduleId) {
          await api(`/schedule/${editingScheduleId}`, { method: "PUT", body: payload });
          toast("Jadwal berhasil diperbarui");
        } else {
          await api("/schedule", { method: "POST", body: payload });
          toast("Jadwal berhasil ditambahkan");
        }
        closeScheduleModal();
        loadSchedule();
      } catch (err) {
        toast(`Gagal menyimpan jadwal: ${err.message}`, "error");
      }
    });
  }

  // Override Form Submit & Type switch
  const overrideTypeSelect = document.getElementById("of-type");
  if (overrideTypeSelect) {
    overrideTypeSelect.addEventListener("change", (e) => {
      handleOverrideTypeChange(e.target.value);
    });
  }

  const overrideForm = document.getElementById("override-form");
  if (overrideForm) {
    overrideForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormErrors("of");

      const type = document.getElementById("of-type").value;
      const date = document.getElementById("of-date").value;
      const mapel = document.getElementById("of-mapel").value;
      const start_time = document.getElementById("of-start").value;
      const end_time = document.getElementById("of-end").value;
      const ruangan = document.getElementById("of-ruangan").value.trim();
      const guru = document.getElementById("of-guru").value.trim();
      const keterangan = document.getElementById("of-ket").value.trim();

      let hasError = false;
      if (!date) {
        setFormError("of-date-error", "Tanggal wajib");
        hasError = true;
      }
      if (type !== "cancel" && !mapel) {
        setFormError("of-mapel-error", "Mapel wajib");
        hasError = true;
      }

      if (hasError) return;

      const payload = {
        date,
        type,
        mapel: type !== "cancel" ? mapel : null,
        start_time: type !== "cancel" && start_time ? start_time : null,
        end_time: type !== "cancel" && end_time ? end_time : null,
        ruangan: type !== "cancel" && ruangan ? ruangan : null,
        guru: type !== "cancel" && guru ? guru : null,
        keterangan: keterangan || null,
      };

      try {
        if (editingOverrideId) {
          await api(`/schedule/overrides/${editingOverrideId}`, { method: "PUT", body: payload });
          toast("Pengecualian berhasil diperbarui");
        } else {
          await api("/schedule/overrides", { method: "POST", body: payload });
          toast("Pengecualian berhasil ditambahkan");
        }
        closeOverrideModal();
        loadOverrides();
      } catch (err) {
        toast(`Gagal menyimpan pengecualian: ${err.message}`, "error");
      }
    });
  }

  // Confirm delete button
  const confirmBtn = document.getElementById("confirm-ok-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (typeof confirmCallback === "function") {
        confirmCallback();
      }
      closeConfirmModal();
    });
  }

  // Quick note input: Dashboard
  const dashNoteInput = document.getElementById("dash-note-input");
  const dashNoteBtn = document.getElementById("dash-note-btn");
  if (dashNoteBtn && dashNoteInput) {
    dashNoteBtn.addEventListener("click", () => {
      saveQuickNote(dashNoteInput.value);
      dashNoteInput.value = "";
    });
    dashNoteInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        dashNoteBtn.click();
      }
    });
  }

  // Quick note input: Notes tab
  const notesInput = document.getElementById("notes-input");
  const notesSaveBtn = document.getElementById("notes-save-btn");
  if (notesSaveBtn && notesInput) {
    notesSaveBtn.addEventListener("click", () => {
      saveQuickNote(notesInput.value);
      notesInput.value = "";
    });
    notesInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        notesSaveBtn.click();
      }
    });
  }

  // Initial load
  loadDashboard();
});
