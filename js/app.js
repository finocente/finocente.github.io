// ---- Utilidades ----
const $ = (sel) => document.querySelector(sel);

function avisoAceptado() {
  try { return localStorage.getItem("aviso_legal") === "1"; } catch (_) { return true; }
}

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

function mostrarEstado(t) {
  const e = $("#avisoEstado");
  if (e) { e.hidden = false; e.textContent = t; }
}

function irMaestro(url) {
  if (yaRedirigido || !url) return;
  yaRedirigido = true;
  window.location.href = url;
}

// MQTT: buscar la URL actual del servidor; la que sea más reciente gana
let clienteMqtt = null;
function conectarMqtt() {
  if (typeof window.mqtt === "undefined" || clienteMqtt) return;
  try {
    clienteMqtt = window.mqtt.connect(
      "wss://" + MAESTRO.broker + ":" + MAESTRO.puerto + "/mqtt",
      { keepalive: 30, reconnectPeriod: 5000, clean: true }
    );
  } catch (e) { return; }

  clienteMqtt.on("connect", () => clienteMqtt.subscribe(MAESTRO.topic));
  clienteMqtt.on("message", (topic, payload) => {
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

// ---- Flujo: aviso -> aceptar -> redirigir -> abrir servidor ----
(function init() {
  const overlay = $("#avisoLegal");
  const chk = $("#avisoAcepto");
  const btn = $("#avisoEntrar");
  if (!overlay || !chk || !btn) return;

  function redirigir() {
    overlay.hidden = true;
    mostrarEstado("Redirigiendo al servidor maestro…");
    // Intentar por MQTT y, si no hay señal en 8 s, usar la URL conocida
    cargarMqttYConectar();
    setTimeout(() => irMaestro(mejorUrl || MAESTRO.conocidas[0]), 8000);
  }

  // Si ya aceptó el aviso antes, ir directo a redirigir
  if (avisoAceptado()) { redirigir(); return; }

  chk.addEventListener("change", () => { btn.disabled = !chk.checked; });
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    try { localStorage.setItem("aviso_legal", "1"); } catch (_) {}
    redirigir();
  });
})();