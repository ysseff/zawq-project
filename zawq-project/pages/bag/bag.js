const SUPABASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co";
const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
const BASE_URL = `${SUPABASE_URL}/rest/v1`;

function getAccessToken() {
    try {
        const session = JSON.parse(localStorage.getItem("zawq-token"));
        return session?.access_token || null;
    } catch {
        return null;
    }
}

function authHeaders(token) {
    return {
        apikey: API_KEY,
        Authorization: `Bearer ${token}`,
    };
}

function authJsonHeaders(token) {
    return {
        ...authHeaders(token),
        "Content-Type": "application/json",
    };
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = data?.message || data?.error_description || data?.error || "Request failed";
        throw new Error(msg);
    }
    return data;
}

async function loadBag() {
    const token = getAccessToken();
    if (!token) {
        window.location.href = "../Login/login.html";
        return;
    }

    const headers = authHeaders(token);

    const items = await fetchJson(
        `${BASE_URL}/cart_items?select=id,product_id,quantity,size&order=created_at.desc`,
        { headers }
    );

    const list = document.getElementById("bag-items-list");
    const countEl = document.getElementById("items-count");
    const subtotalEl = document.getElementById("order-subtotal");
    const checkoutBtn = document.querySelector(".order-summary-checkout-btn");

    if (!items || items.length === 0) {
        list.innerHTML = `<p class="text-muted">Your bag is empty.</p>`;
        countEl.textContent = "0 ITEMS";
        subtotalEl.textContent = "0$";
        if (checkoutBtn) checkoutBtn.disabled = true;

        if (typeof updateBagCount === "function") await updateBagCount();
        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    const productIds = [...new Set(items.map((i) => i.product_id))];
    const inList = productIds.join(",");
    const productsArr = await fetchJson(
        `${BASE_URL}/products?select=id,title,price,image_url&id=in.(${inList})`,
        { headers }
    );

    const products = Object.fromEntries(productsArr.map((p) => [p.id, p]));

    const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const subtotal = items.reduce((sum, item) => {
        const p = products[item.product_id];
        const price = Number(p?.price) || 0;
        return sum + price * (Number(item.quantity) || 0);
    }, 0);

    countEl.textContent = `${totalItems} ${totalItems === 1 ? "ITEM" : "ITEMS"}`;
    subtotalEl.textContent = `${subtotal}$`;

    if (typeof updateBagCount === "function") await updateBagCount();

    list.innerHTML = "";

    for (const item of items) {
        const { product_id, quantity, size } = item;
        const product = products[product_id];

        if (!product) continue;

        const el = document.createElement("div");
        el.className = "bag-item";

        el.innerHTML = `
      <div class="bag-item-image-container">
        <img class="bag-item-image" src="${product.image_url}" alt="${product.title}">
      </div>

      <div class="bag-item-details">
        <div class="bag-item-info">
          <div>
            <p class="bag-item-title">${product.title}</p>
            ${size ? `<p class="bag-item-size">SIZE ${size}</p>` : ""}
          </div>

          <div class="bag-item-bottom">
            <div class="bag-item-qty">
              ${quantity > 1 ? `<button class="qty-btn qty-decrease">-</button>` : `<span class="qty-btn"></span>`}
              <span class="qty-value">${quantity}</span>
              <button class="qty-btn qty-increase">+</button>
            </div>

            <button class="bag-item-remove">REMOVE</button>
          </div>
        </div>

        <div class="bag-item-price-col">
          <p class="bag-item-price">${(Number(product.price) * Number(quantity))}$</p>
        </div>
      </div>
    `;

        const rpcHeaders = authJsonHeaders(token);
        const rpcBody = JSON.stringify({
            p_product_id: Number(product_id),
            p_size: size ?? null,
            p_qty: 1,
        });

        el.querySelector(".qty-increase").addEventListener("click", async () => {
            await fetchJson(`${BASE_URL}/rpc/add_to_cart`, {
                method: "POST",
                headers: rpcHeaders,
                body: rpcBody,
            });
            await loadBag();
        });

        el.querySelector(".qty-decrease")?.addEventListener("click", async () => {
            await fetchJson(`${BASE_URL}/rpc/remove_from_cart`, {
                method: "POST",
                headers: rpcHeaders,
                body: rpcBody,
            });
            await loadBag();
        });

        el.querySelector(".bag-item-remove").addEventListener("click", async () => {
            const sizeFilter = size ? `size=eq.${encodeURIComponent(size)}` : `size=is.null`;

            await fetchJson(
                `${BASE_URL}/cart_items?product_id=eq.${product_id}&${sizeFilter}`,
                {
                    method: "DELETE",
                    headers: rpcHeaders,
                }
            );

            await loadBag();
        });

        list.appendChild(el);
    }
}

loadBag();
