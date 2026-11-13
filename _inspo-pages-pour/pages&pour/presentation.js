const $ = (id) => document.getElementById(id);
const deck = $("deck");
const slides = [...deck.querySelectorAll(".slide")];
const counter = $("counter");
const hudProgress = $("hudProgress");
const notesPanel = $("notesPanel");
const notesBtn = $("notesBtn");
const clothesline = $("clothesline");
const wipe = $("wipe");
const wipeRing = $("wipeRing");
const rail = $("rail");
const chapter = $("chapter");
const toast = $("toast");
const cursor = $("cursor");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const EASE_IO = "cubic-bezier(0.7, 0, 0.2, 1)";
const RADIUS = 1700;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let toastTimer = 0;
let current = -1;
let busy = false;
let pending = null;
let scale = 1;

/* ───────── Setup ───────── */

// Stagger index for reveal elements, and sequence index for [data-seq]
slides.forEach((slide) => {
  slide.querySelectorAll(".rise").forEach((el, i) => el.style.setProperty("--i", Math.min(i, 9)));
  slide.querySelectorAll("[data-seq] > *").forEach((el, i) => el.style.setProperty("--k", i));
});

// Split headings into masked words
const splitWords = (root) => {
  let n = 0;
  root.setAttribute("aria-label", root.textContent.replace(/\s+/g, " ").trim());
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(" "); return; }
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--wi", n++);
          w.append(inner);
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(root);
};
deck.querySelectorAll("[data-split]").forEach(splitWords);

// Slide rail
slides.forEach((slide, i) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.dataset.label = slide.dataset.title;
  dot.setAttribute("aria-label", `Go to slide ${i + 1}: ${slide.dataset.title}`);
  dot.addEventListener("click", (event) => {
    event.stopPropagation();
    const r = dot.getBoundingClientRect();
    go(i, toDeck({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
  });
  rail.append(dot);
});

/* ───────── Layout ───────── */

const fit = () => {
  scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  deck.style.setProperty("--scale", scale.toFixed(4));
};

// Convert viewport coords to the 1280x720 stage
const toDeck = (event) => {
  const r = deck.getBoundingClientRect();
  const s = r.width / 1280 || 1;
  const x = Math.max(0, Math.min(1280, (event.clientX - r.left) / s));
  const y = Math.max(0, Math.min(720, (event.clientY - r.top) / s));
  return [x, y];
};

/* ───────── Notes ───────── */

const renderNotes = () => {
  const note = slides[current].querySelector(".notes")?.textContent.trim() || "No notes for this slide.";
  notesPanel.innerHTML = `<strong>Speaker notes · ${slides[current].dataset.title}</strong>`;
  notesPanel.append(note);
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

/* ───────── Slide state ───────── */

const clearPegFocus = () => {
  clothesline?.querySelectorAll(".peg").forEach((peg) => peg.setAttribute("aria-pressed", "false"));
};

const runCounts = (slide) => {
  slide.querySelectorAll("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = to; return; }
    const start = performance.now() + 500;
    const dur = 1200;
    el.textContent = "0";
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - start) / dur));
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1 && slides[current] === slide) requestAnimationFrame(tick);
      else if (p >= 1) el.textContent = to;
    };
    requestAnimationFrame(tick);
  });
};

const activate = (index) => {
  current = index;
  slides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === index);
    slide.setAttribute("aria-hidden", String(i !== index));
  });
  const slide = slides[index];
  deck.dataset.tone = slide.dataset.tone || "light";
  deck.dataset.rail = slide.dataset.rail || deck.dataset.tone;
  deck.dataset.chrome = slide.dataset.chrome || "on";
  chapter.textContent = slide.dataset.chapter || "";
  counter.textContent = `${index + 1} / ${slides.length}`;
  hudProgress.style.width = `${((index + 1) / slides.length) * 100}%`;
  [...rail.children].forEach((dot, i) => dot.classList.toggle("on", i === index));
  history.replaceState(null, "", `#${index + 1}`);
  clearPegFocus();
  resetTilts();
  runCounts(slide);
  if (!notesPanel.hidden) renderNotes();
};

