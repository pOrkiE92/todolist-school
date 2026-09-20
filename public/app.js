// app.js — Production Client (SPA Vanilla JavaScript)
// Mengonsumsi Express REST API (/api/tasks, /api/schedule, /api/quicknotes, /api/settings, /api/convert).

"use strict";

const MAPEL_LIST = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "Informatika",
];

// ──────────── I18N DICTIONARY ────────────
const I18N = {
  id: {
    nav_dashboard: "Beranda",
    nav_tasks: "Tugas",
    nav_schedule: "Jadwal",
    nav_notes: "Notes",
    nav_settings: "Pengaturan",

    dash_schedule_title: "Jadwal Hari Ini",
    dash_all_schedule: "Semua jadwal ›",
    dash_tasks_title: "Perlu Perhatian",
    dash_all_tasks: "Semua tugas ›",
    dash_notes_title: "Catatan Cepat",
    dash_open_notes: "Buka notes ›",
    dash_note_placeholder: "Catat sesuatu...",
    dash_note_hint: "Enter untuk simpan",
    btn_save: "+ Simpan",

    tasks_title: "Daftar Tugas",
    tasks_sub: "Kelola tenggat waktu dan status pengerjaan",
    btn_add_task: "+ Tambah",
    filter_all_status: "Semua status",
    filter_all_mapel: "Semua mapel",
    filter_deadline_asc: "Deadline: terdekat",
    filter_deadline_desc: "Deadline: terjauh",
    status_todo: "Belum dikerjakan",
    status_in_progress: "Sedang dikerjakan",
    status_done: "Selesai",
    status_overdue: "Terlambat",

    schedule_title: "Jadwal Pelajaran",
    schedule_sub: "Jadwal mingguan dan penyesuaian khusus",
    tab_weekly: "Jadwal Mingguan",
    tab_overrides: "Pengecualian / Override",
    btn_add_schedule: "+ Tambah Jadwal",
    btn_add_override: "+ Tambah Pengecualian",

    override_replace: "Diganti",
    override_cancel: "Libur",
    override_extra: "Tambahan",

    notes_title: "Quick Notes",
    notes_sub: "Catat tugas atau info cepat, konversi jadi task kapan saja",
    notes_placeholder: "Tulis catatan atau instruksi tugas di sini...",

    settings_title: "Pengaturan",
    settings_subtitle: "Kustomisasi tampilan, warna aksen, dan preferensi aplikasi",
    settings_appearance_title: "Tampilan & Warna",
    settings_appearance_desc: "Pilih tema gelap/terang dan warna aksen favorit",
    settings_theme_mode: "Mode Tema",
    settings_accent_color: "Warna Aksen",
    settings_accent_hint: "Tersedia untuk mode Terang & Gelap",
    settings_preview_title: "Pratinjau Aksen",
    settings_preview_btn: "Tombol Utama",
    settings_preview_badge: "🏷️ Badge Aktif",
    theme_light: "Terang",
    theme_dark: "Gelap",
    theme_system: "Sistem",
    settings_lang_title: "Bahasa & Format",
    settings_lang_desc: "Pilih bahasa pengantar antarmuka dan format waktu",
    settings_lang_label: "Bahasa Antarmuka",
    settings_time_format_label: "Format Jam",
    time_format_24: "24 Jam (14:30)",
    time_format_12: "12 Jam (02:30 PM)",
    settings_data_title: "Cadangan Data",
    settings_data_desc: "Unduh salinan data tugas dan jadwal Anda sebagai file JSON",
    btn_export_data: "Ekspor Data (JSON)",
    settings_about_title: "Tentang Aplikasi",
    about_version: "Versi",
    about_database: "Database",
    about_timezone: "Zona Waktu",
    about_storage: "Penyimpanan",
    about_storage_val: "Permanen (Server & Lokal)",

    toast_task_added: "Tugas berhasil ditambahkan",
    toast_task_updated: "Tugas berhasil diperbarui",
    toast_task_deleted: "Tugas berhasil dihapus",
    toast_status_changed: "Status diubah",
    toast_schedule_added: "Jadwal berhasil ditambahkan",
    toast_schedule_updated: "Jadwal berhasil diperbarui",
    toast_schedule_deleted: "Jadwal berhasil dihapus",
    toast_override_added: "Pengecualian berhasil disimpan",
    toast_override_updated: "Pengecualian berhasil diperbarui",
    toast_override_deleted: "Pengecualian berhasil dihapus",
    toast_note_saved: "Catatan berhasil disimpan",
    toast_note_deleted: "Catatan berhasil dihapus",
    toast_settings_saved: "Pengaturan berhasil disimpan",
    toast_data_exported: "Data berhasil diekspor",
  },
  en: {
    nav_dashboard: "Dashboard",
    nav_tasks: "Tasks",
    nav_schedule: "Schedule",
    nav_notes: "Notes",
    nav_settings: "Settings",

    dash_schedule_title: "Today's Schedule",
    dash_all_schedule: "All schedule ›",
    dash_tasks_title: "Needs Attention",
    dash_all_tasks: "All tasks ›",
    dash_notes_title: "Quick Notes",
    dash_open_notes: "Open notes ›",
    dash_note_placeholder: "Note something down...",
    dash_note_hint: "Press Enter to save",
    btn_save: "+ Save",

    tasks_title: "Task List",
    tasks_sub: "Manage deadlines and task progress",
    btn_add_task: "+ Add Task",
    filter_all_status: "All statuses",
    filter_all_mapel: "All subjects",
    filter_deadline_asc: "Deadline: Earliest",
    filter_deadline_desc: "Deadline: Latest",
    status_todo: "To Do",
    status_in_progress: "In Progress",
    status_done: "Done",
    status_overdue: "Overdue",

    schedule_title: "Class Schedule",
    schedule_sub: "Weekly recurring schedule and exceptions",
    tab_weekly: "Weekly Schedule",
    tab_overrides: "Overrides / Exceptions",
    btn_add_schedule: "+ Add Schedule",
    btn_add_override: "+ Add Override",

    override_replace: "Replaced",
    override_cancel: "Holiday",
    override_extra: "Extra Class",

    notes_title: "Quick Notes",
    notes_sub: "Capture quick thoughts or homework info, convert to tasks anytime",
    notes_placeholder: "Write notes or homework instructions here...",

    settings_title: "Settings",
    settings_subtitle: "Customize appearance, accent colors, and app preferences",
    settings_appearance_title: "Appearance & Color",
    settings_appearance_desc: "Choose dark/light theme and your favorite accent color",
    settings_theme_mode: "Theme Mode",
    settings_accent_color: "Accent Color",
    settings_accent_hint: "Available in both Light & Dark modes",
    settings_preview_title: "Accent Preview",
    settings_preview_btn: "Primary Button",
    settings_preview_badge: "🏷️ Active Badge",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    settings_lang_title: "Language & Format",
    settings_lang_desc: "Select interface language and time format",
    settings_lang_label: "Interface Language",
    settings_time_format_label: "Time Format",
    time_format_24: "24-Hour (14:30)",
    time_format_12: "12-Hour (02:30 PM)",
    settings_data_title: "Data Backup",
    settings_data_desc: "Download a backup copy of your tasks and schedule as a JSON file",
    btn_export_data: "Export Data (JSON)",
    settings_about_title: "About Application",
    about_version: "Version",
    about_database: "Database",
    about_timezone: "Timezone",
    about_storage: "Storage",
    about_storage_val: "Permanent (Server & Local)",

    toast_task_added: "Task added successfully",
    toast_task_updated: "Task updated successfully",
    toast_task_deleted: "Task deleted successfully",
    toast_status_changed: "Status changed",
    toast_schedule_added: "Schedule added successfully",
    toast_schedule_updated: "Schedule updated successfully",
    toast_schedule_deleted: "Schedule deleted successfully",
    toast_override_added: "Override saved successfully",
    toast_override_updated: "Override updated successfully",
    toast_override_deleted: "Override deleted successfully",
    toast_note_saved: "Note saved successfully",
    toast_note_deleted: "Note deleted successfully",
    toast_settings_saved: "Settings saved successfully",
    toast_data_exported: "Data exported successfully",
  }
};

