(() => {
    const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
    const SUPABASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";

    async function loadComponent(id, file) {
        try {
            const res = await fetch(file);
            const html = await res.text();
            document.getElementById(id).innerHTML = html;
        } catch (err) {
            console.error("Component load error:", err);
        }
    }

    document.addEventListener("DOMContentLoaded", async () => {
        await loadComponent("navbar", "/components/navbar.html");
        await loadComponent("footer", "/components/footer.html");

        renderNavAuth();
        await updateBagCount();
    });

    function getSupabaseUser() {
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

    function renderNavAuth() {
        const slot = document.getElementById("navUserSlot");
        if (!slot) return;

        const user = getSupabaseUser();

        if (!user) {
            slot.innerHTML = `
      <a href="../Login/login.html"
         class="nav-auth-btn"
         aria-label="Sign in">
        <i class="bi bi-person-circle"></i>
        <span class="nav-auth-text">Sign in</span>
      </a>
    `;
            return;
        }

        slot.innerHTML = `
    <div class="dropdown">
      <button class="nav-auth-btn dropdown-toggle"
              type="button"
              id="navProfileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false">
        <i class="bi bi-person-circle"></i>
        <span class="nav-auth-text">Profile</span>
      </button>

      <ul class="dropdown-menu dropdown-menu-end z-auth-menu"
          aria-labelledby="navProfileDropdown">
        <li>
          <a class="dropdown-item" href="../Profile/profile.html">
            <i class="bi bi-person me-2"></i> Profile
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="../orders/index.html">
            <i class="bi bi-bag-check me-2"></i> My Orders
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <button class="dropdown-item z-auth-logout" type="button" id="navLogoutBtn">
            <i class="bi bi-box-arrow-right me-2"></i> Sign out
          </button>
        </li>
      </ul>
    </div>
  `;

        document.getElementById("navLogoutBtn")?.addEventListener("click", logout);
    }

    function logout() {
        localStorage.removeItem("zawq-token");
        localStorage.removeItem("zawq-user");

        window.location.href = "/pages/index/index.html";
    }

    function cartKey() {
        const u = getSupabaseUser();
        return u?.id ? `cart_${u.id}` : "cart_guest";
    }

    function getCart() {
        return JSON.parse(localStorage.getItem(cartKey())) || [];
    }

    function getAccessToken() {
        try {
            const session = JSON.parse(localStorage.getItem("zawq-token"));
            return session?.access_token || null;
        } catch {
            return null;
        }
    }

    async function updateBagCount() {
        const el = document.getElementById("nav-bag-count");
        if (!el) return;

        const token = getAccessToken();
        if (!token) {
            el.textContent = "";
            return;
        }

        try {
            const res = await fetch(`${SUPABASE_URL}/cart_items?select=quantity`, {
                headers: {
                    apikey: API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                el.textContent = "";
                return;
            }

            const items = await res.json();
            const total = Array.isArray(items)
                ? items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
                : 0;

            el.textContent = total > 0 ? ` (${total})` : "";
        } catch {
            el.textContent = "";
        }
    }

    window.getSupabaseUser = getSupabaseUser;
    window.getAccessToken = getAccessToken;
    window.renderNavAuth = renderNavAuth;
    window.updateBagCount = updateBagCount;
})();
