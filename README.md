# iMobile — phone & accessories store template

Plain HTML, CSS and JavaScript. Open `index.html` in a browser, or deploy the folder as-is (Vercel, Netlify, any static host).

## Pages
| File | What it is |
|---|---|
| `index.html` | Home: full-screen hero, category grid, new arrivals, why iMobile, weekend deals, newsletter |
| `phones.html` | Phones & tablets, filter by brand, sort by price/name |
| `accessories.html` | Watches, earbuds, chargers, power banks, cases (filter by type) |
| `deals.html` | Everything on discount, with a countdown to Sunday midnight |
| `product.html?id=…` | Product detail: colours, storage, quantity, specs, related items |
| `cart.html` | Cart with quantities, delivery fee / free-delivery bar and totals |
| `contact.html` | Let's connect card, call / WhatsApp / email / location / hours, and a contact form |

## Files
- `style.css` — base styles, nav, cursor, hero
- `pages.css` — every other section and page
- `data.js` — **the product catalogue** (names, prices, colours, specs) and the drawn device artwork
- `script.js` — shared: cart (saved in the browser), menu, custom cursor, scroll animations, countdown
- `home.js`, `shop.js`, `product.js`, `cart.js` — page-specific code

## Extras
- **Preloader:** full version on the first visit of a session, a quick one after that (`runPreloader` in `script.js`).
- **Smooth scroll:** Lenis, loaded from unpkg. If it can't load, the site falls back to native scrolling.
- **Testimonials:** the home page section holds `[placeholders]`. Replace them with real customer reviews (with permission) before going live.

## Editing
- **Products:** edit `CATALOGUE` in `data.js`. Add `was:` for a sale price (it then shows on the Deals page).
- **Real photos:** add `image: "assets/products/your-photo.jpg"` to any product; it replaces the drawn artwork.
- **Storage pricing:** each storage step adds KSh 15,000 — change it in `product.js` and `cart.js`.
- **Delivery:** `FREE_DELIVERY_FROM` and `DELIVERY_FEE` at the top of `cart.js`.
- **Checkout, newsletter & contact form:** front-end only. Hook your M-Pesa / card / WhatsApp checkout into the `[data-checkout]` handler in `cart.js`, and your email tool into `home.js`.
- **Store details:** replace the `[YOUR STORE ADDRESS]`-style placeholders in the footer of each page.
