// fallback products - used if the API call fails
const PRODUCTS = [
  // MEN
  {
    id: 1,
    cat: "men",
    type: "tops",
    series: "WINTER SERIES",
    name: "Slate Utility Overshirt",
    price: 79,
    img: "../../assets/products/men-overshirt.jpg",
  },
  {
    id: 2,
    cat: "men",
    type: "tops",
    series: "ESSENTIALS SERIES",
    name: "Noir Essential Crewneck",
    price: 49,
    img: "../../assets/products/men-crewneck.png",
  },
  {
    id: 3,
    cat: "men",
    type: "tops",
    series: "WARM-WEATHER SERIES",
    name: "Sandstone Core Tee",
    price: 29,
    img: "../../assets/products/men-tee.png",
  },
  {
    id: 4,
    cat: "men",
    type: "accessories",
    series: "SIGNATURE SERIES",
    name: "Tailored Blazer — Graphite",
    price: 139,
    img: "../../assets/products/men-blazer.png",
  },

  // WOMEN
  {
    id: 11,
    cat: "women",
    type: "tops",
    series: "ESSENTIALS",
    name: "Ivory Knit Top",
    price: 55,
    img: "../../assets/products/women-knit.jpg",
  },
  {
    id: 12,
    cat: "women",
    type: "bottoms",
    series: "CORE",
    name: "Soft Pleat Trousers",
    price: 75,
    img: "../../assets/products/women-trousers.jpg",
  },

  // KIDS
  {
    id: 21,
    cat: "kids",
    type: "tops",
    series: "DAILY",
    name: "Cloud Tee",
    price: 18,
    img: "../../assets/products/kids-tee.jpg",
  },
];

// supabase config
const SUPABASE_PRODUCTS_URL =
  "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1/products?select=*&order=created_at.desc";

const SUPABASE_ANON_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";

const DEBUG_RAW_API = true;

// ---- fetch products from supabase ----
async function loadProducts() {
  try {
    const res = await fetch(SUPABASE_PRODUCTS_URL, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase error ${res.status}: ${text}`);
    }

    const data = await res.json();

    if (DEBUG_RAW_API) {
      console.log("RAW SUPABASE DATA:", data);
      console.table(Array.isArray(data) ? data : []);
    }

    // map api response fields to the format we use
    const normalized = (Array.isArray(data) ? data : []).map((row) => ({
      id: row.id,

      cat: String(row.gender || "unisex").toLowerCase(),
      type: String(row.category || "tops").toLowerCase(),

      // Display fields
      series: row.series || "new drop",
      name: row.title || "Untitled",

      // Pricing
      price: Number(row.price || 0),
      currency: row.currency || "USD",

      // Image
      img: row.image_url || "",

      // Extra
      description: row.description || "",
      qty: Number(row.total_quantity || 0),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at || null,
    }));

    return normalized;
  } catch (err) {
    console.error(
      "loadProducts() failed, falling back to local PRODUCTS:",
      err,
    );
    return PRODUCTS;
  }
}

/* small helper functions */
function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function titleCaseCat(cat) {
  if (cat === "men") return "Men’s";
  if (cat === "women") return "Women’s";
  if (cat === "kids") return "Kids";
  if (cat === "accessories") return "Accessories";
  if (cat === "unisex") return "Unisex";
  return "Shop";
}

function money(n) {
  return `${n}$`;
}

// fix image paths (api returns different formats)
const ASSET_BASE = "../../assets/";

function normalizeImg(src) {
  if (!src) return "";

  // Full URL from API
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  // Already correct for our pages
  if (src.startsWith("../../")) return src;

  // Root relative folder
  if (src.startsWith("assets/")) {
    return ASSET_BASE + src.replace(/^assets\//, "");
  }

  // If API returns "products/x.jpg"
  return ASSET_BASE + src;
}

// ---- product card html ----
function productCardHTML(p) {
  const img = normalizeImg(p.img);
  const series = String(p.series || "NEW DROP").toUpperCase();
  const price = Number.isFinite(p.price) ? money(p.price) : "—";
  const name = p.name || "Untitled";

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <a href="../product/index.html?id=${p.id}" class="z-prod-link">
        <div class="z-prod-card">
          <img class="z-prod-img" src="${img}" alt="${name}">
          <div class="z-prod-meta">
            <div class="z-prod-series">${series}</div>
            <div class="z-prod-name-row">
              <div class="z-prod-name">${name}</div>
              <div class="z-prod-price">${price}</div>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = list.map(productCardHTML).join("");
}

// figure out which page we're on
function getPageMode() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("/shop-products/")) return "shop-products";
  if (path.includes("/new-arrivals/")) return "new-arrivals";
  if (path.includes("/pages/index/") || path.endsWith("/index.html"))
    return "home";

  return "unknown";
}
/* ---- home page ---- */
function renderHomeCollection(products) {
  const grid = document.getElementById("zCollectionGrid");
  if (!grid) return;

  const latestThree = [...products]
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;

      if (aTime && bTime) return bTime - aTime;
      return (b.id ?? 0) - (a.id ?? 0);
    })
    .slice(0, 3);

  grid.innerHTML = latestThree
    .map((p) => {
      const img = normalizeImg(p.img);
      const series = String(p.series || "NEW DROP").toUpperCase();
      const name = p.name || "Untitled";
      const price = Number.isFinite(p.price) ? money(p.price) : "—";

      return `
        <a class="z-col-card" href="../product/index.html?id=${p.id}">
          <div class="z-col-img">
            <img src="${img}" alt="${name}" />
          </div>

          <div class="z-col-meta">
            <div class="z-col-series">${series}</div>
            <div class="z-col-row">
              <div class="z-col-name">${name}</div>
              <div class="z-col-price">${price}</div>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}
// shop products page (category filtered)
function initShopProductsPage(allProducts) {
  const grid = document.getElementById("productsGrid");
  const titleEl = document.getElementById("pageTitle");
  const crumbEl = document.getElementById("crumbCat");
  const countEl = document.getElementById("productCount");
  if (!grid || !titleEl || !crumbEl) return;

  const cat = String(getQueryParam("cat") || "men").toLowerCase();
  console.log("CATEGORY FROM URL:", cat);

  const title = titleCaseCat(cat);

  titleEl.textContent = title;
  crumbEl.textContent = title;

  let activeFilter = "all";

  const baseList = allProducts.filter(
    (p) => String(p.cat || "").toLowerCase() === cat,
  );

  function apply() {
    let list = baseList;

    if (activeFilter !== "all") {
      list = list.filter(
        (p) => String(p.type || "").toLowerCase() === activeFilter,
      );
    }

    renderProducts(list);

    if (countEl) countEl.textContent = `${list.length} products`;
  }

  document.querySelectorAll(".z-chips .z-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".z-chips .z-chip")
        .forEach((b) => b.classList.remove("is-active"));

      btn.classList.add("is-active");
      activeFilter = String(btn.dataset.filter || "all").toLowerCase();
      apply();
    });
  });

  apply();
}