/* ───────── Transitions ───────── */

const TRANSITION_ORDER = ["ripple", "pour", "curtain", "diagonal", "blinds"];
const TRANSITION_LABELS = { ripple: "Coffee ripple", pour: "Pour", curtain: "Curtain", diagonal: "Diagonal sweep", blinds: "Blinds", book: "Book opening", beans: "Coffee beans" };
// "book" and "beans" are reserved for slides tagged data-transition, but can still be locked with T
const ALL_TRANSITIONS = [...TRANSITION_ORDER, "book", "beans"];
let tCount = 0;
let fixedTransition = null;

// Clip-path keyframes for each full-screen wipe (cover, then uncover)
const wipes = {
  ripple: (x, y) => {
    const ex = 1280 - x, ey = 720 - y;
    return {
      cover: [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${RADIUS}px at ${x}px ${y}px)` }],
      uncover: [{ clipPath: `circle(${RADIUS}px at ${ex}px ${ey}px)` }, { clipPath: `circle(0px at ${ex}px ${ey}px)` }],
    };
  },
  pour: () => ({
    cover: [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
    uncover: [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }],
  }),
  curtain: () => ({
    cover: [{ clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0 0 0)" }],
    uncover: [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 50% 0 50%)" }],
  }),
  diagonal: () => ({
    cover: [
      { clipPath: "polygon(-60% 0, -30% 0, -60% 100%, -60% 100%)" },
      { clipPath: "polygon(-30% 0, 160% 0, 130% 100%, -30% 100%)" },
    ],
    uncover: [
      { clipPath: "polygon(-30% 0, 160% 0, 130% 100%, -30% 100%)" },
      { clipPath: "polygon(160% 0, 160% 0, 130% 100%, 130% 100%)" },
    ],
  }),
};

async function runWipe(name, x, y, target) {
  if (name === "ripple") {
    wipeRing.style.left = `${x - 60}px`;
    wipeRing.style.top = `${y - 60}px`;
    wipeRing.animate(
      [{ transform: "scale(0)", opacity: 0.9 }, { transform: "scale(28)", opacity: 0 }],
      { duration: 1000, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
    );
  }
  const kf = wipes[name](x, y);

  await wipe.animate(kf.cover, { duration: 640, easing: EASE_IO, fill: "forwards" }).finished;
  wipe.classList.add("cover");
  activate(target);
  await sleep(240);
  wipe.classList.remove("cover");
  await wipe.animate(kf.uncover, { duration: 700, easing: EASE_IO, fill: "forwards" }).finished;
  wipe.getAnimations().forEach((a) => a.cancel());
}

// Vertical blinds: strips fold shut in a staggered wave, then open the other way
const BLIND_COUNT = 10;
const blinds = document.createElement("div");
blinds.className = "blinds";
blinds.setAttribute("aria-hidden", "true");
for (let i = 0; i < BLIND_COUNT; i++) blinds.append(document.createElement("i"));
deck.append(blinds);

async function runBlinds(target) {
  const strips = [...blinds.children];
  const run = (from, to, origin) =>
    Promise.all(
      strips.map((s, i) =>
        s.animate(
          [{ transform: `scaleY(${from})`, transformOrigin: origin }, { transform: `scaleY(${to})`, transformOrigin: origin }],
          { duration: 460, delay: i * 45, easing: EASE_IO, fill: "forwards" }
        ).finished
      )
    );
  await run(0, 1, "50% 0%");
  activate(target);
  await sleep(160);
  await run(1, 0, "50% 100%");
  strips.forEach((s) => s.getAnimations().forEach((a) => a.cancel()));
}

/* ───────── Book opening ───────── */
// Two covers close over the screen, then swing open like a book, with pages fanning out behind them
const bookfx = document.createElement("div");
bookfx.className = "bookfx";
bookfx.setAttribute("aria-hidden", "true");
["l", "r"].forEach((side) => {
  ["page2", "page1", "cover"].forEach((kind) => {
    const el = document.createElement("div");
    el.className = `bk ${side} ${kind === "cover" ? "cover" : "page"} ${kind}`;
    bookfx.append(el);
  });
});
deck.append(bookfx);

const BOOK_OPEN_ANGLE = 100;

async function runBook(target) {
  const panels = [...bookfx.children];
  bookfx.style.display = "block";
  await Promise.all(panels.map((el) =>
    el.animate(
      [{ opacity: 0, transform: "scale(1.1)" }, { opacity: 1, transform: "scale(1)" }],
      { duration: 480, easing: EASE_IO, fill: "forwards" }
    ).finished
  ));
  panels.forEach((el) => { el.getAnimations().forEach((a) => a.cancel()); });

  activate(target);
  await sleep(280);

  await Promise.all(panels.map((el) => {
    const dir = el.classList.contains("l") ? -1 : 1;
    const delay = el.classList.contains("cover") ? 0 : el.classList.contains("page1") ? 130 : 260;
    return el.animate(
      [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${dir * BOOK_OPEN_ANGLE}deg)` }],
      { duration: 950, delay, easing: EASE_IO, fill: "forwards" }
    ).finished;
  }));

  panels.forEach((el) => { el.getAnimations().forEach((a) => a.cancel()); });
  bookfx.style.display = "none";
}

