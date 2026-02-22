# ZAWQ — E-Commerce Website

A front-end e-commerce website for a clothing brand called ZAWQ. Built as part of the ITI ServiceNow training program

## About the Project

ZAWQ is a fictional premium casual wear brand. The site includes a full shopping experience — browsing products by category, viewing product details, adding to cart, checking out, and managing your account.

The backend is handled through **Supabase** (authentication, product data, cart, orders).

## Pages

- **Home** — hero section, featured collection, brand story, newsletter
- **Shop** — category overview (Men, Women, Kids, Unisex)
- **New Arrivals** — filterable product listing with sort options
- **Shop by Category** — filtered product grid with chip filters
- **Product** — product detail page with size selection and add to cart
- **Search** — search with category/series filters and sort
- **Bag / Cart** — view cart items, update quantities, remove items
- **Checkout** — shipping form and place order
- **Orders** — order history for logged-in users
- **Profile** — view and update account info, notification preferences
- **Stores** — physical store locations
- **About** — brand philosophy
- **Contact** — contact form and info
- **Privacy** — privacy policy
- **Login / Register** — auth pages

## Tech Used

- HTML, CSS, JavaScript (no frameworks)
- [Bootstrap 5.3.3](https://getbootstrap.com/) for layout and components
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Supabase](https://supabase.com/) for auth and database (REST API, no SDK)
- Google Fonts — Cormorant Garamond + Inter

## How to Run

The site uses absolute paths for the component loading (navbar/footer), so it needs to be served from a local server — just opening the HTML file directly won't work properly.

Using the VS Code **Live Server** extension is the easiest way:

1. Install the Live Server extension in VS Code
2. Right-click any HTML file and choose "Open with Live Server"
3. Make sure the port is set to `5501` (already configured in `.vscode/settings.json`)

## Project Structure

```
zawq-project/
├── assets/          images and logos
├── components/      shared navbar.html and footer.html
├── css/             global styles (styles.css)
├── pages/           one folder per page, each with its own HTML and CSS
└── scripts/         shared JS files (components.js, products.js, etc.)
```

The navbar and footer are loaded dynamically into every page via `components.js` using `fetch()`. This way we only have to update them in one place.

## Features

- User authentication (register, login, logout) via Supabase Auth
- Products loaded from Supabase database with a local fallback
- Cart stored per-user in Supabase (`cart_items` table)
- Place order via Supabase RPC function
- Profile page saves name changes locally and to Supabase
- Responsive design — works on mobile and desktop
