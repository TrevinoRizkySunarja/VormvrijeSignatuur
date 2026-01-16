document.addEventListener("DOMContentLoaded", () => {
    const HARDCODED_USER = {
        username: "Trev",
        password: "Guest123",
    };

    const form = document.getElementById("loginForm");
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");

    const errUser = document.getElementById("errUser");
    const errPass = document.getElementById("errPass");
    const successMsg = document.getElementById("successMsg");
    const createAccount = document.getElementById("createAccount");

    // Als dit null is, klopt je HTML id niet of script laadt niet
    if (!form || !usernameEl || !passwordEl) {
        console.error("Login DOM elements not found. Check IDs in index.html.");
        return;
    }

    function clearMessages() {
        if (errUser) errUser.textContent = "";
        if (errPass) errPass.textContent = "";
        if (successMsg) successMsg.textContent = "";
    }

    function setSession(username) {
        const payload = {
            username,
            loggedIn: true,
            loginAt: new Date().toISOString(),
        };
        localStorage.setItem("authUser", JSON.stringify(payload));
    }

    function getSession() {
        const raw = localStorage.getItem("authUser");
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    const existing = getSession();
    if (existing?.loggedIn && successMsg) {
        successMsg.textContent = `Already logged in as ${existing.username}.`;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearMessages();

        const username = usernameEl.value.trim();
        const password = passwordEl.value;

        let ok = true;

        if (!username) {
            if (errUser) errUser.textContent = "Username is required.";
            ok = false;
        }
        if (!password) {
            if (errPass) errPass.textContent = "Password is required.";
            ok = false;
        }
        if (!ok) return;

        const valid =
            username === HARDCODED_USER.username &&
            password === HARDCODED_USER.password;

        if (!valid) {
            if (errPass) errPass.textContent = "Invalid username or password.";
            return;
        }

        setSession(username);

        // Redirect naar intro (Vite root is /public)
        window.location.href = "/intro.html";
    });

    if (createAccount) {
        createAccount.addEventListener("click", (e) => {
            e.preventDefault();
            clearMessages();
            if (successMsg) successMsg.textContent = "Demo: account creation is not implemented.";
        });
    }
});
