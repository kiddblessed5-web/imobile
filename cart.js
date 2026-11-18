/* iMobile — cart page */
const FREE_DELIVERY_FROM = 10000; // KSh — edit to your policy
const DELIVERY_FEE = 300;         // KSh — edit to your policy

function lineUnitPrice(p, storage) {
  const extra = p.storage && storage ? p.storage.indexOf(storage) * 15000 : 0;
  return p.price + extra;
}

function renderCart() {
  const list = $("[data-cart-list]");
  const summary = $("[data-cart-summary]");
  const items = Cart.read()
    .map((line, index) => ({ ...line, index, p: findProduct(line.id) }))
    .filter((l) => l.p);

  if (!items.length) {
    summary.hidden = true;
    list.style.borderTop = "0";
    list.innerHTML = `
      <div class="cart-empty">
        <h2 class="h2">Your cart<br />is empty</h2>
        <p>Find your next phone or the accessories to go with it.</p>
        <a href="phones.html" class="button">Shop phones
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>
        </a>
      </div>`;
    return;
  }

  summary.hidden = false;
  list.style.borderTop = "";
  list.innerHTML = items
    .map(({ p, color, storage, qty, index }) => {
      const unit = lineUnitPrice(p, storage);
      const c = p.colors[color] || p.colors[0];
      return `
      <article class="line">
        <a href="product.html?id=${p.id}" class="line__media">${productMedia(p, p.colors.indexOf(c))}</a>
        <div>
          <h3 class="line__name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <p class="line__opts">${c.name}${storage ? " · " + storage : ""} · ${money(unit)} each</p>
          <button class="line__remove" data-remove="${index}">Remove</button>
        </div>
        <div class="stepper stepper--sm">
          <button type="button" data-line="${index}" data-delta="-1" aria-label="Decrease quantity">−</button>
          <output>${qty}</output>
          <button type="button" data-line="${index}" data-delta="1" aria-label="Increase quantity">+</button>
        </div>
        <p class="line__price">${money(unit * qty)}</p>
      </article>`;
    })
    .join("");

  const subtotal = items.reduce((s, l) => s + lineUnitPrice(l.p, l.storage) * l.qty, 0);
  const ship = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  $("[data-sub]").textContent = money(subtotal);
  $("[data-ship]").textContent = ship ? money(ship) : "Free";
  $("[data-total]").textContent = money(subtotal + ship);

  const left = FREE_DELIVERY_FROM - subtotal;
  $("[data-free-note]").textContent =
    left > 0 ? `Add ${money(left)} more for free delivery.` : "You've unlocked free delivery.";
  $("[data-free-bar]").style.width = `${Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)}%`;
}

document.addEventListener("page:render", () => {
  renderCart();

  $("[data-cart]").addEventListener("click", (e) => {
    const step = e.target.closest("[data-delta]");
    const rm = e.target.closest("[data-remove]");
    if (step) {
      const i = Number(step.dataset.line);
      const line = Cart.read()[i];
      if (line) Cart.setQty(i, line.qty + Number(step.dataset.delta));
    }
    if (rm) Cart.remove(Number(rm.dataset.remove));
  });

  // connect this to your checkout (M-Pesa STK push, card gateway, WhatsApp order…)
  $("[data-checkout]").addEventListener("click", (e) => {
    e.preventDefault();
    toast("Checkout isn't connected yet", false);
  });

  document.addEventListener("cart:change", renderCart);
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
