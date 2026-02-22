(function () {
    const welcomeMeta = document.getElementById("welcomeMeta");
    const notLoggedIn = document.getElementById("notLoggedIn");
    const profileForm = document.getElementById("profileForm");

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");

    const logoutBtn = document.getElementById("logoutBtn");
    const saveToast = document.getElementById("saveToast");

    const prefEmails = document.getElementById("prefEmails");
    const prefOffers = document.getElementById("prefOffers");
    const savePrefsBtn = document.getElementById("savePrefsBtn");
    const prefsToast = document.getElementById("prefsToast");

    function getSupabaseUserSafe() {
        if (typeof getSupabaseUser === "function") return getSupabaseUser();

        const rawUser = localStorage.getItem("zawq-user");
        if (rawUser) {
            try { return JSON.parse(rawUser); } catch { }
        }
        const rawSession = localStorage.getItem("zawq-token");
        if (rawSession) {
            try {
                const s = JSON.parse(rawSession);
                return s?.user || null;
            } catch { }
        }
        return null;
    }

    function prefsKey(userId) {
        return userId ? `prefs_${userId}` : "prefs_guest";
    }

    function getLS(key, fallback) {
        try {
            const v = JSON.parse(localStorage.getItem(key));
            return v ?? fallback;
        } catch {
            return fallback;
        }
    }

    function setLS(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function showToast(el) {
        if (!el) return;
        el.classList.remove("d-none");
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.add("d-none"), 1800);
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return re.test(String(email).trim());
    }

    function setInvalid(input, errorEl, message) {
        input.classList.add("is-invalid");
        if (message && errorEl) errorEl.textContent = message;
    }

    function setValid(input) {
        input.classList.remove("is-invalid");
    }

    function validateName() {
        const v = fullNameInput.value.trim();
        if (!v || v.length < 3) {
            setInvalid(fullNameInput, nameError, "Name is required (min 3 chars).");
            return false;
        }
        setValid(fullNameInput);
        return true;
    }

    function validateEmail() {
        const v = emailInput.value.trim();
        if (!v || !isValidEmail(v)) {
            setInvalid(emailInput, emailError, "Email is invalid.");
            return false;
        }
        setValid(emailInput);
        return true;
    }

    function loadProfile() {
        const user = getSupabaseUserSafe();

        if (!user) {
            welcomeMeta.textContent = "Not signed in";
            notLoggedIn.classList.remove("d-none");
            profileForm.classList.add("d-none");
            return;
        }

        notLoggedIn.classList.add("d-none");
        profileForm.classList.remove("d-none");

        const name =
            user?.user_metadata?.name ||
            user?.user_metadata?.fullName ||
            user?.user_metadata?.display_name ||
            "";

        const email = user?.email || "";

        welcomeMeta.textContent = `Signed in as ${email || "user"}`;

        fullNameInput.value = name;
        emailInput.value = email;
        emailInput.readOnly = true;

        const prefs = getLS(prefsKey(user.id), { emails: false, offers: false });
        prefEmails.checked = !!prefs.emails;
        prefOffers.checked = !!prefs.offers;
    }

    function savePreferences() {
        const user = getSupabaseUserSafe();
        if (!user) return;

        const prefs = {
            emails: prefEmails.checked,
            offers: prefOffers.checked,
        };

        setLS(prefsKey(user.id), prefs);
        showToast(prefsToast);
    }

    async function saveProfileChanges() {
        const user = getSupabaseUserSafe();
        if (!user) return;

        const ok = validateName() && validateEmail();
        if (!ok) return;

        const newName = fullNameInput.value.trim();

        try {
            const userRaw = localStorage.getItem("zawq-user");
            if (userRaw) {
                const u = JSON.parse(userRaw);
                u.user_metadata = u.user_metadata || {};
                u.user_metadata.name = newName;
                localStorage.setItem("zawq-user", JSON.stringify(u));
            }

            const sessionRaw = localStorage.getItem("zawq-token");
            if (sessionRaw) {
                const s = JSON.parse(sessionRaw);
                if (s?.user) {
                    s.user.user_metadata = s.user.user_metadata || {};
                    s.user.user_metadata.name = newName;
                    localStorage.setItem("zawq-token", JSON.stringify(s));
                }
            }
        } catch { }

        try {
            const token = (typeof getAccessToken === "function") ? getAccessToken() : null;
            if (token) {
                await fetch("https://ajuxbtifwipqmwmsrqcg.supabase.co/auth/v1/user", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        apikey: API_KEY,
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ data: { name: newName } }),
                });
            }
        } catch { }

        if (typeof renderNavAuth === "function") renderNavAuth();

        showToast(saveToast);
    }

    if (profileForm) {
        fullNameInput.addEventListener("input", validateName);
        emailInput.addEventListener("input", validateEmail);

        profileForm.addEventListener("submit", function (e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }

    if (logoutBtn) logoutBtn.addEventListener("click", () => {
        if (typeof logout === "function") return logout();

        localStorage.removeItem("zawq-token");
        localStorage.removeItem("zawq-user");
        window.location.href = "../index/index.html";
    });

    if (savePrefsBtn) savePrefsBtn.addEventListener("click", savePreferences);

    document.addEventListener("DOMContentLoaded", async () => {
        if (typeof updateBagCount === "function") await updateBagCount();

        loadProfile();
    });
})();
