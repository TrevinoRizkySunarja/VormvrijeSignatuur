import { requireAuth, logout } from "./auth.js";

requireAuth();

const STORAGE_KEY = "vs_notes_v1";

const form = document.getElementById("noteForm");
const titleEl = document.getElementById("title");
const statusEl = document.getElementById("status");
const contentEl = document.getElementById("content");

const errTitle = document.getElementById("errTitle");
const errContent = document.getElementById("errContent");
const successMsg = document.getElementById("successMsg");

const listEl = document.getElementById("notesList");
const emptyState = document.getElementById("emptyState");

const searchEl = document.getElementById("search");
const filterStatusEl = document.getElementById("filterStatus");

document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("clearFormBtn").addEventListener("click", () => {
    clearMessages();
    form.reset();
    titleEl.focus();
});

function clearMessages() {
    errTitle.textContent = "";
    errContent.textContent = "";
    successMsg.textContent = "";
}

function loadNotes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function makeId() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return iso;
    }
}

function badgeClass(status) {
    if (status === "Done") return "badge badge--done";
    if (status === "In progress") return "badge badge--progress";
    return "badge badge--open";
}

let notes = loadNotes();

function getFilteredNotes() {
    const q = (searchEl.value || "").trim().toLowerCase();
    const status = filterStatusEl.value;

    return notes
        .filter(n => status === "ALL" ? true : n.status === status)
        .filter(n => {
            if (!q) return true;
            return (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q);
        })
        .sort((a,b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

function render() {
    const items = getFilteredNotes();
    listEl.innerHTML = "";

    if (items.length === 0) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    for (const n of items) {
        const card = document.createElement("article");
        card.className = "note";

        card.innerHTML = `
      <div class="note__top">
        <div>
          <p class="note__title"></p>
          <div class="note__meta">
            <span class="${badgeClass(n.status)}">${escapeHtml(n.status)}</span>
            <span class="note__date">${escapeHtml(formatDate(n.updatedAt || n.createdAt))}</span>
          </div>
        </div>
      </div>

      <p class="note__content"></p>

      <div class="note__actions">
        <button class="smallbtn" data-action="edit" data-id="${escapeAttr(n.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${escapeAttr(n.id)}" type="button">Delete</button>
      </div>
    `;

        card.querySelector(".note__title").textContent = n.title;
        card.querySelector(".note__content").textContent = n.content;

        listEl.appendChild(card);
    }
}

function upsertNote(payload) {
    const idx = notes.findIndex(n => n.id === payload.id);
    if (idx === -1) {
        notes.push(payload);
    } else {
        notes[idx] = payload;
    }
    saveNotes(notes);
    render();
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotes(notes);
    render();
}

let editingId = null;

form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMessages();

    const title = titleEl.value.trim();
    const status = statusEl.value;
    const content = contentEl.value.trim();

    let ok = true;
    if (!title) { errTitle.textContent = "Title is required."; ok = false; }
    if (!content) { errContent.textContent = "Document is required."; ok = false; }
    if (!ok) return;

    const now = new Date().toISOString();

    if (editingId) {
        const existing = notes.find(n => n.id === editingId);
        const updated = {
            id: editingId,
            title,
            status,
            content,
            createdAt: existing?.createdAt || now,
            updatedAt: now
        };
        upsertNote(updated);
        editingId = null;
        successMsg.textContent = "Note updated.";
    } else {
        const created = {
            id: makeId(),
            title,
            status,
            content,
            createdAt: now,
            updatedAt: now
        };
        upsertNote(created);
        successMsg.textContent = "Note saved.";
    }

    form.reset();
    titleEl.focus();
});

listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "delete") {
        deleteNote(id);
        clearMessages();
        successMsg.textContent = "Note deleted.";
        return;
    }

    if (action === "edit") {
        const n = notes.find(x => x.id === id);
        if (!n) return;
        editingId = id;

        titleEl.value = n.title;
        statusEl.value = n.status;
        contentEl.value = n.content;

        clearMessages();
        successMsg.textContent = "Editing mode: update and press Save note.";
        titleEl.focus();
    }
});

searchEl.addEventListener("input", render);
filterStatusEl.addEventListener("change", render);

render();

/* --- small escaping helpers --- */
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
