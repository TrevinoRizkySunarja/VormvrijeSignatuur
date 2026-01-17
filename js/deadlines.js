import { requireAuth, logout } from "./auth.js";

requireAuth();
document.getElementById("logoutBtn").addEventListener("click", logout);

const STORAGE_KEY = "vs_deadlines_v1";

/* Form elements */
const form = document.getElementById("deadlineForm");
const titleEl = document.getElementById("title");
const descEl = document.getElementById("desc");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const priorityEl = document.getElementById("priority");
const statusEl = document.getElementById("status");
const successMsg = document.getElementById("successMsg");

const errTitle = document.getElementById("errTitle");
const errDesc = document.getElementById("errDesc");
const errDate = document.getElementById("errDate");

document.getElementById("clearBtn").addEventListener("click", () => {
    editingId = null;
    successMsg.textContent = "";
    clearErrors();
    form.reset();
    if (!dateEl.value) dateEl.value = toISODate(selectedDate);
    timeEl.value = timeEl.value || "10:00";
    titleEl.focus();
});

/* Filters */
const filterPriorityEl = document.getElementById("filterPriority");
const filterStatusEl = document.getElementById("filterStatus");

/* Calendar elements */
const monthTitleEl = document.getElementById("monthTitle");
const gridEl = document.getElementById("calGrid");
document.getElementById("prevMonth").addEventListener("click", () => shiftMonth(-1));
document.getElementById("nextMonth").addEventListener("click", () => shiftMonth(1));

/* Day view elements */
const selectedDateText = document.getElementById("selectedDateText");
const timelineEl = document.getElementById("timeline");
const dayListEl = document.getElementById("dayList");
const emptyDayEl = document.getElementById("emptyDay");
const dayCountEl = document.getElementById("dayCount");

let editingId = null;

function loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}
function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function makeId() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

let deadlines = loadAll();

/* Selected date + month state */
let selectedDate = new Date();
selectedDate.setHours(0,0,0,0);

let viewMonth = new Date(selectedDate);
viewMonth.setDate(1);

dateEl.value = toISODate(selectedDate);

/* Form submit */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    successMsg.textContent = "";
    clearErrors();

    const title = titleEl.value.trim();
    const desc = descEl.value.trim();
    const date = dateEl.value;         // YYYY-MM-DD
    const time = timeEl.value || "10:00"; // HH:MM
    const priority = priorityEl.value; // low/neutral/high/urgent
    const status = statusEl.value;     // open/in_progress/done

    let ok = true;
    if (!title) { errTitle.textContent = "Title is required."; ok = false; }
    if (!desc) { errDesc.textContent = "Beschrijving is required."; ok = false; }
    if (!date) { errDate.textContent = "Datum is required."; ok = false; }
    if (!ok) return;

    const now = new Date().toISOString();
    const payload = {
        id: editingId || makeId(),
        title,
        desc,
        date,
        time,
        priority,
        status,
        createdAt: editingId ? (deadlines.find(d => d.id === editingId)?.createdAt || now) : now,
        updatedAt: now,
    };

    if (editingId) {
        const idx = deadlines.findIndex(d => d.id === editingId);
        if (idx !== -1) deadlines[idx] = payload;
        editingId = null;
        successMsg.textContent = "Deadline updated.";
    } else {
        deadlines.push(payload);
        successMsg.textContent = "Deadline saved.";
    }

    saveAll(deadlines);

    // set selected day to the saved date
    selectedDate = fromISODate(date);
    viewMonth = new Date(selectedDate); viewMonth.setDate(1);
    dateEl.value = date;

    form.reset();
    dateEl.value = date;
    timeEl.value = time;
    priorityEl.value = priority;
    statusEl.value = status;

    renderAll();
});

/* Filters */
filterPriorityEl.addEventListener("change", renderAll);
filterStatusEl.addEventListener("change", renderAll);

/* Calendar rendering */
function shiftMonth(delta) {
    viewMonth.setMonth(viewMonth.getMonth() + delta);
    renderCalendar();
}

function renderCalendar() {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();

    monthTitleEl.textContent = `${monthName(m)} ${y}`;

    gridEl.innerHTML = "";

    const start = new Date(y, m, 1);
    const startDow = (start.getDay() + 6) % 7; // Monday=0
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startDow);

    // 6 weeks * 7 days
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);

        const iso = toISODate(d);
        const inMonth = d.getMonth() === m;

        const cell = document.createElement("div");
        cell.className = "daycell" + (inMonth ? "" : " daycell--muted") + (sameDay(d, selectedDate) ? " daycell--selected" : "");
        cell.dataset.iso = iso;

        const dots = getDotsForDate(iso);

        cell.innerHTML = `
      <div class="daynum">${d.getDate()}</div>
      <div class="dotrow">${dots}</div>
    `;

        cell.addEventListener("click", () => {
            selectedDate = fromISODate(iso);
            dateEl.value = iso;
            renderAll();
        });

        gridEl.appendChild(cell);
    }
}

function getDotsForDate(iso) {
    const items = getFiltered().filter(d => d.date === iso);
    const hasUrgent = items.some(x => x.priority === "urgent");
    const hasHigh = items.some(x => x.priority === "high");
    const hasNeutral = items.some(x => x.priority === "neutral");
    const hasLow = items.some(x => x.priority === "low");

    let out = "";
    if (hasUrgent) out += `<span class="dot dot--urgent"></span>`;
    if (hasHigh) out += `<span class="dot dot--high"></span>`;
    if (hasNeutral) out += `<span class="dot dot--neutral"></span>`;
    if (hasLow) out += `<span class="dot dot--low"></span>`;
    return out;
}

