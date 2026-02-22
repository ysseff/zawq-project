const SUPABASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

async function supabaseLogin(email, password) {
    const res = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ email, password }),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error("Email or password is invalid.");
    }

    return data;
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    loginError.classList.add("d-none");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        loginError.textContent = "Email or password is invalid.";
        loginError.classList.remove("d-none");
        return;
    }

    try {
        const session = await supabaseLogin(email, password);

        localStorage.setItem("zawq-token", JSON.stringify(session));
        localStorage.setItem("zawq-user", JSON.stringify(session.user));

        window.location.href = "/pages/index/index.html";
    } catch (err) {
        loginError.textContent = "Email or password is invalid.";
        loginError.classList.remove("d-none");
    }
});
