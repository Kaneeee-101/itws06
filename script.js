const btn = document.getElementById("menuBtn");
const links = document.getElementById("navLinks");
const nav = document.querySelector(".nav");
const progress = document.getElementById("progress");
const toTop = document.getElementById("toTop");
const toast = document.getElementById("toast");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

const setMenu = (open) => {
  links?.classList.toggle("open", open);
  nav?.classList.toggle("menu-open", open);
  document.body.classList.toggle("menu-open", open);
  btn?.setAttribute("aria-expanded", String(open));
  btn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

btn?.addEventListener("click", () => {
  setMenu(!links?.classList.contains("open"));
});

links?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    lightbox?.close();
  }
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const parallaxNodes = [...document.querySelectorAll("[data-parallax]")];
const currentPage = location.pathname.split("/").pop() || "index.html";
links?.querySelectorAll("a").forEach((a) => {
  if (a.getAttribute("href") === currentPage) a.setAttribute("aria-current", "page");
});
const SCENE_SELECTOR = ".hero, .watermark, .media-reveal, .post-visual, .image-band, .market, .value";
const visibleScenes = new Set();
let ticking = false;

const SCROLL_TILT = 8;
const POINTER_TILT = 7;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const paintTilt = (el) => {
  const scrollTilt = el.classList.contains("card") ? -(el.sp || 0) * SCROLL_TILT : 0;
  el.style.setProperty("--tilt-x", `${(scrollTilt + (el.tiltX || 0)).toFixed(2)}deg`);
  el.style.setProperty("--tilt-y", `${(el.tiltY || 0).toFixed(2)}deg`);
};

const paintScenes = () => {
  const vh = window.innerHeight;
  visibleScenes.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const travel = (vh + rect.height) / 2;
    const progress = Math.max(-1, Math.min(1, (vh / 2 - (rect.top + rect.height / 2)) / travel));
    el.style.setProperty("--sp", progress.toFixed(3));
    if (el.classList.contains("card")) {
      el.sp = progress;
      paintTilt(el);
    }
  });
};

const tilting = new Set();
let tiltFrame = 0;

const stepTilt = () => {
  tiltFrame = 0;
  tilting.forEach((el) => {
    el.tiltX = (el.tiltX || 0) + ((el.targetX || 0) - (el.tiltX || 0)) * 0.16;
    el.tiltY = (el.tiltY || 0) + ((el.targetY || 0) - (el.tiltY || 0)) * 0.16;
    const settled = Math.abs(el.targetX - el.tiltX) < 0.02 && Math.abs(el.targetY - el.tiltY) < 0.02;
    if (settled) {
      el.tiltX = el.targetX;
      el.tiltY = el.targetY;
      if (!el.targetX && !el.targetY) tilting.delete(el);
    }
    paintTilt(el);
  });
  if ([...tilting].some((el) => el.tiltX !== el.targetX || el.tiltY !== el.targetY)) {
    tiltFrame = requestAnimationFrame(stepTilt);
  }
};

const aimTilt = (el, x, y) => {
  el.targetX = x;
  el.targetY = y;
  tilting.add(el);
  if (!tiltFrame) tiltFrame = requestAnimationFrame(stepTilt);
};

let tiltTarget = null;
const releaseTilt = () => {
  if (tiltTarget) aimTilt(tiltTarget, 0, 0);
  tiltTarget = null;
};

if (!reduceMotion) {
  const seal = document.querySelector(".seal-wrap");
  const hero = document.querySelector(".hero");

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !finePointer.matches) return;
    const card = event.target.closest(".card.in-view");
    const target = card || (hero?.contains(event.target) ? seal : null);
    if (target !== tiltTarget) releaseTilt();
    if (!target) return;
    tiltTarget = target;
    if (card) {
      const rect = card.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--gx", `${((nx + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${((ny + 0.5) * 100).toFixed(1)}%`);
      aimTilt(card, -ny * 2 * POINTER_TILT, nx * 2 * POINTER_TILT);
    } else {
      const rect = hero.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      aimTilt(seal, -ny * 22, nx * 22);
    }
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", releaseTilt);
}

const paintScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? y / max : 0;
  if (progress) progress.style.width = `${ratio * 100}%`;
  nav?.classList.toggle("scrolled", y > 12);
  toTop?.classList.toggle("show", y > 480);

  if (!reduceMotion) {
    parallaxNodes.forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.1;
      const rect = el.getBoundingClientRect();
      const top = rect.top - (el.parallaxOffset || 0);
      const offset = (top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.parallaxOffset = offset;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    paintScenes();
  }

  ticking = false;
};

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(paintScroll);
    ticking = true;
  }
}, { passive: true });

toTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
};

const copyText = async (value, message) => {
  try {
    await navigator.clipboard.writeText(value);
    showToast(message);
  } catch {
    showToast("Copy is not available in this browser.");
  }
};

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", () => {
    copyText(el.dataset.copy, `Copied ${el.dataset.copy}`);
  });
});

document.getElementById("copyCaption")?.addEventListener("click", () => {
  const text = document.getElementById("captionText")?.textContent?.trim() || "";
  copyText(text, "Caption copied");
});

const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const galleryImages = [...document.querySelectorAll("[data-gallery]")];
let galleryIndex = -1;

const openLightbox = (img) => {
  if (!lightbox || !lightboxImg) return;
  galleryIndex = galleryImages.indexOf(img);
  lightboxImg.src = img.currentSrc || img.src;
  lightboxImg.alt = img.alt || "";
  if (lightboxCaption) {
    lightboxCaption.textContent = img.closest("figure")?.querySelector("figcaption")?.textContent || "";
  }
  const inGallery = galleryIndex > -1;
  lightboxPrev?.toggleAttribute("hidden", !inGallery);
  lightboxNext?.toggleAttribute("hidden", !inGallery);
  if (!lightbox.open) lightbox.showModal();
};

const stepGallery = (direction) => {
  if (galleryIndex < 0 || !galleryImages.length) return;
  const next = (galleryIndex + direction + galleryImages.length) % galleryImages.length;
  openLightbox(galleryImages[next]);
};

document.querySelectorAll("[data-zoom]").forEach((img) => {
  img.addEventListener("click", () => openLightbox(img));
});

lightboxPrev?.addEventListener("click", () => stepGallery(-1));
lightboxNext?.addEventListener("click", () => stepGallery(1));
lightbox?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") stepGallery(-1);
  if (event.key === "ArrowRight") stepGallery(1);
});

document.getElementById("lightboxClose")?.addEventListener("click", () => lightbox?.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const steps = document.querySelectorAll(".step[data-logo]");
const logoCards = document.querySelectorAll(".logo-card[data-logo]");

const setLogoStep = (id) => {
  steps.forEach((step) => step.classList.toggle("active", step.dataset.logo === id));
  logoCards.forEach((card) => card.classList.toggle("active", card.dataset.logo === id));
};

steps.forEach((step) => {
  step.addEventListener("click", () => setLogoStep(step.dataset.logo));
});
setLogoStep("seal");

const sceneObserver =
  !reduceMotion && "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleScenes.add(entry.target);
          else visibleScenes.delete(entry.target);
        });
        paintScenes();
      })
    : null;
document.querySelectorAll(SCENE_SELECTOR).forEach((el) => sceneObserver?.observe(el));

const REVEAL_ENTER_RATIO = 0.14;
const revealItems = document.querySelectorAll(".reveal, .stagger");
if (reduceMotion) {
  revealItems.forEach((el) => el.classList.add("in"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= REVEAL_ENTER_RATIO) entry.target.classList.add("in");
        else if (!entry.isIntersecting) entry.target.classList.remove("in");
      });
    },
    { threshold: [0, REVEAL_ENTER_RATIO] }
  );
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("in"));
}

paintScroll();

const CARD_SELECTOR =
  ".owner, .zone-list li, .services-grid article, .menu-row, .g-item, .market article, .step, .logo-card, .swatch, .feedback-list li";
const CARD_ENTER_RATIO = 0.12;
const CARD_DRIFT = [-18, -34, -10, -26];

const cardObserver =
  !reduceMotion && "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries
            .filter((e) => e.isIntersecting && e.intersectionRatio >= CARD_ENTER_RATIO && !e.target.classList.contains("in-view"))
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
            .forEach((entry, i) => {
              const card = entry.target;
              const delay = Math.min(i, 6) * 90;
              card.style.setProperty("--card-delay", `${delay}ms`);
              card.classList.add("in-view");
              clearTimeout(card.cardTimer);
              card.cardTimer = setTimeout(() => card.style.removeProperty("--card-delay"), delay + 1200);
            });
          entries.forEach((e) => {
            if (!e.isIntersecting) e.target.classList.remove("in-view");
          });
        },
        { threshold: [0, CARD_ENTER_RATIO] }
      )
    : null;

