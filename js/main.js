/* =========================
   Helpers
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* =========================
   Active nav link (multipage, green + data)
========================= */
(function setActiveNavLink() {
  const navLinks = $$(".navMenu a.navLink"); // solo nav, no footer externo
  if (!navLinks.length) return;

  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const current = path === "" ? "index.html" : path;

  const isDataPage = current.includes("-data");

  // Home por contexto:
  // - Verde: index.html
  // - Data:  index-data.html
  const homeByContext = isDataPage ? "index-data.html" : "index.html";

  navLinks.forEach((a) => {
    const rawHref = (a.getAttribute("href") || "").toLowerCase();

    // Normaliza variantes comunes
    const normalized =
      rawHref === "./" ? homeByContext :
      rawHref === "" ? "" :
      rawHref;

    const isActive = normalized === current;

    a.classList.toggle("isActive", isActive);

    // Accesibilidad
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
})();

/* =========================
   Mobile nav
========================= */
const navToggle = $("[data-nav-toggle]");
const navMenu = $("[data-nav-menu]");

function setMenu(open) {
  if (!navToggle || !navMenu) return;

  navMenu.classList.toggle("isOpen", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");

  document.body.toggleAttribute("data-menu-open", open);
  document.documentElement.style.overflow = open ? "hidden" : "";
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  // Cierra menú al pulsar cualquier link de navegación o botón volver
  $$(".navLink, .navCta, .navBack", navMenu).forEach((el) => {
    el.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 860px)").matches) setMenu(false);
  });
}

/* Hamburger to X (CSS injected for simplicity) */
(function injectHamburgerOpenStyles() {
  const css = `
    [data-menu-open="true"] .navToggleBars::before { top: 0; transform: rotate(45deg); }
    [data-menu-open="true"] .navToggleBars::after  { top: 0; transform: rotate(-45deg); }
    [data-menu-open="true"] .navToggleBars { background: transparent; }
  `;
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
})();

/* =========================
   Reveal on scroll (DISABLED)
========================= */
$$(".reveal").forEach((el) => el.classList.add("isVisible"));

/* =========================
   Contact form validation (demo)
   - Compatible con contacto.html y contacto-data.html
========================= */
const form = $("#contactForm");
const statusEl = $("[data-form-status]");

function setFieldMsg(name, msg) {
  const el = $(`[data-field-msg="${name}"]`);
  if (el) el.textContent = msg || "";
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

function validate(formEl) {
  // Soporta forms donde falte algún campo (por si alguna página cambia)
  const nameEl = formEl?.name;
  const emailEl = formEl?.email;
  const topicEl = formEl?.topic;
  const messageEl = formEl?.message;

  const name = nameEl ? nameEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";
  const topic = topicEl ? topicEl.value.trim() : "";
  const message = messageEl ? messageEl.value.trim() : "";

  let ok = true;

  setFieldMsg("name", "");
  setFieldMsg("email", "");
  setFieldMsg("topic", "");
  setFieldMsg("message", "");

  if (nameEl && name.length < 2) {
    setFieldMsg("name", "Introduce un nombre válido (mín. 2 caracteres).");
    ok = false;
  }
  if (emailEl && !isEmail(email)) {
    setFieldMsg("email", "Introduce un email válido.");
    ok = false;
  }
  if (topicEl && !topic) {
    setFieldMsg("topic", "Selecciona una opción.");
    ok = false;
  }
  if (messageEl && message.length < 10) {
    setFieldMsg("message", "Cuéntame un poco más (mín. 10 caracteres).");
    ok = false;
  }

  return ok;
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validate(form)) {
      if (statusEl) statusEl.textContent = "Revisa los campos marcados.";
      return;
    }

    if (statusEl) statusEl.textContent = "Enviando…";

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    window.setTimeout(() => {
      if (statusEl) {
        statusEl.textContent =
          "Listo. Mensaje preparado (demo). Conecta esto a tu backend cuando quieras.";
      }
      if (btn) btn.disabled = false;
      form.reset();
    }, 700);
  });

  ["name", "email", "topic", "message"].forEach((field) => {
    const el = form[field];
    if (!el) return;
    el.addEventListener("blur", () => validate(form));
  });
}

/* =========================
   Footer: year + to top
========================= */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const toTopBtn = $("[data-to-top]");
if (toTopBtn) {
  toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "auto" });
  });
}

/* =========================
   Matrix canvas (only if exists)
========================= */
(function () {
  const canvas = document.querySelector(".matrixCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const letters = "01";
  const fontSize = 14;

  function compute() {
    const columns = Math.max(1, Math.floor(canvas.width / fontSize));
    return { columns, drops: Array(columns).fill(1) };
  }

  let { drops } = compute();

  window.addEventListener("resize", () => {
    ({ drops } = compute());
  });

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d6b46b";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  setInterval(draw, 55);
})();

