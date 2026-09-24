// ---- Utilidades ----
const $ = (sel) => document.querySelector(sel);

// Aviso legal por cookie de 1 día: siempre vuelve a aparecer al entrar al día siguiente
function getCookie(nombre) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + nombre + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(nombre, valor, dias) {
  const d = new Date();
  d.setTime(d.getTime() + dias * 24 * 3600 * 1000);
  document.cookie = nombre + "=" + encodeURIComponent(valor) + "; expires=" + d.toUTCString() + "; path=/";
}
function avisoAceptado() {
  return getCookie("aviso_legal") === "1";
}
function ocultar(el) { if (el) el.style.display = "none"; }
function mostrar(el, tipo) { if (el) el.style.display = tipo || "flex"; }
function texto(el, t) { if (el) el.textContent = t; }

// ---- Redirección al servidor maestro ----
const MAESTRO = {
  topic: "redajedrez/url",
  broker: "broker.emqx.io",
  puerto: 8084,
  seg: 30,
  conocidas: ["https://uefi-x86.tail11334a.ts.net/"],
};
let mejorUrl = null;
let mejorTs = 0;
let yaRedirigido = false;

function irMaestro(url) {
  if (yaRedirigido || !url) return;
  yaRedirigido = true;
  texto($("#cargaEstado"), "Servidor encontrado: " + url + " — entrando…");
  window.location.href = url;
}

function conectarMqtt() {
  if (typeof window.mqtt === "undefined") return;
  let cliente;
  try {
    cliente = window.mqtt.connect(
      "wss://" + MAESTRO.broker + ":" + MAESTRO.puerto + "/mqtt",
      { keepalive: 30, reconnectPeriod: 5000, clean: true }
    );
  } catch (e) { return; }

  cliente.on("connect", () => cliente.subscribe(MAESTRO.topic));
  cliente.on("message", (topic, payload) => {
    try {
      const m = JSON.parse(payload.toString());
      const ahora = Math.floor(Date.now() / 1000);
      if (m && m.tipo === "url" && m.url &&
          Math.abs(ahora - (m.ts || 0)) < 2 * MAESTRO.seg &&
          (m.ts || 0) >= mejorTs) {
        mejorTs = m.ts;
        mejorUrl = m.url;
        irMaestro(m.url);
      }
    } catch (e) { /* ignorar */ }
  });
  cliente.on("error", () => texto($("#cargaEstado"), "MQTT no responde; usando URL conocida…"));
  cliente.on("offline", () => texto($("#cargaEstado"), "MQTT sin señal; usando URL conocida…"));
}

function cargarMqttYConectar() {
  if (window.mqtt) { conectarMqtt(); return; }
  const fuentes = [
    "https://cdn.jsdelivr.net/npm/mqtt@5/dist/mqtt.min.js",
    "https://unpkg.com/mqtt@5/dist/mqtt.min.js",
  ];
  let i = 0;
  (function intentar() {
    if (i >= fuentes.length) { irMaestro(MAESTRO.conocidas[0]); return; }
    const s = document.createElement("script");
    s.src = fuentes[i++];
    s.onload = () => { window.mqtt ? conectarMqtt() : intentar(); };
    s.onerror = intentar;
    document.head.appendChild(s);
  })();
}

// ---- Flujo: aviso -> aceptar -> pantalla intermedia -> redirigir ----
(function init() {
  const avisoCaja = $("#avisoCaja");
  const cargaCaja = $("#cargaCaja");
  const chk = $("#avisoAcepto");
  const btn = $("#avisoEntrar");
  if (!avisoCaja || !cargaCaja || !chk || !btn) return;

  function redirigir() {
    ocultar(avisoCaja);
    mostrar(cargaCaja, "block");
    cargarMqttYConectar();
    if (!yaRedirigido) {
      setTimeout(() => irMaestro(mejorUrl || MAESTRO.conocidas[0]), 4000);
    }
  }

  if (avisoAceptado()) { redirigir(); return; }

  chk.addEventListener("change", () => { btn.disabled = !chk.checked; });
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    setCookie("aviso_legal", "1", 1);
    redirigir();
  });
})();