const watchCards = (root = document) => {
  if (!cardObserver) return;
  root.querySelectorAll(CARD_SELECTOR).forEach((card) => {
    if (card.classList.contains("card")) return;
    card.classList.add("card");
    if (card.querySelector("img")) card.classList.add("card-zoom");
    const index = [...card.parentElement.children].indexOf(card);
    card.style.setProperty("--drift", `${CARD_DRIFT[index % CARD_DRIFT.length]}px`);
    cardObserver.observe(card);
    sceneObserver?.observe(card);
  });
};

const releaseCards = (root) => {
  root?.querySelectorAll(".card").forEach((card) => {
    cardObserver?.unobserve(card);
    sceneObserver?.unobserve(card);
    visibleScenes.delete(card);
  });
};

watchCards();

const data = window.SITE_DATA || {};
const contact = data.contact || {};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

const formatPrice = (price) =>
  typeof price === "number" ? `₱${price.toLocaleString("en-PH", { minimumFractionDigits: 0 })}` : "Price soon";

const menuFilters = document.getElementById("menuFilters");
const menuList = document.getElementById("menuList");
const categories = data.menuCategories || [];
const menuItems = data.menu || [];

const renderMenu = (filter) => {
  if (!menuList) return;
  const shown = categories.filter((cat) => filter === "all" || cat.id === filter);
  releaseCards(menuList);
  menuList.innerHTML = shown
    .map((cat) => {
      const items = menuItems.filter((item) => item.category === cat.id);
      if (!items.length) return "";
      return `
        <div class="menu-group">
          <h3>${escapeHtml(cat.label)}</h3>
          <ul>
            ${items
              .map(
                (item) => `
              <li class="menu-row${item.image ? " has-img" : ""}">
                ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />` : ""}
                <div class="menu-row-copy">
                  <div class="menu-row-line">
                    <span class="menu-name">${escapeHtml(item.name)}</span>
                    <span class="menu-dots" aria-hidden="true"></span>
                    <span class="menu-price${typeof item.price === "number" ? "" : " pending"}">${formatPrice(item.price)}</span>
                  </div>
                  ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                </div>
              </li>`
              )
              .join("")}
          </ul>
        </div>`;
    })
    .join("");
  watchCards(menuList);
};

if (menuFilters && categories.length) {
  const used = categories.filter((cat) => menuItems.some((item) => item.category === cat.id));
  menuFilters.innerHTML = [{ id: "all", label: "All" }, ...used]
    .map(
      (cat, i) =>
        `<button class="filter" type="button" data-filter="${cat.id}" aria-pressed="${i === 0}">${escapeHtml(cat.label)}</button>`
    )
    .join("");
  menuFilters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;
    menuFilters.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    renderMenu(button.dataset.filter);
  });
}
renderMenu("all");

const addressEl = document.getElementById("contactAddress");
if (addressEl && contact.address) addressEl.textContent = contact.address;

const contactList = document.getElementById("contactList");
if (contactList) {
  const rows = [];
  if (contact.hours?.length) {
    rows.push(["Opening hours", contact.hours.map((h) => `${escapeHtml(h.days)}: ${escapeHtml(h.time)}`).join("<br />")]);
  }
  if (contact.phone) {
    rows.push(["Phone", `<a href="tel:${escapeHtml(contact.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(contact.phone)}</a>`]);
  }
  if (contact.email) {
    rows.push(["Email", `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`]);
  }
  if (contact.socials?.length) {
    rows.push([
      "Social",
      contact.socials
        .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
        .join(" · "),
    ]);
  }
  contactList.innerHTML = rows.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("");
}

const footerSocial = document.getElementById("footerSocial");
if (footerSocial && contact.socials?.length) {
  footerSocial.innerHTML = contact.socials
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
    .join("");
}

