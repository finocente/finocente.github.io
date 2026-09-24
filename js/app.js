// ---- Estado ----
let sidebarHidden = false;

const $ = (sel) => document.querySelector(sel);

// ---- Aviso legal: antes de usar la app ----
function avisoAceptado() {
  try { return localStorage.getItem("aviso_legal") === "1"; } catch (_) { return true; }
}
function bloquearApp(bloquear) {
  [".sidebar", ".topbar", ".main"].forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.style.pointerEvents = bloquear ? "none" : "";
  });
}
(function initAviso() {
  const overlay = $("#avisoLegal");
  const chk = $("#avisoAcepto");
  const btn = $("#avisoEntrar");
  if (!overlay || !chk || !btn) return;
  if (avisoAceptado()) {
    overlay.hidden = true;
    return;
  }
  bloquearApp(true);
  chk.addEventListener("change", () => { btn.disabled = !chk.checked; });
  btn.addEventListener("click", () => {
    try { localStorage.setItem("aviso_legal", "1"); } catch (_) {}
    overlay.hidden = true;
    bloquearApp(false);
  });
})();

// ---- Lateral izquierdo (ocultar a la izquierda) ----
$("#sidebarToggle").addEventListener("click", () => toggleSidebar(true));
$("#sidebarReopen").addEventListener("click", () => toggleSidebar(false));

function toggleSidebar(hide) {
  sidebarHidden = hide;
  document.body.classList.toggle("sidebar-hidden", hide);
  $("#sidebar").classList.toggle("hidden", hide);
}

document.querySelectorAll(".side-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".side-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderSidebarView(btn.dataset.view);
  });
});

function renderSidebarView(view) {
  const box = $("#sidebarView");
  if (view === "mapa") {
    box.innerHTML =
      '<div class="item">🗺️ Mapa del torneo<br><span class="muted">Sede: Palacio de Deportes, salón 2</span></div>' +
      '<div class="item">📍 Coordenadas: 40.4203° N, 3.7058° W</div>' +
      '<div class="item">🚗 Párking & accesos habilitados</div>';
  } else if (view === "lista") {
    box.innerHTML = TORNEO.torneos
      .map(
        (t) =>
          `<div class="item"><strong>${t.nombre}</strong><br>` +
          `<span class="muted">${t.fecha} · ${t.estado}</span></div>`
      )
      .join("");
  }
}
renderSidebarView("mapa");

// ---- Menú derecho: admin, login, feedback ----
$("#btnAdmin").addEventListener("click", () => $("#dlgAdmin").showModal());
$("#btnLogin").addEventListener("click", () => $("#dlgLogin").showModal());
$("#btnFeedback").addEventListener("click", () => $("#dlgFeedback").showModal());

$("#dlgLogin").addEventListener("close", () => {
  if ($("#dlgLogin").returnValue === "ok") toast("Sesión iniciada (demo)");
});
$("#dlgFeedback").addEventListener("close", () => {
  if ($("#dlgFeedback").returnValue === "ok") toast("¡Gracias por tu feedback!");
});

// ---- Servidor maestro (webapp_redis) ----
$("#linkMaestro").href = "https://uefi-x86.tail11334a.ts.net/";

// ---- Ronda actual ----
$("#roundMeta").textContent =
  `Ronda ${TORNEO.rondaActual} de ${TORNEO.rondasTotales} · ${TORNEO.formato}`;

let clock = 1 * 3600 + 12 * 60 + 45;
setInterval(() => {
  clock--;
  if (clock < 0) clock = 0;
  const h = String(Math.floor(clock / 3600)).padStart(2, "0");
  const m = String(Math.floor((clock % 3600) / 60)).padStart(2, "0");
  const s = String(clock % 60).padStart(2, "0");
  $("#roundClock").textContent = `${h}:${m}:${s}`;
}, 1000);

// ---- Calendario ----
function buildCalendar() {
  const { anio, mes, diasEvento, hoy } = TORNEO.calendario;
  const first = new Date(anio, mes, 1);
  const daysInMonth = new Date(anio, mes + 1, 0).getDate();
  const dow0 = first.getDay();
  const dow = (dow0 + 6) % 7; // lunes = 0
  const dias = ["L", "M", "X", "J", "V", "S", "D"];
  let html = dias.map((d) => `<div class="dow">${d}</div>`).join("");
  for (let i = 0; i < dow; i++) html += '<div class="day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const cls = [];
    if (diasEvento.includes(d)) cls.push("event");
    if (d === hoy) cls.push("today");
    html += `<div class="day ${cls.join(" ")}">${d}</div>`;
  }
  $("#calendar").innerHTML = html;
}
buildCalendar();

$("#schedule").innerHTML = TORNEO.jornadas
  .map(
    (j) =>
      `<li><span><strong>Ronda ${j.ronda}</strong> &nbsp; ${j.hora}</span>` +
      `<span class="r-date">${j.fecha} · ${j.estado}</span></li>`
  )
  .join("");

// ---- Mesas de la ronda ----
function playerHtml(p, color, resultado) {
  return (
    `<div class="player">` +
    `<span class="piece ${color}" title="Juega de ${color === "white" ? "blancas" : "negras"}">${color === "white" ? "♔" : "♚"}</span>` +
    `<div><div class="name">${p.nombre}</div>` +
    `<div class="meta">ELO ${p.elo} · ${p.club}</div></div></div>`
  );
}

function buildBoards() {
  $("#boards").innerHTML = TORNEO.mesas
    .map((m) => {
      const res = m.resultado
        ? `<div class="result">${m.resultado}</div>`
        : `<div class="result pending">en juego</div>`;
      return (
        `<div class="board">` +
        `<div class="board-no">Mesa ${m.mesa}</div>` +
        `<div class="players">${playerHtml(m.blancas, "white")}${playerHtml(m.negras, "black")}</div>` +
        res +
        `</div>`
      );
    })
    .join("");
}
buildBoards();

// ---- Toast ----
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.hidden = true), 2600);
}