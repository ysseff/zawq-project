// /* Updates the bag count in the navbar for pages that use the inline nav */
// (async function () {
//   const SUPABASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co";
//   const BASE_URL = `${SUPABASE_URL}/rest/v1`;
//   const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";

//   function getAccessToken() {
//     try {
//       const session = JSON.parse(localStorage.getItem("sb_session"));
//       return session?.access_token || null;
//     } catch {
//       return null;
//     }
//   }

//   const token = getAccessToken();

//   // Not logged in => bag count empty/0
//   const el = document.getElementById("nav-bag-count");
//   if (!token) {
//     if (el) el.textContent = "";
//     return;
//   }

//   try {
//     // Fetch only current user's rows (RLS must be enabled on cart_items)
//     const res = await fetch(`${BASE_URL}/cart_items?select=quantity`, {
//       headers: {
//         apikey: API_KEY,
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!res.ok) {
//       if (el) el.textContent = "";
//       return;
//     }

//     const items = await res.json();
//     const total = Array.isArray(items)
//       ? items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
//       : 0;

//     if (el) el.textContent = total > 0 ? ` (${total})` : "";
//   } catch {
//     if (el) el.textContent = "";
//   }
// })();