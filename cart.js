/* iMobile — cart page + checkout (orders go to the dashboard) */
const deliveryFee = () => Number(SITE.settings.delivery_fee) || 0;
const freeFrom = () => Number(SITE.settings.free_delivery_from) || 0;

function lineUnitPrice(p, storage) {
  const step = Number(SITE.settings.storage_step) || 0;
  const extra = p.storage && storage ? p.storage.indexOf(storage) * step : 0;
  return p.price + extra;
}

function cartLines() {
  return Cart.read()
    .map((line, index) => ({ ...line, index, p: findProduct(line.id) }))
    .filter((l) => l.p);
}

function totals(items) {
  const subtotal = items.reduce((s, l) => s + lineUnitPrice(l.p, l.storage) * l.qty, 0);
  const delivery = subtotal >= freeFrom() || subtotal === 0 ? 0 : deliveryFee();
  return { subtotal, delivery, total: subtotal + delivery };
}

function renderCart() {
  const list = $("[data-cart-list]");
  const summary = $("[data-cart-summary]");
  const items = cartLines();

  if (!items.length) {
    summary.hidden = true;
    list.style.borderTop = "0";
    list.innerHTML = `
      <div class="cart-empty">
        <h2 class="h2">Your cart is empty</h2>
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

  const t = totals(items);
  $("[data-sub]").textContent = money(t.subtotal);
  $("[data-ship]").textContent = t.delivery ? money(t.delivery) : "Free";
  $("[data-total]").textContent = money(t.total);

  const left = freeFrom() - t.subtotal;
  $("[data-free-note]").textContent =
    left > 0 ? `Add ${money(left)} more for free delivery.` : "You've unlocked free delivery.";
  $("[data-free-bar]").style.width = `${freeFrom() ? Math.min(100, (t.subtotal / freeFrom()) * 100) : 100}%`;
}

/* ---------------- CHECKOUT ---------------- */
function checkoutModal() {
  const wrap = document.createElement("div");
  wrap.className = "modal";
  wrap.innerHTML = `
    <div class="modal__panel cut" role="dialog" aria-modal="true" aria-labelledby="co-title">
      <span class="cut__notch"><button type="button" class="chip-go" data-close aria-label="Close">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span>

      <form class="checkout" data-co novalidate>
        <h2 class="stitle" id="co-title">Checkout</h2>
        <p class="ssub">We'll call or text to confirm your order and delivery time.</p>

        <div class="cform__row">
          <label class="cfield"><span>Full name</span><input class="field" name="name" autocomplete="name" required /></label>
          <label class="cfield"><span>Phone</span><input class="field" name="phone" type="tel" autocomplete="tel" placeholder="07XX XXX XXX" required /></label>
        </div>
        <label class="cfield"><span>Email</span><input class="field" name="email" type="email" autocomplete="email" required /></label>
        <div class="cform__row">
          <label class="cfield"><span>Town / city</span><input class="field" name="town" autocomplete="address-level2" required /></label>
          <label class="cfield"><span>Delivery address</span><input class="field" name="address" autocomplete="street-address" placeholder="Building, street, landmark" required /></label>
        </div>

        <fieldset class="paygroup">
          <legend>Payment</legend>
          <label><input type="radio" name="payment" value="M-Pesa" checked /><span>M-Pesa</span></label>
          <label><input type="radio" name="payment" value="Card" /><span>Card</span></label>
          <label><input type="radio" name="payment" value="Cash on delivery" /><span>Cash on delivery</span></label>
        </fieldset>

        <label class="cfield"><span>Order notes (optional)</span><textarea class="field" name="note" rows="2"></textarea></label>

        <div class="checkout__total"><span>Total</span><strong data-co-total></strong></div>
        <button class="button button--block" type="submit">Place order
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>
        </button>
      </form>
    </div>`;
  document.body.append(wrap);
  return wrap;
}

function openCheckout() {
  const items = cartLines();
  if (!items.length) return;
  const modal = checkoutModal();
  const form = $("[data-co]", modal);
  $("[data-co-total]", modal).textContent = money(totals(items).total);
  requestAnimationFrame(() => modal.classList.add("is-open"));
  lenis?.stop();

  const close = () => {
    modal.classList.remove("is-open");
    lenis?.start();
    setTimeout(() => modal.remove(), 400);
  };
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", esc);
    }
  });
  setTimeout(() => form.querySelector("input")?.focus(), 300);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) return toast("Please fill in all the delivery details", false);

    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    const f = Object.fromEntries(new FormData(form));
    const lines = cartLines();
    const t = totals(lines);
    try {
      const order = await Store.addOrder({
        customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), town: f.town.trim(), address: f.address.trim() },
        payment: f.payment,
        note: (f.note || "").trim(),
        items: lines.map(({ p, color, storage, qty }) => ({
          id: p.id,
          name: p.name,
          color: (p.colors[color] || p.colors[0]).name,
          storage: storage || null,
          qty,
          unit: lineUnitPrice(p, storage),
        })),
        subtotal: t.subtotal,
        delivery: t.delivery,
        total: t.total,
      });
      Cart.write([]);
      $(".modal__panel", modal).innerHTML = `
        <div class="done">
          <span class="done__tick"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg></span>
          <h2 class="stitle">Order placed</h2>
          <p class="ssub">Your order number is <strong>${order.number}</strong>. We'll call ${f.phone.trim()} shortly to confirm payment and delivery.</p>
          <a href="phones.html" class="button button--block">Keep shopping</a>
        </div>`;
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      toast("Sorry, we couldn't place your order. Please try again.", false);
    }
  });
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

  // Orders are saved to the dashboard. Online payment (M-Pesa STK push / card)
  // can be added later — see ADMIN.md.
  $("[data-checkout]").addEventListener("click", (e) => {
    e.preventDefault();
    openCheckout();
  });

  document.addEventListener("cart:change", renderCart);
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
