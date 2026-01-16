import { requireAuth, logout } from "/js/auth.js";

requireAuth();
document.getElementById("logoutBtn").addEventListener("click", logout);

const STORAGE_KEY = "vs_research_v1";

const form = document.getElementById("researchForm");
const methodEl = document.getElementById("method");
const titleEl = document.getElementById("title");
const materialsEl = document.getElementById("materials");
const notesEl = document.getElementById("notes");

const errTitle = document.getElementById("errTitle");
const errMaterials = document.getElementById("errMaterials");
const errNotes = document.getElementById("errNotes");
const successMsg = document.getElementById("successMsg");

const listEl = document.getElementById("itemsList");
const emptyState = document.getElementById("emptyState");
const searchEl = document.getElementById("search");
const filterMethodEl = document.getElementById("filterMethod");
document.getElementById("clearBtn").addEventListener("click", () => {
    editingId = null;
    clearMsgs();
    form.reset();
    titleEl.focus();
});

function loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr : []; } catch { return []; }
}
function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function makeId() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}
function clearMsgs() {
    errTitle.textContent = "";
    errMaterials.textContent = "";
    errNotes.textContent = "";
    successMsg.textContent = "";
}

let items = loadAll();
let editingId = null;

form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMsgs();

    const method = methodEl.value;
    const title = titleEl.value.trim();
    const materials = materialsEl.value.trim();
    const notes = notesEl.value.trim();

    let ok = true;
    if (!title) { errTitle.textContent = "Title is required."; ok = false; }
    if (!materials) { errMaterials.textContent = "Materialen / opzet is required."; ok = false; }
    if (!notes) { errNotes.textContent = "Notes is required."; ok = false; }
    if (!ok) return;

    const now = new Date().toISOString();
    const payload = {
        id: editingId || makeId(),
        method, title, materials, notes,
        createdAt: editingId ? (items.find(x => x.id === editingId)?.createdAt || now) : now,
        updatedAt: now,
    };

    if (editingId) {
        const idx = items.findIndex(x => x.id === editingId);
        if (idx !== -1) items[idx] = payload;
        editingId = null;
        successMsg.textContent = "Research updated.";
    } else {
        items.push(payload);
        successMsg.textContent = "Research saved.";
    }

    saveAll(items);
    form.reset();
    titleEl.focus();
    render();
});

function methodLabel(v) {
    if (v === "crazy8s") return "Crazy 8s";
    if (v === "brainstorm") return "Brainstorm";
    if (v === "mindmap") return "Mindmap";
    return "HMW";
}

function getFiltered() {
    const q = (searchEl.value || "").trim().toLowerCase();
    const m = filterMethodEl.value;

    return items
        .filter(x => (m === "ALL" ? true : x.method === m))
        .filter(x => {
            if (!q) return true;
            return (x.title || "").toLowerCase().includes(q) ||
                (x.notes || "").toLowerCase().includes(q) ||
                (x.materials || "").toLowerCase().includes(q);
        })
        .sort((a,b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

function render() {
    const data = getFiltered();
    listEl.innerHTML = "";

    if (data.length === 0) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "block";
    emptyState.style.display = "none";

    for (const x of data) {
        const card = document.createElement("article");
        card.className = "item";

        card.innerHTML = `
      <div class="item__top">
        <div>
          <p class="item__title"></p>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="badge">${escapeHtml(methodLabel(x.method))}</span>
            <span class="badge">${escapeHtml(formatDate(x.updatedAt || x.createdAt))}</span>
          </div>
        </div>
      </div>

      <div class="meta"><strong>Materialen / Opzet</strong>\n${escapeHtml(x.materials)}</div>
      <div class="meta"><strong>Notes</strong>\n${escapeHtml(x.notes)}</div>

      <div class="actions2">
        <button class="smallbtn" data-action="edit" data-id="${escapeAttr(x.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${escapeAttr(x.id)}" type="button">Delete</button>
      </div>
    `;

        card.querySelector(".item__title").textContent = x.title;
        listEl.appendChild(card);
    }
}

listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "delete") {
        items = items.filter(x => x.id !== id);
        saveAll(items);
        clearMsgs();
        successMsg.textContent = "Research deleted.";
        editingId = null;
        render();
        return;
    }

    if (action === "edit") {
        const x = items.find(z => z.id === id);
        if (!x) return;
        editingId = id;

        methodEl.value = x.method;
        titleEl.value = x.title;
        materialsEl.value = x.materials;
        notesEl.value = x.notes;

        clearMsgs();
        successMsg.textContent = "Editing mode: pas aan en klik Save research.";
        titleEl.focus();
    }
});

searchEl.addEventListener("input", render);
filterMethodEl.addEventListener("change", render);

render();

function formatDate(iso) {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
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
