function getSession() {
    const raw = localStorage.getItem("authUser");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

const session = getSession();
if (!session?.loggedIn) {
    window.location.href = "/index.html";
}

const modal1 = document.getElementById("modal1");
const modal2 = document.getElementById("modal2");

document.getElementById("next1").addEventListener("click", () => {
    modal1.classList.remove("is-open");
    modal1.setAttribute("aria-hidden", "true");

    modal2.classList.add("is-open");
    modal2.setAttribute("aria-hidden", "false");
});

document.getElementById("finishIntro").addEventListener("click", () => {
    window.location.href = "./hub.html";
});
