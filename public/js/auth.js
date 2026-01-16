export function getSession() {
    const raw = localStorage.getItem("authUser");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export function requireAuth() {
    const session = getSession();
    if (!session?.loggedIn) {
        window.location.href = "../index.html";
    }
    return session;
}

export function logout() {
    localStorage.removeItem("authUser");
    window.location.href = "../index.html";
}
