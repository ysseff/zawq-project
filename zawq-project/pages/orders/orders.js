const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
const BASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";

function getAccessToken() {
    try {
        const s = JSON.parse(localStorage.getItem("zawq-token"));
        return s?.access_token || null;
    } catch {
        return null;
    }
}

function formatDate(str) {
    return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function getStatusClass(status) {
    if (!status) return "status-default";
    const s = status.toLowerCase();
    if (s === "pending") return "status-pending";
    if (s === "confirmed") return "status-confirmed";
    if (s === "shipped") return "status-shipped";
    if (s === "delivered") return "status-delivered";
    if (s === "cancelled") return "status-cancelled";
    return "status-default";
}

async function loadOrders() {
    const token = getAccessToken();
    if (!token) {
        window.location.href = "../Login/login.html";
        return;
    }

    const res = await fetch(`${BASE_URL}/orders?select=*&order=created_at.desc`, {
        headers: {
            "apikey": API_KEY,
            "Authorization": `Bearer ${token}`
        }
    });
    const orders = await res.json();

    const list = document.getElementById("orders-list");

    if (!orders.length) {
        list.innerHTML = `<p class="empty-state mt-2">You have no orders yet.</p>`;
        return;
    }

    orders.forEach(order => {
        const col = document.createElement("div");
        col.className = "col-12 mb-3";
        col.innerHTML = `
            <div class="order-card">
                <div class="order-card-left">
                    <p class="order-id">Order #${order.id}</p>
                    <p class="order-date">${formatDate(order.created_at)}</p>
                </div>
                <div class="order-card-right">
                    <p class="order-total">${order.total_amount}$</p>
                    ${order.status ? `<span class="order-status ${getStatusClass(order.status)}">${order.status}</span>` : ""}
                </div>
            </div>
        `;
        list.appendChild(col);
    });
}

loadOrders();