// ──────────── SETTINGS STATE ────────────
let currentLang = localStorage.getItem("app_lang") || "id";
let currentTheme = localStorage.getItem("app_theme") || "system";
let currentAccent = localStorage.getItem("app_accent") || "navy";
let currentTimeFormat = localStorage.getItem("app_time_format") || "24";

function t(key) {
  return I18N[currentLang]?.[key] || I18N["id"]?.[key] || key;
}

function getDayNames() {
  return currentLang === "en"
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    : ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
}

// Compatibility getter for DAY_NAMES
const DAY_NAMES = new Proxy([], {
  get(_target, prop) {
    const list = getDayNames();
    return list[prop];
  }
});

function getStatusLabel(status) {
  return t(`status_${status}`) || status;
}

const STATUS_LABEL = new Proxy({}, {
  get(_target, prop) {
    return getStatusLabel(prop);
  }
});

function getOverrideTypeLabel(type) {
  return t(`override_${type}`) || type;
}

const OVERRIDE_TYPE_LABEL = new Proxy({}, {
  get(_target, prop) {
    return getOverrideTypeLabel(prop);
  }
});

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
function getLocale() {
  return currentLang === "en" ? "en-US" : "id-ID";
}

function formatFullDate(date = new Date()) {
  return date.toLocaleDateString(getLocale(), {
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

function formatTime(date) {
  const is12 = currentTimeFormat === "12";
  return date.toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: is12,
  });
}

function formatDeadline(iso, now = new Date()) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "-";

  const time = formatTime(date);
  const diffDays = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86400000);

  if (diffDays === 0) return (currentLang === "en" ? "Today, " : "Hari ini, ") + time;
  if (diffDays === 1) return (currentLang === "en" ? "Tomorrow, " : "Besok, ") + time;
  if (diffDays === -1) return (currentLang === "en" ? "Yesterday, " : "Kemarin, ") + time;
  if (diffDays > 1 && diffDays <= 6) {
    const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });
    return `${rtf.format(diffDays, "day")}, ${time}`;
  }

  const dateStr = date.toLocaleDateString(getLocale(), {
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
  if (tabName === "settings") loadSettings();
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

  // ──────────── SETTINGS MODULE ────────────
  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && I18N[currentLang]?.[key]) {
        el.textContent = I18N[currentLang][key];
      }
    });

    const dashInput = document.getElementById("dash-note-input");
    if (dashInput) dashInput.placeholder = t("dash_note_placeholder");
    const notesInput = document.getElementById("notes-input");
    if (notesInput) notesInput.placeholder = t("notes_placeholder");

    // Update header date
    const headerDateEl = document.getElementById("header-date");
    if (headerDateEl) headerDateEl.textContent = formatFullDate(new Date());
  }

  function setAppTheme(theme) {
    currentTheme = theme;
    localStorage.setItem("app_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);

    document.querySelectorAll("#theme-segmented .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-theme-val") === theme);
    });

    const labelEl = document.getElementById("current-theme-label");
    if (labelEl) {
      const labels = {
        light: t("theme_light"),
        dark: t("theme_dark"),
        system: t("theme_system") + ` (${currentLang === "en" ? "System" : "Otomatis"})`,
      };
      labelEl.textContent = labels[theme] || theme;
    }

    api("/settings", { method: "PUT", body: { theme } }).catch(() => {});
    toast(t("toast_settings_saved"));
  }

  function setAppAccent(accent) {
    currentAccent = accent;
    localStorage.setItem("app_accent", accent);
    document.documentElement.setAttribute("data-accent", accent);

    document.querySelectorAll("#accent-grid .accent-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-accent-val") === accent);
    });

    api("/settings", { method: "PUT", body: { accent } }).catch(() => {});
    toast(t("toast_settings_saved"));
  }

  function setAppLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("app_lang", lang);

    document.querySelectorAll("#lang-segmented .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang-val") === lang);
    });

    applyI18n();
    api("/settings", { method: "PUT", body: { lang } }).catch(() => {});

    if (currentTab === "dashboard") loadDashboard();
    else if (currentTab === "tasks") loadTasks();
    else if (currentTab === "schedule") {
      if (scheduleSubTab === "weekly") loadSchedule();
      else loadOverrides();
    }
    else if (currentTab === "notes") loadNotes();
    else if (currentTab === "settings") loadSettings();

    toast(t("toast_settings_saved"));
  }

  function setAppTimeFormat(fmt) {
    currentTimeFormat = fmt;
    localStorage.setItem("app_time_format", fmt);

    document.querySelectorAll("#time-segmented .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-time-val") === fmt);
    });

    api("/settings", { method: "PUT", body: { timeFormat: fmt } }).catch(() => {});

    if (currentTab === "dashboard") loadDashboard();
    else if (currentTab === "tasks") loadTasks();
    else if (currentTab === "schedule") {
      if (scheduleSubTab === "weekly") loadSchedule();
      else loadOverrides();
    }

    toast(t("toast_settings_saved"));
  }

  function loadSettings() {
    document.querySelectorAll("#theme-segmented .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-theme-val") === currentTheme);
    });

    const labelEl = document.getElementById("current-theme-label");
    if (labelEl) {
      const labels = {
        light: t("theme_light"),
        dark: t("theme_dark"),
        system: t("theme_system") + ` (${currentLang === "en" ? "System" : "Otomatis"})`,
      };
      labelEl.textContent = labels[currentTheme] || currentTheme;
    }

    document.querySelectorAll("#accent-grid .accent-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-accent-val") === currentAccent);
    });

    document.querySelectorAll("#lang-segmented .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang-val") === currentLang);
    });

    document.querySelectorAll("#time-segmented .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-time-val") === currentTimeFormat);
    });
  }

  async function exportAppData() {
    try {
      const [tasks, schedules, overrides, notes] = await Promise.all([
        api("/tasks"),
        api("/schedule"),
        api("/schedule/overrides"),
        api("/quicknotes"),
      ]);

      const backup = {
        app: "Todolist Sekolah",
        version: "1.1.0",
        exported_at: new Date().toISOString(),
        data: { tasks, schedules, overrides, notes }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `todolist-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast(t("toast_data_exported"));
    } catch (err) {
      toast(`Export failed: ${err.message}`, "error");
    }
  }

  async function initSettingsFromServer() {
    try {
      const settings = await api("/settings");
      if (settings) {
        if (settings.theme && !localStorage.getItem("app_theme")) {
          setAppTheme(settings.theme);
        }
        if (settings.accent && !localStorage.getItem("app_accent")) {
          setAppAccent(settings.accent);
        }
        if (settings.lang && !localStorage.getItem("app_lang")) {
          currentLang = settings.lang;
          localStorage.setItem("app_lang", settings.lang);
          applyI18n();
        }
        if (settings.timeFormat && !localStorage.getItem("app_time_format")) {
          currentTimeFormat = settings.timeFormat;
          localStorage.setItem("app_time_format", settings.timeFormat);
        }
      }
    } catch (e) {}
  }

  // Expose to window for inline HTML onclick handlers
  window.setAppTheme = setAppTheme;
  window.setAppAccent = setAppAccent;
  window.setAppLanguage = setAppLanguage;
  window.setAppTimeFormat = setAppTimeFormat;
  window.exportAppData = exportAppData;

  // Apply current preferences
  document.documentElement.setAttribute("data-theme", currentTheme);
  document.documentElement.setAttribute("data-accent", currentAccent);
  applyI18n();
  initSettingsFromServer();

  // Initial load
  loadDashboard();
});
