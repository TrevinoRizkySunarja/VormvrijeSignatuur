import { requireAuth, logout } from "./auth.js";

requireAuth();
document.getElementById("logoutBtn").addEventListener("click", logout);

const STORAGE_KEY = "vs_feedback_v1";

const form = document.getElementById("fbForm");
const titleEl = document.getElementById("title");
const feedbackEl = document.getElementById("feedback");
const futureEl = document.getElementById("future");

const errTitle = document.getElementById("errTitle");
const errFeedback = document.getElementById("errFeedback");
const errFuture = document.getElementById("errFuture");
const successMsg = document.getElementById("successMsg");

const listEl = document.getElementById("itemsList");
const emptyState = document.getElementById("emptyState");
const searchEl = document.getElementById("search");

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
    errFeedback.textContent = "";
    errFuture.textContent = "";
    successMsg.textContent = "";
}

let items = loadAll();
let editingId = null;

form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMsgs();

    const title = titleEl.value.trim();
    const feedback = feedbackEl.value.trim();
    const future = futureEl.value.trim();

    let ok = true;
    if (!title) { errTitle.textContent = "Title is required."; ok = false; }
    if (!feedback) { errFeedback.textContent = "Feedback is required."; ok = false; }
    if (!future) { errFuture.textContent = "Toekomstige verbetering is required."; ok = false; }
    if (!ok) return;

    const now = new Date().toISOString();
    const payload = {
        id: editingId || makeId(),
        title, feedback, future,
        createdAt: editingId ? (items.find(x => x.id === editingId)?.createdAt || now) : now,
        updatedAt: now,
    };

    if (editingId) {
        const idx = items.findIndex(x => x.id === editingId);
        if (idx !== -1) items[idx] = payload;
        editingId = null;
        successMsg.textContent = "Feedback updated.";
    } else {
        items.push(payload);
        successMsg.textContent = "Feedback saved.";
    }

    saveAll(items);
    form.reset();
    titleEl.focus();
    render();
});

function getFiltered() {
    const q = (searchEl.value || "").trim().toLowerCase();
    return items
        .filter(x => {
            if (!q) return true;
            return (x.title || "").toLowerCase().includes(q) ||
                (x.feedback || "").toLowerCase().includes(q) ||
                (x.future || "").toLowerCase().includes(q);
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
    emptyState.style.display = "none";

    for (const x of data) {
        const card = document.createElement("article");
        card.className = "item";
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:flex-start;">
        <div>
          <p class="item__title"></p>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="badge">${escapeHtml(formatDate(x.updatedAt || x.createdAt))}</span>
          </div>
        </div>
      </div>

      <div class="meta"><strong>Feedback</strong>\n${escapeHtml(x.feedback)}</div>
      <div class="meta"><strong>Actie / Toekomst</strong>\n${escapeHtml(x.future)}</div>

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
        successMsg.textContent = "Feedback deleted.";
        editingId = null;
        render();
        return;
    }

    if (action === "edit") {
        const x = items.find(z => z.id === id);
        if (!x) return;
        editingId = id;

        titleEl.value = x.title;
        feedbackEl.value = x.feedback;
        futureEl.value = x.future;

        clearMsgs();
        successMsg.textContent = "Editing mode: pas aan en klik Save feedback.";
        titleEl.focus();
    }
});

searchEl.addEventListener("input", render);
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
