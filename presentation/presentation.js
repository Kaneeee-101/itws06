const deck = document.getElementById("deck");
const slides = [...deck.querySelectorAll(".slide")];
const counter = document.getElementById("counter");
const hudProgress = document.getElementById("hudProgress");
const notesPanel = document.getElementById("notesPanel");
const notesBtn = document.getElementById("notesBtn");
const clothesline = document.getElementById("clothesline");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let current = 0;

slides.forEach((slide) => {
  slide.querySelectorAll(".rise").forEach((el, i) => el.style.setProperty("--i", i));
});

const fit = () => {
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  deck.style.setProperty("--scale", scale.toFixed(4));
};

const renderNotes = () => {
  const note = slides[current].querySelector(".notes")?.textContent.trim() || "No notes for this slide.";
  notesPanel.innerHTML = `<strong>Speaker notes · ${slides[current].dataset.title}</strong>`;
  notesPanel.append(note);
};

const clearPegFocus = () => {
  clothesline?.querySelectorAll(".peg").forEach((peg) => peg.setAttribute("aria-pressed", "false"));
};

const go = (index) => {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === current);
    slide.setAttribute("aria-hidden", String(i !== current));
  });
  counter.textContent = `${current + 1} / ${slides.length}`;
  hudProgress.style.width = `${((current + 1) / slides.length) * 100}%`;
  history.replaceState(null, "", `#${current + 1}`);
  clearPegFocus();
  if (!notesPanel.hidden) renderNotes();
};

const toggleNotes = () => {
  notesPanel.hidden = !notesPanel.hidden;
  notesBtn.setAttribute("aria-pressed", String(!notesPanel.hidden));
  if (!notesPanel.hidden) renderNotes();
};

const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};

document.getElementById("prevBtn").addEventListener("click", () => go(current - 1));
document.getElementById("nextBtn").addEventListener("click", () => go(current + 1));
document.getElementById("fullBtn").addEventListener("click", toggleFullscreen);
notesBtn.addEventListener("click", toggleNotes);

document.addEventListener("keydown", (event) => {
  if (event.target.closest?.("button, a") && (event.key === " " || event.key === "Enter")) return;
  const key = event.key;
  if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(key)) {
    event.preventDefault();
    go(current + 1);
  } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(key)) {
    event.preventDefault();
    go(current - 1);
  } else if (key === "Home") go(0);
  else if (key === "End") go(slides.length - 1);
  else if (key.toLowerCase() === "n") toggleNotes();
  else if (key.toLowerCase() === "f") toggleFullscreen();
});

deck.addEventListener("click", (event) => {
  if (event.target.closest("a, button")) return;
  go(current + (event.clientX < window.innerWidth / 3 ? -1 : 1));
});

let touchX = null;
deck.addEventListener("touchstart", (event) => { touchX = event.touches[0].clientX; }, { passive: true });
deck.addEventListener("touchend", (event) => {
  if (touchX === null) return;
  const dx = event.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

let hudTimer = 0;
document.addEventListener("mousemove", () => {
  document.body.classList.add("show-hud");
  clearTimeout(hudTimer);
  hudTimer = setTimeout(() => document.body.classList.remove("show-hud"), 1800);
});

/* Clothesline: click to lift a hanging piece */
clothesline?.addEventListener("click", (event) => {
  const peg = event.target.closest(".peg");
  if (!peg) return;
  event.stopPropagation();
  const wasOn = peg.getAttribute("aria-pressed") === "true";
  clearPegFocus();
  peg.setAttribute("aria-pressed", String(!wasOn));
});

/* Clothesline + 3D tilt follow the pointer on the active slide */
const onPointerMove = (event) => {
  if (reduceMotion) return;
  const slide = slides[current];
  if (!slide) return;

  const rect = slide.getBoundingClientRect();
  const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;

  if (slide.contains(clothesline)) {
    clothesline.style.setProperty("--sway-x", `${nx * 4}deg`);
    clothesline.style.setProperty("--sway-y", `${ny * -3}deg`);
  }

  slide.querySelectorAll(".tilt-card").forEach((card) => {
    const c = card.getBoundingClientRect();
    const cx = ((event.clientX - c.left) / c.width) * 2 - 1;
    const cy = ((event.clientY - c.top) / c.height) * 2 - 1;
    const rx = Math.max(-1, Math.min(1, cy)) * -8;
    const ry = Math.max(-1, Math.min(1, cx)) * 10;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
  });
};

const resetTilts = () => {
  clothesline?.style.setProperty("--sway-x", "0deg");
  clothesline?.style.setProperty("--sway-y", "0deg");
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.style.transform = "";
  });
};

deck.addEventListener("pointermove", onPointerMove);
deck.addEventListener("pointerleave", resetTilts);

window.addEventListener("resize", fit);
window.addEventListener("hashchange", () => go(Number(location.hash.slice(1)) - 1 || 0));

fit();
go(Number(location.hash.slice(1)) - 1 || 0);