/* new arrivals page */
function initNewArrivalsPage(allProducts) {
  const collectionsCount = document.getElementById("collectionsCount");
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const chipsWrap = document.getElementById("filterChips");
  const newCount = document.getElementById("newCount");
  const sortSelect = document.getElementById("sortSelect");

  const LIMIT = 12;
  const base = allProducts.slice();

  let activeCat = "all";
  let activeSort = "latest";

  function apply() {
    let list = base.slice();

    // Filter by category
    if (activeCat !== "all") {
      list = list.filter(
        (p) => String(p.cat || "").toLowerCase() === activeCat,
      );
    }

    // Sorting
    if (activeSort === "price-asc") {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (activeSort === "price-desc") {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (activeSort === "az") {
      list.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      );
    } else if (activeSort === "za") {
      list.sort((a, b) =>
        String(b.name || "").localeCompare(String(a.name || "")),
      );
    }
    // Count unique categories
    const uniqueTypes = new Set(
      list.map((p) => (p.type || "").toLowerCase()).filter(Boolean),
    );
    if (collectionsCount)
      collectionsCount.textContent = String(uniqueTypes.size);
    const limited = list.slice(0, LIMIT);

    renderProducts(limited);
    if (newCount) newCount.textContent = String(limited.length);
  }

  // Chip clicks
  if (chipsWrap) {
    chipsWrap.querySelectorAll(".z-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCat = String(btn.dataset.filter || "all").toLowerCase();

        chipsWrap
          .querySelectorAll(".z-chip")
          .forEach((b) => b.classList.remove("is-active"));

        btn.classList.add("is-active");

        apply();
      });
    });
  }

  // Sort change
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      activeSort = sortSelect.value;
      apply();
    });
  }

  apply();
}
// ---- search page ----
function isSearchPage() {
  return (
    document.getElementById("zGrid") && document.getElementById("zSearchInput")
  );
}