/* ───────── Coffee bean pour ───────── */
// Beans rain down and pile up from the floor until the screen is full, then spill away to reveal the next slide
const beanCanvas = document.createElement("canvas");
beanCanvas.className = "beanfx";
beanCanvas.width = 2560;
beanCanvas.height = 1440;
beanCanvas.setAttribute("aria-hidden", "true");
const bctx = beanCanvas.getContext("2d");
deck.append(beanCanvas);

const BEAN_TONES = ["#3a2018", "#4a261d", "#5a3325", "#6b3e2e", "#2f1a13"];
const makeBeanSprite = (tone) => {
  const c = document.createElement("canvas");
  c.width = 92;
  c.height = 68;
  const x = c.getContext("2d");
  x.translate(46, 34);
  const g = x.createRadialGradient(-12, -12, 3, 0, 0, 42);
  g.addColorStop(0, "#9a6a46");
  g.addColorStop(0.35, tone);
  g.addColorStop(1, "#1c110d");
  x.fillStyle = g;
  x.beginPath();
  x.ellipse(0, 0, 40, 27, 0, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = "#140a07";
  x.lineWidth = 4;
  x.lineCap = "round";
  x.beginPath();
  x.moveTo(-33, 1);
  x.bezierCurveTo(-14, -12, 10, 12, 33, -1);
  x.stroke();
  return c;
};
const beanSprites = BEAN_TONES.map(makeBeanSprite);

const BEAN_ROWS = 30;
const BEAN_COLS = 34;
const BEAN_G = 3200; // px/s²
const rand = (a, b) => a + Math.random() * (b - a);

const makeBeans = () => {
  const beans = [];
  for (let r = 0; r < BEAN_ROWS; r++) {
    for (let c = 0; c < BEAN_COLS; c++) {
      beans.push({
        x: c * (1280 / (BEAN_COLS - 1)) + (r % 2 ? 19 : 0) - 10 + rand(-5, 5),
        ty: 706 - r * 24 + rand(-3, 3),
        rot: rand(0, Math.PI),
        sprite: beanSprites[Math.floor(rand(0, beanSprites.length))],
        spawn: r * 26 + rand(0, 50),
        leave: r * 18 + rand(0, 90),
      });
    }
  }
  return beans;
};

const drawBeans = (beans, yOf, alpha) => {
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, 2560, 1440);
  bctx.globalAlpha = alpha;
  bctx.fillStyle = "#2b1a14";
  bctx.fillRect(0, 0, 2560, 1440);
  bctx.globalAlpha = 1;
  for (const b of beans) {
    const y = yOf(b);
    if (y === null) continue;
    const cos = Math.cos(b.rot), sin = Math.sin(b.rot);
    bctx.setTransform(cos, sin, -sin, cos, b.x * 2, y * 2);
    bctx.drawImage(b.sprite, -46, -34);
  }
  bctx.setTransform(1, 0, 0, 1, 0, 0);
};

