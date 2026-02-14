// script.js

/* =========================
   Helpers
========================= */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

/* =========================
   Burger menu mobile
========================= */
const burger = $("#burger");
const navMenu = $("#navMenu");
const navLinks = $$(".nav__link", navMenu);

function setMenu(open) {
  navMenu.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}

if (burger) {
  burger.addEventListener("click", () => {
    const open = !navMenu.classList.contains("is-open");
    setMenu(open);
  });

  // Ferme le menu au clic sur un lien
  navLinks.forEach((a) => {
    a.addEventListener("click", () => setMenu(false));
  });

  // Ferme au clic en dehors
  document.addEventListener("click", (e) => {
    if (!navMenu.classList.contains("is-open")) return;
    const isClickInside = navMenu.contains(e.target) || burger.contains(e.target);
    if (!isClickInside) setMenu(false);
  });

  // Ferme sur ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
}

/* =========================
   Scroll fluide (fallback JS)
========================= */
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#" || href.length < 2) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    // Empêche le saut direct
    e.preventDefault();

    // Ferme menu si mobile
    setMenu(false);

    const headerH = getHeaderHeight();
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 6;

    window.scrollTo({ top, behavior: "smooth" });
  });
});

function getHeaderHeight() {
  const header = $(".header");
  return header ? header.getBoundingClientRect().height : 0;
}

/* =========================
   Animations apparition (scroll)
========================= */
const reveals = $$(".reveal");

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

reveals.forEach((el) => io.observe(el));

/* =========================
   Bouton retour en haut
========================= */
const toTop = $("#toTop");
function toggleToTop() {
  if (!toTop) return;
  const show = window.scrollY > 700;
  toTop.classList.toggle("show", show);
}
toggleToTop();
window.addEventListener("scroll", toggleToTop, { passive: true });

if (toTop) {
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   Validation formulaire + succès fictif
========================= */
const form = $("#contactForm");
const statusBox = $("#formStatus");

function setError(fieldId, message) {
  const err = $(`.error[data-for="${fieldId}"]`);
  if (err) err.textContent = message || "";
}

function isValidEmail(email) {
  // Simple & robuste pour vitrine
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

function isValidPhone(phone) {
  // Accepte formats FR courants (06.., 07.., +33 .., espaces)
  const p = String(phone).replace(/\s+/g, "").trim();
  return /^(\+33|0)[1-9]\d{8}$/.test(p);
}

function showStatus(message) {
  if (!statusBox) return;
  statusBox.style.display = "block";
  statusBox.textContent = message;
}

function hideStatus() {
  if (!statusBox) return;
  statusBox.style.display = "none";
  statusBox.textContent = "";
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideStatus();

    const name = $("#name")?.value.trim() || "";
    const phone = $("#phone")?.value.trim() || "";
    const email = $("#email")?.value.trim() || "";
    const message = $("#message")?.value.trim() || "";

    // Reset erreurs
    ["name", "phone", "email", "message"].forEach((id) => setError(id, ""));

    let ok = true;

    if (name.length < 2) {
      setError("name", "Merci d’indiquer votre nom.");
      ok = false;
    }

    if (!isValidPhone(phone)) {
      setError("phone", "Merci d’indiquer un téléphone valide (ex : 06XXXXXXXX).");
      ok = false;
    }

    if (!isValidEmail(email)) {
      setError("email", "Merci d’indiquer un email valide.");
      ok = false;
    }

    if (message.length < 10) {
      setError("message", "Merci de préciser votre demande (au moins 10 caractères).");
      ok = false;
    }

    if (!ok) {
      showStatus("Veuillez corriger les champs indiqués avant l’envoi.");
      return;
    }

    // Succès fictif (pas d'envoi réel)
    showStatus("✅ Merci ! Votre demande a bien été prise en compte. Nous vous recontactons rapidement.");
    form.reset();

    // Option : referme le menu si ouvert (mobile)
    setMenu(false);
  });

  // Validation légère au blur (UX)
  ["name", "phone", "email", "message"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("blur", () => {
      const v = el.value.trim();
      if (id === "name" && v && v.length < 2) setError("name", "Nom trop court.");
      if (id === "phone" && v && !isValidPhone(v)) setError("phone", "Téléphone invalide.");
      if (id === "email" && v && !isValidEmail(v)) setError("email", "Email invalide.");
      if (id === "message" && v && v.length < 10) setError("message", "Message trop court.");
      if (!v) setError(id, "");
      if (v && ((id === "name" && v.length >= 2) || (id === "phone" && isValidPhone(v)) || (id === "email" && isValidEmail(v)) || (id === "message" && v.length >= 10))) {
        setError(id, "");
      }
    });
  });
}

/* =========================
   Footer year
========================= */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* =========================
   Ajuste l'ancre (header fixe)
   (optionnel : améliore les clics directs via URL #section)
========================= */
window.addEventListener("load", () => {
  if (!location.hash) return;
  const target = document.getElementById(location.hash.slice(1));
  if (!target) return;

  const headerH = getHeaderHeight();
  const top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 6;
  window.scrollTo({ top, behavior: "smooth" });
});
