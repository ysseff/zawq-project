const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
const BASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";

const HEADERS = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`
};

// helper function to captilaze
function capitalizeFirst(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

async function loadProduct(id) {
    const res = await fetch(`${BASE_URL}/products?id=eq.${id}&select=*`, { headers: HEADERS });
    const data = await res.json();

    if (data.length === 0) {
        document.querySelector("main").innerHTML = `<div class="container py-5"><p>Product not found.</p></div>`;
        return;
    }

    const [product] = data;

    document.title = `ZAWQ | ${product.title}`;

    document.getElementById("breadcrumb-gender").textContent = product.gender == "kids" || product.gender == "unisex" ? capitalizeFirst(product.gender) : `${capitalizeFirst(product.gender)}'s`
    document.getElementById("breadcrumb-category").textContent = capitalizeFirst(product.category);
    document.getElementById("breadcrumb-title").textContent = product.title;
    document.getElementById("product-image").src = product.image_url;
    document.getElementById("product-image").alt = product.title;
    document.getElementById("product-series").textContent = `${product.series.toUpperCase()} SERIES`;
    document.getElementById("product-title").textContent = product.title;

    const currency_symbol = { USD: "$", EUR: "€", GBP: "£", EGP: "£" };
    let symbol = currency_symbol[product.currency] ?? product.currency;
    document.getElementById("product-price").textContent = `${product.price} ${symbol}`;
    document.getElementById("product-description").textContent = product.description;
}

async function loadSizes(id) {
    const res = await fetch(`${BASE_URL}/product_sizes?product_id=eq.${id}&select=*`, { headers: HEADERS });
    const sizes = await res.json();

    const size_order = ["XS", "S", "M", "L", "XL"];
    sizes.sort((a, b) => size_order.indexOf(a.size) - size_order.indexOf(b.size));

    const container = document.getElementById("size-options");

    if (sizes.length === 0) {
        document.querySelector(".size-header").style.display = "none";
        container.style.display = "none";
        return;
    }

    sizes.forEach(({ size, quantity }) => {
        const btn = document.createElement("button");
        btn.textContent = size;
        btn.classList.add("size-btn");

        if (quantity === 0) {
            btn.classList.add("disabled");
            btn.disabled = true;
        }

        btn.addEventListener("click", () => {
            container.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });

        container.appendChild(btn);
    });
}

function getAccessToken() {
    try {
        const session = JSON.parse(localStorage.getItem("zawq-token"));
        return session?.access_token || null;
    } catch {
        return null;
    }
}

async function addToBag(redirectToBag) {
    const selectedSizeBtn = document.querySelector("#size-options .size-btn.active");
    const hasSizeOptions = document.querySelector("#size-options .size-btn");

    if (hasSizeOptions && !selectedSizeBtn) {
        document.getElementById("size-error").style.display = "block";
        return;
    }
    document.getElementById("size-error").style.display = "none";

    const token = getAccessToken();
    if (!token) {
        document.getElementById("login-prompt").style.display = "block";
        return;
    }
    document.getElementById("login-prompt").style.display = "none";

    const size = selectedSizeBtn ? selectedSizeBtn.textContent.trim() : null;

    const body = {
        p_product_id: Number(id),
        p_qty: 1,
        p_size: size
    };

    try {
        const res = await fetch(`${BASE_URL}/rpc/add_to_cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": API_KEY,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.message || "Failed to add to bag.");
        }

        if (typeof updateBagCount === "function") await updateBagCount();

        if (redirectToBag) window.location.href = "../bag/index.html";
    } catch (err) {
        console.error(err);
    }
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id") ?? 1;

loadProduct(id);
loadSizes(id);

document.querySelector(".btn-add-to-bag").addEventListener("click", () => addToBag());
document.querySelector(".btn-add-view-bag").addEventListener("click", () => addToBag(true));