import { requireAuth, logout } from "./auth.js";

requireAuth();

const btn = document.getElementById("logoutBtn");
if (btn) btn.addEventListener("click", logout);