const frames = (fn) => new Promise((resolve) => {
  const t0 = performance.now();
  const tick = (now) => (fn(now - t0) ? resolve() : requestAnimationFrame(tick));
  requestAnimationFrame(tick);
});

async function runBeans(target) {
  const beans = makeBeans();
  beanCanvas.style.display = "block";

  const fallEnd = Math.max(...beans.map((b) => b.spawn + Math.sqrt((2 * (b.ty + 50)) / BEAN_G) * 1000));
  await frames((t) => {
    let landed = 0;
    drawBeans(beans, (b) => {
      const dt = (t - b.spawn) / 1000;
      if (dt < 0) return null;
      const y = -50 + 0.5 * BEAN_G * dt * dt;
      if (y >= b.ty) { landed++; return b.ty; }
      return y;
    }, Math.min(1, landed / (beans.length * 0.8)));
    return t > fallEnd;
  });

  drawBeans(beans, (b) => b.ty, 1);
  activate(target);
  await sleep(220);

  const leaveEnd = Math.max(...beans.map((b) => b.leave + Math.sqrt((2 * (780 - b.ty)) / BEAN_G) * 1000));
  await frames((t) => {
    let resting = 0;
    drawBeans(beans, (b) => {
      const dt = (t - b.leave) / 1000;
      if (dt < 0) { resting++; return b.ty; }
      const y = b.ty + 0.5 * BEAN_G * dt * dt;
      return y > 780 ? null : y;
    }, resting / beans.length);
    return t > leaveEnd;
  });

  bctx.clearRect(0, 0, 2560, 1440);
  beanCanvas.style.display = "none";
}

const showToast = (text) => {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
};

// T locks one transition; pressing again moves to the next, and after the last it returns to auto-cycle
const cycleTransitionMode = () => {
  const i = fixedTransition ? ALL_TRANSITIONS.indexOf(fixedTransition) + 1 : 0;
  fixedTransition = i < ALL_TRANSITIONS.length ? ALL_TRANSITIONS[i] : null;
  showToast(fixedTransition ? `Transition: ${TRANSITION_LABELS[fixedTransition]}` : "Transition: auto-cycle");
};

/* ───────── Coffee-ripple transition driver ───────── */

const go = async (target, origin) => {
  target = Math.max(0, Math.min(slides.length - 1, target));
  if (busy) { pending = { target, origin }; return; }
  if (target === current) return;
  if (current < 0 || reduceMotion) { activate(target); return; }

  busy = true;
  const dir = target > current ? 1 : -1;
  const [x, y] = origin || (dir > 0 ? [1180, 640] : [100, 640]);
  const tagged = slides[target].dataset.transition;
  const name = fixedTransition || tagged || TRANSITION_ORDER[tCount++ % TRANSITION_ORDER.length];

  if (name === "blinds") await runBlinds(target);
  else if (name === "book") await runBook(target);
  else if (name === "beans") await runBeans(target);
  else await runWipe(name, x, y, target);

  busy = false;
  if (pending) {
    const next = pending;
    pending = null;
    go(next.target, next.origin);
  }
};

/* ───────── Navigation ───────── */

