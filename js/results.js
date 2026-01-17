import { requireAuth, logout } from "./auth.js";

requireAuth();
document.getElementById("logoutBtn").addEventListener("click", logout);

const STORAGE_KEY = "vs_results_v1";

/* form */
const form = document.getElementById("resultForm");
const titleEl = document.getElementById("title");
const descEl = document.getElementById("desc");
const resultEl = document.getElementById("result");
const learnedEl = document.getElementById("learned");

const errTitle = document.getElementById("errTitle");
const errDesc = document.getElementById("errDesc");
const errResult = document.getElementById("errResult");
const errLearned = document.getElementById("errLearned");
const successMsg = document.getElementById("successMsg");
document.getElementById("clearBtn").addEventListener("click", () => {
    editingId = null;
    clearMessages();
    form.reset();
    titleEl.focus();
});

/* list */
const listEl = document.getElementById("resultsList");
const emptyState = document.getElementById("emptyState");
const searchEl = document.getElementById("search");

let editingId = null;
let items = loadAll();

form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMessages();

    const title = titleEl.value.trim();
    const desc = descEl.value.trim();
    const result = resultEl.value.trim();
    const learned = learnedEl.value.trim();

    let ok = true;
    if (!title) { errTitle.textContent = "Title is required."; ok = false; }
    if (!desc) { errDesc.textContent = "Beschrijving is required."; ok = false; }
    if (!result) { errResult.textContent = "Resultaat is required."; ok = false; }
    if (!learned) { errLearned.textContent = "Wat heb je eruit gehaald? is required."; ok = false; }
    if (!ok) return;

    const now = new Date().toISOString();

    const payload = {
        id: editingId || makeId(),
        title,
        desc,
        result,
        learned,
        createdAt: editingId ? (items.find(x => x.id === editingId)?.createdAt || now) : now,
        updatedAt: now
    };

    if (editingId) {
        const idx = items.findIndex(x => x.id === editingId);
        if (idx !== -1) items[idx] = payload;
        editingId = null;
        successMsg.textContent = "Result updated.";
    } else {
        items.push(payload);
        successMsg.textContent = "Result saved.";
    }

    saveAll(items);
    form.reset();
    titleEl.focus();
    render();
});

listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "delete") {
        items = items.filter(x => x.id !== id);
        saveAll(items);
        editingId = null;
        clearMessages();
        successMsg.textContent = "Result deleted.";
        render();
        return;
    }

    if (action === "edit") {
        const x = items.find(i => i.id === id);
        if (!x) return;
        editingId = id;

        titleEl.value = x.title;
        descEl.value = x.desc;
        resultEl.value = x.result;
        learnedEl.value = x.learned;

        clearMessages();
        successMsg.textContent = "Editing mode: pas aan en klik Save result.";
        titleEl.focus();
    }
});

searchEl.addEventListener("input", render);

render();

/* --- helpers --- */
function clearMessages() {
    errTitle.textContent = "";
    errDesc.textContent = "";
    errResult.textContent = "";
    errLearned.textContent = "";
    successMsg.textContent = "";
}

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
function saveAll(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function makeId() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

function formatDate(iso) {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function getFiltered() {
    const q = (searchEl.value || "").trim().toLowerCase();
    return items
        .filter(x => {
            if (!q) return true;
            return (
                (x.title || "").toLowerCase().includes(q) ||
                (x.desc || "").toLowerCase().includes(q) ||
                (x.result || "").toLowerCase().includes(q) ||
                (x.learned || "").toLowerCase().includes(q)
            );
        })
        .sort((a,b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

function render() {
    const filtered = getFiltered();
    listEl.innerHTML = "";

    if (!filtered.length) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    for (const x of filtered) {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
      <div class="card__top">
        <p class="card__title"></p>
        <div class="card__date">${escapeHtml(formatDate(x.updatedAt || x.createdAt))}</div>
      </div>

      <div class="card__block">
        <div class="card__label">Beschrijving</div>
        <p class="card__text"></p>
      </div>

      <div class="card__block">
        <div class="card__label">Resultaat</div>
        <p class="card__text" data-k="result"></p>
      </div>

      <div class="card__block">
        <div class="card__label">Wat heb ik eruit gehaald?</div>
        <p class="card__text" data-k="learned"></p>
      </div>

      <div class="card__actions">
        <button class="smallbtn" data-action="edit" data-id="${escapeAttr(x.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${escapeAttr(x.id)}" type="button">Delete</button>
      </div>
    `;

        card.querySelector(".card__title").textContent = x.title;
        card.querySelectorAll(".card__text")[0].textContent = x.desc;
        card.querySelector('[data-k="result"]').textContent = x.result;
        card.querySelector('[data-k="learned"]').textContent = x.learned;

        listEl.appendChild(card);
    }
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
