const deck = document.getElementById("deck");
const slides = [...deck.querySelectorAll(".slide")];
const counter = document.getElementById("counter");
const hudProgress = document.getElementById("hudProgress");
const notesPanel = document.getElementById("notesPanel");
const notesBtn = document.getElementById("notesBtn");
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

const go = (index) => {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === current);
    slide.setAttribute("aria-hidden", String(i !== current));
  });
  counter.textContent = `${current + 1} / ${slides.length}`;
  hudProgress.style.width = `${((current + 1) / slides.length) * 100}%`;
  history.replaceState(null, "", `#${current + 1}`);
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

const sketchImg = document.getElementById("sketchImg");
const showSketch = () => {
  sketchImg.hidden = false;
  document.getElementById("sketchEmpty").hidden = true;
  document.getElementById("sketchFrame").classList.add("has-sketch");
};
if (sketchImg.complete && sketchImg.naturalWidth) showSketch();
else sketchImg.addEventListener("load", showSketch);

window.addEventListener("resize", fit);
window.addEventListener("hashchange", () => go(Number(location.hash.slice(1)) - 1 || 0));

fit();
go(Number(location.hash.slice(1)) - 1 || 0);