$("prevBtn").addEventListener("click", (e) => go(current - 1, toDeck(e)));
$("nextBtn").addEventListener("click", (e) => go(current + 1, toDeck(e)));
$("fullBtn").addEventListener("click", toggleFullscreen);
$("fxBtn").addEventListener("click", cycleTransitionMode);
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
  else if (key.toLowerCase() === "t") cycleTransitionMode();
});

deck.addEventListener("click", (event) => {
  if (event.target.closest("a, button, [data-item], [data-copy], .rail")) return;
  const left = event.clientX < window.innerWidth / 3;
  go(current + (left ? -1 : 1), toDeck(event));
});

let touchX = null;
deck.addEventListener("touchstart", (event) => { touchX = event.touches[0].clientX; }, { passive: true });
deck.addEventListener("touchend", (event) => {
  if (touchX === null) return;
  const dx = event.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1), toDeck(event.changedTouches[0]));
  touchX = null;
});

let hudTimer = 0;
document.addEventListener("mousemove", () => {
  document.body.classList.add("show-hud");
  clearTimeout(hudTimer);
  hudTimer = setTimeout(() => document.body.classList.remove("show-hud"), 1800);
});

/* ───────── Interactive groups (hover / focus / click to switch) ───────── */

document.querySelectorAll("[data-hover-group]").forEach((group) => {
  const items = [...group.querySelectorAll("[data-item]")];
  const stage = group.parentElement.querySelectorAll("[data-for]");
  const set = (i) => {
    items.forEach((item, k) => item.classList.toggle("on", k === i));
    stage.forEach((fig) => fig.classList.toggle("on", Number(fig.dataset.for) === i));
  };
  items.forEach((item, i) => {
    item.addEventListener("mouseenter", () => set(i));
    item.addEventListener("focus", () => set(i));
    item.addEventListener("click", (event) => { event.stopPropagation(); set(i); });
  });
  set(0);
});

/* Click a color band to copy its hex */
document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", async (event) => {
    event.stopPropagation();
    const hex = el.dataset.copy;
    try { await navigator.clipboard?.writeText(hex); } catch (_) { /* clipboard may be blocked */ }
    showToast(`Copied ${hex}`);
  });
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

/* ───────── Pointer effects: tilt, parallax, line sway ───────── */

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

  slide.querySelectorAll(".tilt").forEach((el) => {
    el.style.setProperty("--rx", `${(-ny * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(nx * 9).toFixed(2)}deg`);
  });

  slide.querySelectorAll("[data-depth]").forEach((el) => {
    const d = Number(el.dataset.depth);
    el.style.translate = `${(-nx * d).toFixed(1)}px ${(-ny * d).toFixed(1)}px`;
  });
};

function resetTilts() {
  clothesline?.style.setProperty("--sway-x", "0deg");
  clothesline?.style.setProperty("--sway-y", "0deg");
  deck.querySelectorAll(".tilt").forEach((el) => {
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  });
  deck.querySelectorAll("[data-depth]").forEach((el) => { el.style.translate = ""; });
}

deck.addEventListener("pointermove", onPointerMove);
deck.addEventListener("pointerleave", resetTilts);

/* ───────── Coffee-ring cursor ───────── */

let cx = -100, cy = -100, tx = -100, ty = -100;
document.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
  tx = event.clientX;
  ty = event.clientY;
  cursor.style.opacity = "1";
  cursor.classList.toggle("big", !!event.target.closest?.("a, button, [data-item], [data-copy]"));
});
document.documentElement.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
const cursorLoop = () => {
  cx += (tx - cx) * 0.22;
  cy += (ty - cy) * 0.22;
  cursor.style.transform = `translate(${cx}px, ${cy}px)`;
  requestAnimationFrame(cursorLoop);
};
if (!reduceMotion) cursorLoop();

/* ───────── Boot ───────── */

window.addEventListener("resize", fit);
window.addEventListener("hashchange", () => go(Number(location.hash.slice(1)) - 1 || 0));

fit();
go(Number(location.hash.slice(1)) - 1 || 0);