const CATS = {
  Comida:          "#378ADD",
  Transporte:      "#1D9E75",
  Entretenimiento: "#D4537E",
  Salud:           "#EF9F27",
  Educación:       "#7F77DD",
  Otro:            "#888780"
};

let expenses = JSON.parse(localStorage.getItem("luxio-gastos") || "[]");

function save() { localStorage.setItem("luxio-gastos", JSON.stringify(expenses)); }
function fmt(n) { return "$" + Math.round(n).toLocaleString("es-MX"); }

function bump(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 280);
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

function addExpense() {
  const desc   = document.getElementById("inp-desc").value.trim();
  const amount = parseFloat(document.getElementById("inp-amount").value);
  const cat    = document.getElementById("inp-cat").value;
  if (!desc || isNaN(amount) || amount <= 0) { document.getElementById("inp-desc").focus(); return; }
  expenses.unshift({ id: Date.now(), desc, amount, cat });
  save();
  document.getElementById("inp-desc").value = "";
  document.getElementById("inp-amount").value = "";
  showToast("Gasto agregado");
  render();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  showToast("Eliminado");
  render();
}

function render() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const max   = expenses.length ? Math.max(...expenses.map(e => e.amount)) : 0;
  document.getElementById("stat-total").textContent = fmt(total);
  document.getElementById("stat-count").textContent = expenses.length;
  document.getElementById("stat-max").textContent   = fmt(max);
  ["stat-total", "stat-count", "stat-max"].forEach(bump);

  const bycat = {};
  expenses.forEach(e => { bycat[e.cat] = (bycat[e.cat] || 0) + e.amount; });
  const sorted = Object.entries(bycat).sort((a, b) => b[1] - a[1]);

  const barsEl = document.getElementById("bars");
  if (!sorted.length) { barsEl.innerHTML = '<p class="empty">Sin gastos aún</p>'; }
  else {
    const mc = sorted[0][1];
    barsEl.innerHTML = sorted.map(([cat, amt]) => `
      <div class="bar-row">
        <div class="bar-label">${cat}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round(amt/mc*100)}%;background:${CATS[cat]||CATS.Otro}"></div></div>
        <div class="bar-amt">${fmt(amt)}</div>
      </div>`).join("");
  }

  const listEl = document.getElementById("list");
  if (!expenses.length) { listEl.innerHTML = '<p class="empty">Sin gastos aún</p>'; }
  else {
    listEl.innerHTML = expenses.slice(0, 6).map(e => `
      <div class="list-item">
        <div class="dot" style="background:${CATS[e.cat]||CATS.Otro}"></div>
        <div class="item-info">
          <div class="item-name">${e.desc}</div>
          <div class="item-cat">${e.cat}</div>
        </div>
        <span class="item-amt">${fmt(e.amount)}</span>
        <button class="btn-del" onclick="deleteExpense(${e.id})" aria-label="Eliminar">×</button>
      </div>`).join("");
  }

  const pillsEl = document.getElementById("cat-pills");
  if (!sorted.length) { pillsEl.innerHTML = '<p class="empty">Sin gastos aún</p>'; }
  else { pillsEl.innerHTML = sorted.map(([cat, amt]) => `
    <div class="pill"><div class="pill-dot" style="background:${CATS[cat]||CATS.Otro}"></div>${cat}<span class="pill-amt">${fmt(amt)}</span></div>`).join(""); }

  const progEl = document.getElementById("prog-section");
  if (!sorted.length) { progEl.innerHTML = '<p class="empty">Sin gastos aún</p>'; }
  else { progEl.innerHTML = sorted.slice(0, 4).map(([cat, amt]) => `
    <div>
      <div class="prog-row"><span class="prog-label">${cat}</span><span class="prog-val">${total > 0 ? Math.round(amt/total*100) : 0}%</span></div>
      <div class="prog-track"><div class="prog-fill" style="width:${total > 0 ? Math.round(amt/total*100) : 0}%;background:${CATS[cat]||CATS.Otro}"></div></div>
    </div>`).join(""); }
}

render();
