(function () {
    const SUPABASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";

    const form = document.getElementById("registerForm");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");

    const registerError = document.getElementById("registerError");

    function showGlobalError(msg) {
        if (!registerError) return;
        registerError.textContent = msg || "Signup failed.";
        registerError.classList.remove("d-none");
    }

    function hideGlobalError() {
        if (!registerError) return;
        registerError.classList.add("d-none");
        registerError.textContent = "";
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return re.test(String(email).trim());
    }

    function hasLettersAndNumbers(str) {
        return /[A-Za-z]/.test(str) && /\d/.test(str);
    }

    function setInvalid(input, errorEl, message) {
        input.classList.add("is-invalid");
        if (message) errorEl.textContent = message;
    }

    function setValid(input) {
        input.classList.remove("is-invalid");
    }

    function validateName() {
        const v = fullNameInput.value.trim();
        if (!v) {
            setInvalid(fullNameInput, nameError, "Full name is required.");
            return false;
        }
        if (v.length < 3) {
            setInvalid(fullNameInput, nameError, "Full name must be at least 3 characters.");
            return false;
        }
        setValid(fullNameInput);
        return true;
    }

    function validateEmail() {
        const v = emailInput.value.trim();
        if (!v) {
            setInvalid(emailInput, emailError, "Email is required.");
            return false;
        }
        if (!isValidEmail(v)) {
            setInvalid(emailInput, emailError, "Please enter a valid email address.");
            return false;
        }
        setValid(emailInput);
        return true;
    }

    function validatePassword() {
        const v = passwordInput.value;
        if (!v) {
            setInvalid(passwordInput, passwordError, "Password is required.");
            return false;
        }
        if (v.length < 6) {
            setInvalid(passwordInput, passwordError, "Password must be at least 6 characters.");
            return false;
        }
        if (!hasLettersAndNumbers(v)) {
            setInvalid(passwordInput, passwordError, "Password must include letters and numbers.");
            return false;
        }
        setValid(passwordInput);
        return true;
    }

    function validateConfirm() {
        const p = passwordInput.value;
        const c = confirmInput.value;
        if (!c) {
            setInvalid(confirmInput, confirmError, "Please confirm your password.");
            return false;
        }
        if (p !== c) {
            setInvalid(confirmInput, confirmError, "Passwords must match.");
            return false;
        }
        setValid(confirmInput);
        return true;
    }

    fullNameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    passwordInput.addEventListener("input", () => {
        validatePassword();
        if (confirmInput.value) validateConfirm();
    });
    confirmInput.addEventListener("input", validateConfirm);

    async function supabaseSignUp({ name, email, password }) {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                email,
                password,
                data: { name },
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            const msg =
                data?.error_description ||
                data?.error ||
                data?.message ||
                "Signup failed.";
            throw new Error(msg);
        }

        return data;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        hideGlobalError();

        const ok =
            validateName() &&
            validateEmail() &&
            validatePassword() &&
            validateConfirm();

        if (!ok) return;

        const name = fullNameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        try {
            const result = await supabaseSignUp({ name, email, password });

            if (result?.session) {
                localStorage.setItem("zawq-token", JSON.stringify(result.session));
            }
            if (result?.user) {
                localStorage.setItem("zawq-user", JSON.stringify(result.user));
            }

            window.location.href = "/pages/index/index.html";

        } catch (err) {
            showGlobalError(err.message || "Signup failed.");
        }
    });
})();