const mapsUrl = contact.mapQuery
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`
  : "";

const mapFrame = document.getElementById("mapFrame");
if (mapFrame && contact.mapQuery) {
  mapFrame.innerHTML = `<iframe title="Pages & Pour location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed"></iframe>`;
  mapFrame.classList.add("has-map");
}

const contactForm = document.getElementById("contactForm");

document.querySelectorAll("[data-action]").forEach((el) => {
  el.addEventListener("click", (event) => {
    const action = el.dataset.action;
    if (action === "directions" && mapsUrl) {
      event.preventDefault();
      window.open(mapsUrl, "_blank", "noopener");
      return;
    }
    if (action === "contact" && contactForm) {
      event.preventDefault();
      contactForm.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      setTimeout(() => contactForm.querySelector("input")?.focus({ preventScroll: true }), reduceMotion ? 0 : 600);
    }
  });
});

const fieldMessage = (el) => {
  const state = el.validity;
  if (state.valueMissing) return el.tagName === "SELECT" ? "Please choose an option." : "This field is required.";
  if (state.typeMismatch) return "Please enter a valid email address.";
  if (state.tooShort) return `Please enter at least ${el.minLength} characters.`;
  return "";
};

const validateForm = (form) => {
  let firstInvalid = null;
  form.querySelectorAll(".field-error").forEach((slot) => {
    const field = form.elements[slot.dataset.for];
    if (!field) return;
    const isRadio = field instanceof RadioNodeList;
    const el = isRadio ? field[0] : field;
    const valid = isRadio ? Boolean(field.value) : el.checkValidity();
    slot.textContent = valid ? "" : isRadio ? "Please choose a rating." : fieldMessage(el);
    if (!isRadio) el.setAttribute("aria-invalid", String(!valid));
    if (!valid) firstInvalid ||= el;
  });
  firstInvalid?.focus();
  return !firstInvalid;
};

document.querySelectorAll("#contactForm, #feedbackForm").forEach((form) => {
  form.addEventListener("input", (event) => {
    const slot = form.querySelector(`.field-error[data-for="${event.target.name}"]`);
    if (!slot?.textContent) return;
    const field = form.elements[event.target.name];
    const valid = field instanceof RadioNodeList ? Boolean(field.value) : field.checkValidity();
    if (valid) {
      slot.textContent = "";
      event.target.removeAttribute("aria-invalid");
    }
  });
});

const setNote = (form, message) => {
  const note = form.querySelector(".form-note");
  if (note) {
    note.textContent = message;
    note.classList.add("ok");
  }
};

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm(contactForm)) return;
  const values = Object.fromEntries(new FormData(contactForm));
  if (contact.email) {
    const body = `${values.message}\n\n— ${values.name} (${values.email})`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
    setNote(contactForm, "Opening your email app to send the message…");
  } else {
    setNote(contactForm, `Thanks, ${values.name}! Online messaging isn’t connected yet — please visit us at the shop.`);
  }
  contactForm.reset();
});

const feedbackForm = document.getElementById("feedbackForm");
const feedbackList = document.getElementById("feedbackList");
const feedbackSummary = document.getElementById("feedbackSummary");
const FEEDBACK_KEY = "pages-pour-feedback";

const loadFeedback = () => {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
  } catch {
    return [];
  }
};

const renderFeedback = () => {
  const entries = loadFeedback();
  if (feedbackSummary) {
    if (entries.length) {
      const avg = entries.reduce((sum, e) => sum + e.rating, 0) / entries.length;
      feedbackSummary.innerHTML = `<p class="feedback-avg">${avg.toFixed(1)}<span>/ 5</span></p><p>${entries.length} review${entries.length > 1 ? "s" : ""} on this device</p>`;
    } else {
      feedbackSummary.innerHTML = `<p class="feedback-empty">No feedback yet. Be the first to share your visit.</p>`;
    }
  }
  if (feedbackList) {
    releaseCards(feedbackList);
    feedbackList.innerHTML = entries
      .slice()
      .reverse()
      .map(
        (e) => `<li>
          <div class="feedback-meta"><strong>${escapeHtml(e.name)}</strong><span class="feedback-stars" aria-label="${e.rating} out of 5 stars">${"★".repeat(e.rating)}${"☆".repeat(5 - e.rating)}</span></div>
          <p>${escapeHtml(e.comment)}</p>
          <time datetime="${e.date}">${new Date(e.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</time>
        </li>`
      )
      .join("");
    watchCards(feedbackList);
  }
};

feedbackForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm(feedbackForm)) return;
  const values = Object.fromEntries(new FormData(feedbackForm));
  const entries = loadFeedback();
  entries.push({
    name: values.name.trim(),
    rating: Number(values.rating),
    comment: values.comment.trim(),
    date: new Date().toISOString(),
  });
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries.slice(-50)));
  } catch {
    /* storage unavailable */
  }
  renderFeedback();
  setNote(feedbackForm, "Thank you for your feedback!");
  showToast("Feedback submitted");
  feedbackForm.reset();
});

renderFeedback();