function initSearchPage(allProducts) {
  const input = document.getElementById("zSearchInput");
  const clearBtn = document.getElementById("zClearBtn");
  const catWrap = document.getElementById("zCatChips");
  const seriesWrap = document.getElementById("zSeriesChips");
  const sortSelect = document.getElementById("zSortSelect");

  const grid = document.getElementById("zGrid");
  const empty = document.getElementById("zEmpty");
  const resultCount = document.getElementById("zResultCount");

  if (!input || !grid) return;

  let q = "";
  let activeCat = "all";
  let activeSeries = "all";
  let activeSort = sortSelect ? sortSelect.value : "newest";

  const norm = (v) =>
    String(v ?? "")
      .trim()
      .toLowerCase();

  function uniqSorted(arr) {
    return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }

  function chipBtn(label, isActive, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "z-chip" + (isActive ? " is-active" : "");
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function rebuildChips() {
    if (catWrap) catWrap.innerHTML = "";
    if (seriesWrap) seriesWrap.innerHTML = "";

    const cats = uniqSorted(allProducts.map((p) => norm(p.cat)));
    const series = uniqSorted(
      allProducts.map((p) => String(p.series || "").trim()),
    );

    // Categories
    if (catWrap) {
      catWrap.appendChild(
        chipBtn("All", activeCat === "all", () => {
          activeCat = "all";
          rebuildChips();
          apply();
        }),
      );

      cats.forEach((c) => {
        const label = c ? c.charAt(0).toUpperCase() + c.slice(1) : "Unknown";
        catWrap.appendChild(
          chipBtn(label, activeCat === c, () => {
            activeCat = c;
            rebuildChips();
            apply();
          }),
        );
      });
    }

    // Series
    if (seriesWrap) {
      seriesWrap.appendChild(
        chipBtn("All", activeSeries === "all", () => {
          activeSeries = "all";
          rebuildChips();
          apply();
        }),
      );

      series.forEach((s) => {
        const label = s || "New Drop";
        seriesWrap.appendChild(
          chipBtn(label, activeSeries === s, () => {
            activeSeries = s;
            rebuildChips();
            apply();
          }),
        );
      });
    }
  }

  function sortList(list) {
    const out = list.slice();

    if (activeSort === "price_asc") {
      out.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (activeSort === "price_desc") {
      out.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (activeSort === "name_asc") {
      out.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      );
    } else {
      // default sorting
      out.sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        if (aTime && bTime) return bTime - aTime;
        return (b.id ?? 0) - (a.id ?? 0);
      });
    }

    return out;
  }

  function cardHTML(p) {
    const img = normalizeImg(p.img);
    const series = String(p.series || "NEW DROP").toUpperCase();
    const price = Number.isFinite(p.price) ? money(p.price) : "—";
    const name = p.name || "Untitled";

    return `
      <a href="../product/index.html?id=${p.id}" class="z-card">
        <div class="z-card-img">
          <img src="${img}" alt="${name}" loading="lazy" />
        </div>
        <div class="z-card-body">
          <div class="z-card-kicker">${String(p.type || "product").toUpperCase()}</div>
          <div class="z-card-title">${name}</div>
          <div class="z-card-row">
            <div class="z-price">${price}</div>
            <span class="z-badge">${series}</span>
          </div>
        </div>
      </a>
    `;
  }

  function apply() {
    let list = allProducts.slice();

    // Filters
    if (activeCat !== "all") {
      list = list.filter((p) => norm(p.cat) === activeCat);
    }
    if (activeSeries !== "all") {
      list = list.filter((p) => String(p.series || "").trim() === activeSeries);
    }

    // Search query
    const query = norm(q);
    if (query) {
      list = list.filter((p) => {
        const hay = norm(`${p.name} ${p.series} ${p.cat} ${p.type}`);
        return hay.includes(query);
      });
    }

    // Sort
    list = sortList(list);

    // Count
    if (resultCount) resultCount.textContent = String(list.length);

    // Render
    if (!list.length) {
      grid.innerHTML = "";
      if (empty) empty.classList.remove("d-none");
      return;
    }
    if (empty) empty.classList.add("d-none");

    grid.innerHTML = list.map(cardHTML).join("");
  }

  // event listeners
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      activeSort = sortSelect.value;
      apply();
    });
  }

  let t = null;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      q = input.value || "";
      if (clearBtn) clearBtn.style.display = q.trim() ? "inline-flex" : "none";
      apply();
    }, 120);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      q = "";
      input.value = "";
      clearBtn.style.display = "none";
      apply();
      input.focus();
    });
  }

  if (clearBtn) clearBtn.style.display = "none";
  rebuildChips();
  apply();
}
// init on page load
document.addEventListener("DOMContentLoaded", async () => {
  const allProducts = await loadProducts();
  const mode = getPageMode();

  if (!allProducts || !allProducts.length) {
    const grid = document.getElementById("productsGrid");
    if (grid) {
      grid.innerHTML = `<div class="text-muted small">No products found.</div>`;
    }
    return;
  }

  if (mode === "home") renderHomeCollection(allProducts);
  if (mode === "shop-products") initShopProductsPage(allProducts);
  if (mode === "new-arrivals") initNewArrivalsPage(allProducts);
  if (isSearchPage()) initSearchPage(allProducts);
});