/* Day timeline + list */
function renderDay() {
    selectedDateText.textContent = `${dayName(selectedDate)} ${selectedDate.getDate()} ${monthName(selectedDate.getMonth())} ${selectedDate.getFullYear()}`;

    const iso = toISODate(selectedDate);
    const dayItems = getFiltered()
        .filter(d => d.date === iso)
        .sort((a,b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

    dayCountEl.textContent = String(dayItems.length);

    // list
    dayListEl.innerHTML = "";
    emptyDayEl.style.display = dayItems.length ? "none" : "block";

    for (const d of dayItems) {
        const card = document.createElement("article");
        card.className = "card";

        card.innerHTML = `
      <div class="card__top">
        <div>
          <p class="card__title"></p>
          <div class="card__meta">
            <span class="badge ${priorityBadge(d.priority)}">${labelPriority(d.priority)}</span>
            <span class="badge ${statusBadge(d.status)}">${labelStatus(d.status)}</span>
            <span class="badge">${escapeHtml(d.time || "")}</span>
          </div>
        </div>
      </div>
      <p class="card__desc"></p>

      <div class="card__actions">
        <button class="smallbtn" data-action="edit" data-id="${escapeAttr(d.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${escapeAttr(d.id)}" type="button">Delete</button>
      </div>
    `;

        card.querySelector(".card__title").textContent = d.title;
        card.querySelector(".card__desc").textContent = d.desc;

        dayListEl.appendChild(card);
    }

    // actions
    dayListEl.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;

            if (action === "delete") {
                deadlines = deadlines.filter(x => x.id !== id);
                saveAll(deadlines);
                successMsg.textContent = "Deadline deleted.";
                editingId = null;
                renderAll();
                return;
            }

            if (action === "edit") {
                const item = deadlines.find(x => x.id === id);
                if (!item) return;
                editingId = id;

                titleEl.value = item.title;
                descEl.value = item.desc;
                dateEl.value = item.date;
                timeEl.value = item.time || "10:00";
                priorityEl.value = item.priority;
                statusEl.value = item.status;

                selectedDate = fromISODate(item.date);
                viewMonth = new Date(selectedDate); viewMonth.setDate(1);

                successMsg.textContent = "Editing mode: pas aan en klik Save deadline.";
                renderAll();
            }
        });
    });

    // timeline 08:00 -> 20:00
    timelineEl.innerHTML = "";
    const slotTimes = [];
    for (let h = 8; h <= 20; h++) {
        slotTimes.push(`${String(h).padStart(2,"0")}:00`);
    }

    const mapByTime = new Map();
    for (const d of dayItems) {
        if (!mapByTime.has(d.time)) mapByTime.set(d.time, []);
        mapByTime.get(d.time).push(d);
    }

    for (const t of slotTimes) {
        const items = mapByTime.get(t) || [];
        const pill = items.length
            ? `<span class="slot__pill ${slotPill(items[0].priority)}">${items.length} item(s)</span>`
            : `<span class="slot__pill">—</span>`;

        const row = document.createElement("div");
        row.className = "slot";
        row.innerHTML = `
      <div class="slot__time">${t}</div>
      ${pill}
    `;

        // quick create: click empty slot -> set form time + date
        row.addEventListener("click", () => {
            dateEl.value = iso;
            timeEl.value = t;
            titleEl.focus();
        });

        timelineEl.appendChild(row);
    }
}

/* Filtering */
function getFiltered() {
    const p = filterPriorityEl.value;
    const s = filterStatusEl.value;
    return deadlines
        .filter(d => (p === "ALL" ? true : d.priority === p))
        .filter(d => (s === "ALL" ? true : d.status === s));
}

/* Render all */
function renderAll() {
    renderCalendar();
    renderDay();
}
renderAll();

/* Helpers */
function clearErrors() {
    errTitle.textContent = "";
    errDesc.textContent = "";
    errDate.textContent = "";
}

function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
}
function fromISODate(iso) {
    const [y,m,d] = iso.split("-").map(Number);
    const dt = new Date(y, (m-1), d);
    dt.setHours(0,0,0,0);
    return dt;
}
function sameDay(a,b){
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function monthName(m){
    const names = ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
    return names[m] || "";
}
function dayName(d){
    const names = ["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"];
    return names[d.getDay()] || "";
}

function labelPriority(p){
    if (p==="urgent") return "Urgent";
    if (p==="high") return "High";
    if (p==="neutral") return "Neutral";
    return "Low";
}
function priorityBadge(p){
    if (p==="urgent") return "badge--urgent";
    if (p==="high") return "badge--high";
    if (p==="neutral") return "badge--neutral";
    return "badge--low";
}
function slotPill(p){
    if (p==="urgent") return "slot__pill--urgent";
    if (p==="high") return "slot__pill--high";
    if (p==="neutral") return "slot__pill--neutral";
    return "slot__pill--low";
}

function labelStatus(s){
    if (s==="done") return "Done";
    if (s==="in_progress") return "In progress";
    return "Open";
}
function statusBadge(s){
    if (s==="done") return "badge--done";
    if (s==="in_progress") return "badge--prog";
    return "badge--open";
}

/* escaping helpers */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function escapeAttr(str) {
    return escapeHtml(str).replaceAll("`", "&#096;");
}
