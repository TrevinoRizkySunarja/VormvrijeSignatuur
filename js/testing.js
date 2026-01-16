import { requireAuth, logout } from "/js/auth.js";

requireAuth();
document.getElementById("logoutBtn").addEventListener("click", logout);

const STORAGE_KEY = "vs_testing_v1";

const form = document.getElementById("testForm");
const prototypeEl = document.getElementById("prototype");
const testedAtEl = document.getElementById("testedAt");
const descEl = document.getElementById("desc");
const whatEl = document.getElementById("what");
const resultEl = document.getElementById("result");

const errPrototype = document.getElementById("errPrototype");
const errTestedAt = document.getElementById("errTestedAt");
const errDesc = document.getElementById("errDesc");
const errWhat = document.getElementById("errWhat");
const errResult = document.getElementById("errResult");
const successMsg = document.getElementById("successMsg");

const listEl = document.getElementById("itemsList");
const emptyState = document.getElementById("emptyState");
const searchEl = document.getElementById("search");

document.getElementById("clearBtn").addEventListener("click", () => {
    editingId = null;
    clearMsgs();
    form.reset();
    prototypeEl.focus();
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
    errPrototype.textContent = "";
    errTestedAt.textContent = "";
    errDesc.textContent = "";
    errWhat.textContent = "";
    errResult.textContent = "";
    successMsg.textContent = "";
}

let items = loadAll();
let editingId = null;

form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMsgs();

    const prototype = prototypeEl.value.trim();
    const testedAt = testedAtEl.value;
    const desc = descEl.value.trim();
    const what = whatEl.value.trim();
    const result = resultEl.value.trim();

    let ok = true;
    if (!prototype) { errPrototype.textContent = "Product / Prototype is required."; ok = false; }
    if (!testedAt) { errTestedAt.textContent = "Datum + tijd is required."; ok = false; }
    if (!desc) { errDesc.textContent = "Description is required."; ok = false; }
    if (!what) { errWhat.textContent = "Wat ga je testen is required."; ok = false; }
    if (!result) { errResult.textContent = "Resultaat is required."; ok = false; }
    if (!ok) return;

    const now = new Date().toISOString();
    const payload = {
        id: editingId || makeId(),
        prototype, testedAt, desc, what, result,
        createdAt: editingId ? (items.find(x => x.id === editingId)?.createdAt || now) : now,
        updatedAt: now,
    };

    if (editingId) {
        const idx = items.findIndex(x => x.id === editingId);
        if (idx !== -1) items[idx] = payload;
        editingId = null;
        successMsg.textContent = "Test updated.";
    } else {
        items.push(payload);
        successMsg.textContent = "Test saved.";
    }

    saveAll(items);
    form.reset();
    prototypeEl.focus();
    render();
});

function getFiltered() {
    const q = (searchEl.value || "").trim().toLowerCase();
    return items
        .filter(x => {
            if (!q) return true;
            return (x.prototype || "").toLowerCase().includes(q) ||
                (x.result || "").toLowerCase().includes(q) ||
                (x.what || "").toLowerCase().includes(q);
        })
        .sort((a,b) => (b.testedAt || "").localeCompare(a.testedAt || ""));
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
            <span class="badge">${escapeHtml(formatDT(x.testedAt))}</span>
          </div>
        </div>
      </div>

      <div class="meta"><strong>Description</strong>\n${escapeHtml(x.desc)}</div>
      <div class="meta"><strong>Wat ga je testen?</strong>\n${escapeHtml(x.what)}</div>
      <div class="meta"><strong>Resultaat</strong>\n${escapeHtml(x.result)}</div>

      <div class="actions2">
        <button class="smallbtn" data-action="edit" data-id="${escapeAttr(x.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${escapeAttr(x.id)}" type="button">Delete</button>
      </div>
    `;
        card.querySelector(".item__title").textContent = x.prototype;
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
        successMsg.textContent = "Test deleted.";
        editingId = null;
        render();
        return;
    }

    if (action === "edit") {
        const x = items.find(z => z.id === id);
        if (!x) return;
        editingId = id;

        prototypeEl.value = x.prototype;
        testedAtEl.value = x.testedAt;
        descEl.value = x.desc;
        whatEl.value = x.what;
        resultEl.value = x.result;

        clearMsgs();
        successMsg.textContent = "Editing mode: pas aan en klik Save test.";
        prototypeEl.focus();
    }
});

searchEl.addEventListener("input", render);
render();

function formatDT(v) {
    try { return new Date(v).toLocaleString(); } catch { return v; }
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
