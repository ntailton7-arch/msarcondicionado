/* ===== CONFIGURAÇÃO ===== */
const WHATSAPP = "5583987865126"; // 83 98786-5126 (com DDI 55)
const INTRO_MS = 5800;            // duração da abertura

const wa = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Links do WhatsApp */
function bindWa() {
  $$("[data-wa]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const msg = a.dataset.wa || "Olá! Gostaria de um orçamento.";
      window.open(wa(msg), "_blank", "noopener");
    });
  });
}
bindWa();
$("#yr").textContent = new Date().getFullYear();

/* ===== ABERTURA ===== */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let finished = false;
function finishIntro() {
  if (finished) return;
  finished = true;
  const intro = $("#intro");
  intro.classList.add("out");
  document.body.classList.remove("is-intro");
  document.body.classList.add("ready");
  setTimeout(() => { intro.remove(); }, 1000);
  revealHero();
}
function revealHero() {
  $$(".hero .rv, .hero .rv-pop").forEach((el, i) => {
    el.style.setProperty("--d", `${0.15 + i * 0.13}s`);
    requestAnimationFrame(() => el.classList.add("in"));
  });
}
if (reduce) { finishIntro(); } else {
  setTimeout(finishIntro, INTRO_MS);
  $("#intro").addEventListener("click", finishIntro); // toque/clique pula a abertura
}

/* ===== REVEAL NA ROLAGEM ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
$$(".rv, .rv-pop").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

/* ===== NAV + PARALLAX ===== */
const nav = $("#nav");
const vis = $(".hero-visual");
let ticking = false;
addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    nav.classList.toggle("solid", y > 40);
    if (vis && !reduce && y < innerHeight) vis.style.translate = `0 ${y * 0.12}px`;
    ticking = false;
  });
}, { passive: true });

/* ===== FLUXO DE AR (canvas) ===== */
(function air() {
  const cv = $("#air");
  const ctx = cv.getContext("2d");
  let w, h, dpr, parts = [];
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 700 ? 40 : 90;
    parts = Array.from({ length: n }, () => spawn(true));
  }
  function spawn(init) {
    return {
      x: init ? Math.random() * w : -20,
      y: Math.random() * h,
      v: 0.4 + Math.random() * 1.2,
      r: 0.6 + Math.random() * 1.8,
      a: 0.15 + Math.random() * 0.5,
      p: Math.random() * 6.28,
      t: 20 + Math.random() * 60
    };
  }
  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    parts.forEach((p, i) => {
      p.x += p.v;
      const yy = p.y + Math.sin(t / 900 + p.p) * 18;
      ctx.beginPath();
      ctx.moveTo(p.x - p.t, yy);
      ctx.lineTo(p.x, yy);
      const g = ctx.createLinearGradient(p.x - p.t, 0, p.x, 0);
      g.addColorStop(0, "rgba(191,234,255,0)");
      g.addColorStop(1, `rgba(191,234,255,${p.a})`);
      ctx.strokeStyle = g; ctx.lineWidth = p.r; ctx.lineCap = "round"; ctx.stroke();
      if (p.x - p.t > w) parts[i] = spawn(false);
    });
    if (!document.hidden) requestAnimationFrame(tick);
  }
  size();
  addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) requestAnimationFrame(tick); });
  if (!reduce) requestAnimationFrame(tick);
})();

/* ===== SIMULADOR DE BTUs ===== */
(function btu() {
  const f = $("#btuForm");
  const out = $("#btuOut");
  const sizes = [7000, 9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];
  const num = (id, d) => { const v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : d; };
  function calc() {
    const area = Math.max(num("#area", 10), 1);
    const pessoas = Math.max(num("#pessoas", 1), 1);
    const eletro = num("#eletro", 0);
    const tipo = parseFloat($("#tipo").value);
    const sol = parseFloat($("#sol").value);
    // Regra prática: 600 BTU/m² + 600 por pessoa adicional + 600 por aparelho que gera calor
    let base = (area * 600 + (pessoas - 1) * 600 + eletro * 600) * tipo * sol;
    const rec = sizes.find((s) => s >= base) || Math.ceil(base / 1000) * 1000;
    out.textContent = rec.toLocaleString("pt-BR");
    const s = out.parentElement;
    s.classList.add("pulse"); setTimeout(() => s.classList.remove("pulse"), 220);
    $("#btuWa").dataset.wa =
      `Olá! Usei o simulador do site: ambiente de ${area} m², ${pessoas} pessoa(s), ${$("#tipo").selectedOptions[0].text.toLowerCase()}, ${$("#sol").selectedOptions[0].text.toLowerCase()}, ${eletro} aparelho(s) que geram calor. Estimativa: ${rec.toLocaleString("pt-BR")} BTU/h. Poderiam me fazer uma recomendação?`;
  }
  f.addEventListener("input", calc);
  f.addEventListener("submit", (e) => e.preventDefault());
  calc();
})();
