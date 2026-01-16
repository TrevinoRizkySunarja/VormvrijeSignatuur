import { requireAuth, logout } from "./auth.js";

const session = requireAuth();

const welcomeText = document.getElementById("welcomeText");
welcomeText.textContent = `Ingelogd als: ${session.username}`;

document.getElementById("logoutBtn").addEventListener("click", logout);
