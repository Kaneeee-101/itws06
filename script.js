(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.getElementById("loader");
  const loaderStatus = document.getElementById("loaderStatus");
  let pageReady = document.readyState === "complete";
  if (!pageReady) window.addEventListener("load", () => { pageReady = true; }, { once: true });
  const closeLoader = () => {
    document.getElementById("hero")?.classList.add("play");
    if (!loader || loader.classList.contains("done")) return;
    loader.style.setProperty("--pour", "100");
    loader.setAttribute("aria-valuenow", "100");
    if (loaderStatus) loaderStatus.textContent = "Ready";
    loader.classList.add("done");
    document.body.classList.remove("loading");
  };
  const pourStarted = performance.now();
  const pourDuration = reduce ? 280 : 2800;
  let shown = 8;
  let last = pourStarted;
  let stage = "";
  let posted = -1;
  let fullAt = 0;
  let held = false;
  let blendFrom = 8;
  let blendStart = 0;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
  const pourTick = (now) => {
    if (!loader || loader.classList.contains("done")) return;
    const dt = Math.min(34, now - last);
    last = now;
    const elapsed = now - pourStarted;
    const images = document.images;
    let complete = 0;
    for (let i = 0; i < images.length; i += 1) if (images[i].complete) complete += 1;
    const resource = images.length ? complete / images.length : 1;
    const curve = 8 + ease(Math.min(1, elapsed / pourDuration)) * 92;
    const cap = 82 + resource * 10;
    if (!pageReady && curve > cap) {
      held = true;
      blendStart = 0;
      shown += (cap - shown) * (1 - Math.exp(-dt / 240));
    } else if (held) {
      if (!blendStart) {
        blendStart = now;
        blendFrom = shown;
      }
      const blend = Math.min(1, (now - blendStart) / 560);
      shown = blendFrom + (curve - blendFrom) * ease(blend);
      if (blend >= 1) held = false;
    } else {
      shown = curve;
    }
    if (pageReady && elapsed >= pourDuration && shown > 99.6) shown = 100;
    const pct = Math.round(shown);
    const next = pct < 34 ? "Opening the page" : pct < 68 ? "Pouring" : pct < 100 ? "Almost ready" : "Ready";
    loader.style.setProperty("--pour", shown.toFixed(2));
    if (pct !== posted) {
      posted = pct;
      loader.setAttribute("aria-valuenow", String(pct));
    }
    if (loaderStatus && next !== stage) {
      stage = next;
      loaderStatus.textContent = next;
      loaderStatus.classList.remove("tick");
      void loaderStatus.offsetWidth;
      loaderStatus.classList.add("tick");
    }
    if (shown >= 100 && pageReady) {
      if (!fullAt) fullAt = now;
      if (now - fullAt > (reduce ? 80 : 420)) {
        closeLoader();
        return;
      }
    }
    if (elapsed > (reduce ? 700 : 5600)) {
      closeLoader();
      return;
    }
    requestAnimationFrame(pourTick);
  };
  requestAnimationFrame(pourTick);
  setTimeout(closeLoader, reduce ? 700 : 6200);
  const dial = document.querySelector(".dial");
  const navLinks = document.getElementById("navLinks");
  const menuBtn = document.getElementById("menuBtn");
  const toast = document.getElementById("toast");
  const toTop = document.getElementById("toTop");

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
  };

  const setScroll = (y) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    dial?.style.setProperty("--scroll", String(ratio));
    toTop?.classList.toggle("show", y > 500);
  };

  let riseObserver = null;
  const armRise = (el, kind, delay) => {
    el.classList.remove("rise", "rise-left", "rise-right", "pop-left", "pop-right", "in");
    el.classList.add(kind);
    el.style.animationDelay = delay || "0s";
    if (reduce) {
      el.classList.add("in");
      return;
    }
    if (!riseObserver) {
      riseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          riseObserver.unobserve(entry.target);
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -32px 0px" });
    }
    riseObserver.observe(el);
  };

  const stampGroup = (selector, kind) => {
    const fresh = [...document.querySelectorAll(selector)].filter((el) => !el.dataset.rise);
    const groups = new Map();
    fresh.forEach((el) => {
      const list = groups.get(el.parentElement) || [];
      list.push(el);
      groups.set(el.parentElement, list);
    });
    groups.forEach((list) => {
      list.forEach((el, index) => {
        el.dataset.rise = kind;
        armRise(el, kind, `${Math.min(index, 5) * 0.1}s`);
      });
    });
  };

  const initRises = () => {
    [
      ["#storyPhoto", "rise-left"],
      ["#concept .split > div > *", "rise"],
      [".section-head > *", "rise"],
      [".space-grid figure", "rise"],
      [".zones li", "rise"],
      [".offer-row article", "rise"],
      ["#menu .card", "rise"],
      [".owner", "rise"],
      ["#logoSteps .step", "rise"],
      ["#postPair .artwork", "rise-left"],
      ["#postPair .specs > *", "rise"],
      [".engagement-shot", "rise"],
      [".cards figure", "rise"],
      ["#posterPair .specs > *", "rise"],
      ["#posterPair .artwork", "rise-right"],
      [".visit-grid > *", "rise"],
      [".form > *", "rise"],
    ].forEach(([selector, kind]) => stampGroup(selector, kind));
  };

  let scrollQueued = false;
  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      setScroll(window.scrollY);
    });
  }, { passive: true });

  const sectionLinks = [...document.querySelectorAll('nav[aria-label="Page"] a')];
  const watched = sectionLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (watched.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        sectionLinks.forEach((link) => link.classList.toggle("here", link.getAttribute("href") === id));
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    watched.forEach((section) => spy.observe(section));
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      navLinks?.classList.remove("open");
      menuBtn?.setAttribute("aria-expanded", "false");
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "auto" });
    });
  });

  menuBtn?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  const data = window.SITE_DATA;
  const filters = document.getElementById("filters");
  const menu = document.getElementById("menu");
  let active = "books";

  const renderMenu = () => {
    if (!data || !menu) return;
    menu.innerHTML = data.menu
      .filter((item) => item.category === active)
      .map((item) => {
        const desc = item.description ? `<p>${item.description}</p>` : "";
        const img = item.image
          ? `<img src="${item.image}" alt="${item.name}" data-zoom />`
          : "";
        return `<article class="card">${img}<h3>${item.name}</h3>${desc}<p class="price">₱${item.price}</p></article>`;
      })
      .join("");
    stampGroup("#menu .card", "rise");
  };

  if (data && filters) {
    filters.innerHTML = data.menuCategories
      .map((cat) => `<button type="button" role="tab" data-cat="${cat.id}" aria-selected="${cat.id === active}">${cat.label}</button>`)
      .join("");
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cat]");
      if (!button) return;
      active = button.dataset.cat;
      filters.querySelectorAll("[data-cat]").forEach((el) => {
        el.setAttribute("aria-selected", String(el === button));
      });
      renderMenu();
    });
    renderMenu();
  }

  const cube = document.getElementById("logoCube");
  let cubeTurn = 0;
  const cubeFace = () => ((cubeTurn % 4) + 4) % 4;
  const fitCube = () => {
    if (!cube) return;
    cube.style.setProperty("--depth", String(cube.offsetWidth / 2));
  };
  fitCube();
  window.addEventListener("resize", fitCube);
  if (cube && window.ResizeObserver) new ResizeObserver(fitCube).observe(cube);

  const parts = ["Sketch", "Badge", "Book", "Cup", "Steam", "Name", "Year", "Ring"];
  const trackAt = (now) => parts.map((name, index) => [name, index < now ? "done" : index === now ? "now" : ""]);
  const sketchSheets = {
    mark: {
      kicker: "Sketch 01",
      title: "Mark sketch",
      lede: "The pencil drawing of the whole idea, before any piece is drawn solid.",
      src: "assets/logos/sketch-mark.png",
      alt: "Sketch of the pictorial mark",
      stage: "",
      track: trackAt(0),
      notes: [
        ["Whole idea", "Cup, book, name, year, leaf, tagline, and the coffee ring are still one pencil drawing.", "mark", "all"],
        ["Next", "The badge sketch letters the name on the mug. Later sheets read each part off these two drawings.", "mark", "icon"]
      ]
    },
    badge: {
      kicker: "Sketch 02",
      title: "Badge sketch",
      lede: "The name moves onto the mug so the icon can be read at a small size.",
      src: "assets/logos/sketch-badge.png",
      alt: "Sketch of the badge lockup",
      stage: "",
      track: trackAt(1),
      notes: [
        ["Name on the mug", "Pages & Pour is lettered on the cup.", "badge", "name"],
        ["Book", "The mug sits on a closed book, the Pages half.", "badge", "book"],
        ["Steam", "Steam rises from the cup, the Pour half.", "badge", "steam"],
        ["Bookmark", "A bookmark ribbon comes out of the book.", "badge", "bookmark"]
      ]
    },
    book: {
      kicker: "Part 03",
      title: "The book",
      lede: "Pages, in pencil. The badge sketch draws the book large. The mark sketch draws the same book inside the ring.",
      src: "assets/logos/sketch-badge.png",
      alt: "Badge sketch",
      stage: "pencil",
      focus: "badge",
      track: trackAt(2),
      notes: [
        ["Book", "In the badge sketch, the mug sits on a closed book. That book is the Pages half.", "badge", "book"],
        ["Bookmark", "A ribbon comes out of the right side of the book.", "badge", "bookmark"],
        ["Mark sketch", "The same book is drawn smaller, inside the coffee ring.", "mark", "icon"]
      ]
    },
    pour: {
      kicker: "Part 04",
      title: "Cup and steam",
      lede: "Pour, in pencil. The badge sketch sets the mug on the book, with the name on the cup and steam above it.",
      src: "assets/logos/sketch-badge.png",
      alt: "Badge sketch",
      stage: "pencil",
      focus: "badge",
      track: parts.map((name, index) => [name, index < 3 ? "done" : index === 3 || index === 4 ? "now" : ""]),
      notes: [
        ["Cup", "The badge sketch draws the mug on the book. Pour is the cup.", "badge", "cup"],
        ["Name on the mug", "Pages & Pour is lettered on the cup.", "badge", "name"],
        ["Steam", "Three pencil lines rise off the cup.", "badge", "steam"],
        ["Mark sketch", "The mark sketch repeats the cup, smaller, above the wordmark.", "mark", "icon"]
      ]
    },
    name: {
      kicker: "Part 05",
      title: "Name and year",
      lede: "Both sketches carry the name. The mark sketch sets the wordmark, EST. 2026, and the leaf. The badge sketch letters it on the mug.",
      src: "assets/logos/sketch-mark.png",
      alt: "Mark sketch",
      stage: "pencil",
      focus: "both",
      track: parts.map((name, index) => [name, index < 5 ? "done" : index === 5 || index === 6 ? "now" : ""]),
      notes: [
        ["Wordmark", "On the mark sketch, Pages & Pour sits under the icon.", "mark", "word"],
        ["Est. 2026", "The year is centered under the name.", "mark", "year"],
        ["Leaf divider", "A small leafy branch sits beside the year.", "mark", "leaf"],
        ["Badge sketch", "The same name is lettered on the mug.", "badge", "name"]
      ]
    },
    ring: {
      kicker: "Part 06",
      title: "Coffee ring",
      lede: "The ring is the pencil frame on the mark sketch. The badge sketch is the icon drawn inside it.",
      src: "assets/logos/sketch-mark.png",
      alt: "Mark sketch",
      stage: "pencil",
      focus: "mark",
      track: trackAt(7),
      notes: [
        ["Coffee ring", "On the mark sketch, the open ring frames the drawing. It is the stain left on a page after a long sit.", "mark", "ring"],
        ["Tagline", "One Place. Every Page. Every Pour. follows the top of the ring.", "mark", "tag"],
        ["Badge sketch", "The badge sketch is the icon inside that ring: cup, book, steam, and bookmark.", "badge", "icon"]
      ]
    }
  };
  const sheetKicker = document.getElementById("sheetKicker");
  const sheetTitle = document.getElementById("sheetTitle");
  const sheetLede = document.getElementById("sheetLede");
  const sheetImg = document.getElementById("sheetImg");
  const sheetNotes = document.getElementById("sheetNotes");
  const partTrack = document.getElementById("partTrack");
  const spots = {
    badge: {
      steam: { x: 45, y: 29, z: 1.85, w: 46, h: 42 },
      cup: { x: 46, y: 51, z: 1.8, w: 54, h: 46 },
      name: { x: 46, y: 50, z: 2.15, w: 42, h: 30 },
      book: { x: 46, y: 73, z: 1.8, w: 82, h: 26 },
      bookmark: { x: 78, y: 76, z: 2.6, w: 20, h: 18 },
      icon: { x: 48, y: 52, z: 1.45, w: 78, h: 64 }
    },
    mark: {
      all: { x: 48, y: 50, z: 1.18, w: 82, h: 70, round: true },
      icon: { x: 50, y: 38, z: 2.2, w: 34, h: 24 },
      word: { x: 47, y: 51, z: 1.72, w: 76, h: 32 },
      year: { x: 50, y: 67, z: 2.55, w: 38, h: 12 },
      leaf: { x: 50, y: 75, z: 2.25, w: 46, h: 14 },
      tag: { x: 58, y: 18, z: 2.05, w: 50, h: 16 },
      ring: { x: 48, y: 50, z: 1.2, w: 80, h: 68, round: true }
    }
  };
  const resetFrame = (frame) => {
    if (!frame) return;
    frame.style.setProperty("--z", "1");
    frame.style.setProperty("--ox", "50%");
    frame.style.setProperty("--oy", "50%");
    const spot = frame.querySelector(".spot");
    if (spot) spot.hidden = true;
  };
  const showSpot = (frame, spot) => {
    if (!frame || !spot) return;
    frame.style.setProperty("--z", String(spot.z));
    frame.style.setProperty("--ox", `${spot.x}%`);
    frame.style.setProperty("--oy", `${spot.y}%`);
    const ring = frame.querySelector(".spot");
    if (!ring) return;
    ring.hidden = false;
    ring.style.width = `${spot.w}%`;
    ring.style.height = `${spot.h}%`;
    ring.style.borderRadius = spot.round ? "50%" : "14px";
  };
  let explainTimer = 0;
  let explainIndex = 0;
  const stopExplain = () => {
    window.clearInterval(explainTimer);
    explainTimer = 0;
  };
  const focusNote = (item) => {
    if (!item || !sheetNotes) return;
    [...sheetNotes.children].forEach((el) => el.classList.toggle("now", el === item));
    const spot = spots[item.dataset.sketch]?.[item.dataset.part];
    const figure = sheetImg?.closest("figure");
    if (!figure || !spot) return;
    if (figure.dataset.stage === "pencil") {
      resetFrame(figure.querySelector(".pencil.badge .zoom-frame"));
      resetFrame(figure.querySelector(".pencil.mark .zoom-frame"));
      showSpot(figure.querySelector(`.pencil.${item.dataset.sketch} .zoom-frame`), spot);
      figure.dataset.focus = item.dataset.sketch;
      return;
    }
    showSpot(document.getElementById("sheetFrame"), spot);
  };
  const startExplain = () => {
    stopExplain();
    if (reduce || !sheetNotes || sheetNotes.children.length < 2) return;
    explainTimer = window.setInterval(() => {
      const items = [...sheetNotes.children];
      if (!items.length) return;
      explainIndex = (explainIndex + 1) % items.length;
      focusNote(items[explainIndex]);
    }, 3200);
  };
  const showSheet = (key) => {
    const data = sketchSheets[key];
    if (!data || !sheetImg) return;
    sheetKicker.textContent = data.kicker;
    sheetTitle.textContent = data.title;
    sheetLede.textContent = data.lede;
    sheetImg.src = data.src;
    sheetImg.alt = data.alt;
    const figure = sheetImg.closest("figure");
    if (figure) {
      figure.dataset.stage = data.stage || "";
      figure.dataset.focus = data.focus || "";
    }
    partTrack?.replaceChildren();
    (data.track || []).forEach(([name, state]) => {
      const item = document.createElement("li");
      item.textContent = name;
      if (state) item.className = state;
      partTrack?.append(item);
    });
    sheetNotes.replaceChildren();
    data.notes.forEach(([name, text, sketch, part]) => {
      const item = document.createElement("li");
      const label = document.createElement("b");
      const copy = document.createElement("span");
      label.textContent = name;
      copy.textContent = text;
      item.dataset.sketch = sketch || "";
      item.dataset.part = part || "";
      item.append(label, copy);
      sheetNotes.append(item);
    });
    document.querySelectorAll(".sheet-step").forEach((step) => {
      step.classList.toggle("active", step.dataset.sheet === key);
    });
    explainIndex = 0;
    focusNote(sheetNotes.firstElementChild);
    startExplain();
  };
  document.getElementById("sketchView")?.addEventListener("click", (event) => {
    const note = event.target.closest(".sheet-notes li");
    if (note) {
      explainIndex = [...sheetNotes.children].indexOf(note);
      stopExplain();
      focusNote(note);
      return;
    }
    const step = event.target.closest(".sheet-step");
    if (!step) return;
    showSheet(step.dataset.sheet);
  });
  sheetNotes?.addEventListener("pointerover", (event) => {
    const note = event.target.closest("li");
    if (!note || !sheetNotes.contains(note)) return;
    stopExplain();
    focusNote(note);
  });
  sheetNotes?.addEventListener("pointerleave", () => startExplain());
  showSheet("mark");
  document.getElementById("sheetZoom")?.addEventListener("click", () => {
    const figure = sheetImg?.closest("figure");
    if (figure?.dataset.stage === "pencil") {
      const pick = figure.dataset.focus === "badge" ? ".pencil.badge img" : ".pencil.mark img";
      figure.querySelector(pick)?.click();
      return;
    }
    sheetImg?.click();
  });

  document.getElementById("logoSteps")?.addEventListener("click", (event) => {
    const step = event.target.closest(".step");
    if (!step || !cube) return;
    const steps = [...document.querySelectorAll("#logoSteps .step")];
    const next = steps.indexOf(step);
    if (next < 0) return;
    steps.forEach((el) => el.classList.toggle("active", el === step));
    let delta = next - cubeFace();
    if (delta > 2) delta -= 4;
    if (delta < -2) delta += 4;
    cubeTurn += delta;
    cube.style.setProperty("--turn", String(cubeTurn));
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      const row = button.closest(".dot-row");
      if (row) {
        const side = row.querySelector(".color-side");
        const swatch = side.querySelector(".color-side-swatch");
        const label = side.querySelector(".color-side-label");
        row.querySelectorAll(".dots button").forEach((el) => el.classList.toggle("active", el === button));
        swatch.style.background = value;
        label.innerHTML = `${button.dataset.name || "Color"}<br><small>${value}</small>`;
        side.hidden = true;
        void side.offsetWidth;
        side.hidden = false;
      }
      try {
        await navigator.clipboard.writeText(value);
        if (!row) showToast(`Copied ${value}`);
      } catch {
        if (!row) showToast("Could not copy");
      }
    });
  });

  document.getElementById("copyCaption")?.addEventListener("click", async () => {
    const text = document.getElementById("captionText")?.textContent?.trim() || "";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Caption copied");
    } catch {
      showToast("Could not copy");
    }
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  let scrollY = 0;

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    scrollY = window.scrollY;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (typeof lightbox.showModal === "function") lightbox.showModal();
  };

  document.addEventListener("click", (event) => {
    const img = event.target.closest("[data-zoom]");
    if (!img) return;
    openLightbox(img.currentSrc || img.src, img.alt);
  });

  document.getElementById("lightboxClose")?.addEventListener("click", () => lightbox?.close());
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox?.addEventListener("close", () => {
    const y = scrollY;
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "instant" });
    });
  });

  document.querySelectorAll(".owner-links > *").forEach((icon) => {
    icon.addEventListener("click", () => {
      icon.classList.remove("pop");
      void icon.offsetWidth;
      icon.classList.add("pop");
    });
  });

  document.getElementById("contactForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
      form.reportValidity();
      return;
    }
    const status = document.getElementById("formStatus");
    if (status) status.textContent = "Noted on this page only. Nothing was sent.";
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.classList.add("saved");
      const label = button.textContent;
      button.textContent = "Saved";
      setTimeout(() => {
        button.textContent = label;
        button.classList.remove("saved");
      }, 1400);
    }
    form.reset();
  });

  const look = document.getElementById("look");
  if (look && !reduce) {
    const room = look.querySelector(".look-room");
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let inside = false;
    let running = true;
    let seen = false;
    let looping = false;
    const aim = (event) => {
      const rect = look.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      inside = true;
    };
    look.addEventListener("pointermove", (event) => {
      aim(event);
      startRoom();
    });
    look.addEventListener("pointerleave", () => {
      inside = false;
      startRoom();
    });
    window.addEventListener("deviceorientation", (event) => {
      if (event.gamma == null || inside) return;
      tx = Math.max(-1, Math.min(1, event.gamma / 28));
      ty = Math.max(-1, Math.min(1, ((event.beta || 0) - 45) / 34));
    });
    let last = 0;
    const frame = (now) => {
      if (!running || !seen) {
        looping = false;
        last = 0;
        return;
      }
      const dt = last ? Math.min(40, now - last) : 16;
      last = now;
      const glide = 1 - Math.exp(-dt / 240);
      const goalX = inside ? tx : 0;
      const goalY = inside ? ty : 0;
      x += (goalX - x) * glide;
      y += (goalY - y) * glide;
      const moving = Math.abs(goalX - x) > 0.006 || Math.abs(goalY - y) > 0.006;
      room.style.transform = `rotateX(${(-8 - y * 10).toFixed(2)}deg) rotateY(${(x * 18).toFixed(2)}deg)`;
      if (!inside && !moving) {
        looping = false;
        last = 0;
        return;
      }
      requestAnimationFrame(frame);
    };
    const startRoom = () => {
      if (looping || !seen || !running) return;
      looping = true;
      requestAnimationFrame(frame);
    };
    new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      if (seen) startRoom();
    }, { rootMargin: "160px" }).observe(look);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) running = false;
      else {
        running = true;
        startRoom();
      }
    });
  }

  const live = document.getElementById("live");
  const hero = document.getElementById("hero");
  if (live && hero && !reduce) {
    const ctx = live.getContext("2d");
    const pointer = { x: 0.32, y: 0.42, tx: 0.32, ty: 0.42 };
    const motes = Array.from({ length: 8 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 8 + Math.random() * 18,
      s: 0.12 + Math.random() * 0.28,
      p: Math.random() * Math.PI * 2
    }));
    const steams = [
      { x: 0.2, y: 0.58, h: 0.3 },
      { x: 0.74, y: 0.52, h: 0.28 }
    ];
    let viewW = 0;
    let viewH = 0;
    let last = 0;
    const fitLive = () => {
      const rect = hero.getBoundingClientRect();
      const dpr = 1;
      viewW = rect.width;
      viewH = rect.height;
      live.width = Math.max(1, Math.floor(viewW * dpr));
      live.height = Math.max(1, Math.floor(viewH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fitLive();
    window.addEventListener("resize", fitLive);
    window.addEventListener("pointermove", (event) => {
      if (!heroSeen) return;
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = (event.clientY - rect.top) / rect.height;
    });
    let painting = true;
    let heroSeen = true;
    let queued = false;
    const queuePaint = () => {
      if (queued || !painting || !heroSeen) return;
      queued = true;
      requestAnimationFrame((now) => {
        queued = false;
        paint(now);
      });
    };
    const paint = (now) => {
      if (!painting || !heroSeen) return;
      const dt = last ? Math.min(40, now - last) : 16;
      last = now;
      const glide = 1 - Math.exp(-dt / 220);
      const seconds = now * 0.001;
      pointer.x += (pointer.tx - pointer.x) * glide;
      pointer.y += (pointer.ty - pointer.y) * glide;
      ctx.clearRect(0, 0, viewW, viewH);
      const gx = pointer.x * viewW;
      const gy = pointer.y * viewH;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(viewW, viewH) * 0.34);
      glow.addColorStop(0, "rgba(184, 121, 74, 0.42)");
      glow.addColorStop(0.45, "rgba(184, 121, 74, 0.12)");
      glow.addColorStop(1, "rgba(184, 121, 74, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(107, 62, 46, 0.55)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(gx, gy, 78, 0.55, Math.PI * 1.72);
      ctx.stroke();
      ctx.strokeStyle = "rgba(78, 42, 30, 0.35)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(gx, gy, 68, 0.55, Math.PI * 1.72);
      ctx.stroke();
      [[92, -18, 9], [108, 24, 5], [-96, 30, 6], [18, -88, 4]].forEach(([dx, dy, r], index) => {
        ctx.beginPath();
        ctx.fillStyle = index % 2 ? "rgba(107, 62, 46, 0.55)" : "rgba(184, 121, 74, 0.7)";
        ctx.arc(gx + dx, gy + dy, r, 0, Math.PI * 2);
        ctx.fill();
      });
      steams.forEach((steam, index) => {
        const baseX = steam.x * viewW + (pointer.x - 0.5) * 48;
        const baseY = steam.y * viewH;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(107, 62, 46, 0.38)";
        ctx.lineWidth = 3;
        let px = baseX;
        let py = baseY;
        ctx.moveTo(px, py);
        for (let step = 1; step <= 8; step += 1) {
          const t = step / 8;
          const y = baseY - t * steam.h * viewH * 0.55;
          const x = baseX
            + Math.sin(seconds * 1.35 + t * 5 + index) * (8 + t * 18)
            + (pointer.x - steam.x) * t * 70;
          const mx = (px + x) / 2;
          const my = (py + y) / 2;
          ctx.quadraticCurveTo(px, py, mx, my);
          px = x;
          py = y;
        }
        ctx.lineTo(px, py);
        ctx.stroke();
      });
      motes.forEach((mote, index) => {
        mote.y -= mote.s * dt * 0.00024;
        mote.p += dt * 0.00115;
        if (mote.y < -0.08) {
          mote.y = 1.06;
          mote.x = Math.random();
        }
        const mx = mote.x * viewW + Math.sin(mote.p) * 16 + (pointer.x - 0.5) * 70;
        const my = mote.y * viewH + (pointer.y - 0.5) * 24;
        ctx.beginPath();
        ctx.fillStyle = index % 2 ? "rgba(107, 62, 46, 0.28)" : "rgba(184, 121, 74, 0.4)";
        ctx.arc(mx, my, mote.r, 0, Math.PI * 2);
        ctx.fill();
      });
      queuePaint();
    };
    new IntersectionObserver(([entry]) => {
      heroSeen = entry.isIntersecting;
      if (heroSeen) queuePaint();
    }).observe(hero);
    document.addEventListener("visibilitychange", () => {
      painting = !document.hidden;
      if (painting) queuePaint();
    });
    queuePaint();
  }

  if (!reduce) {
    const loupe = document.getElementById("loupe");
    const glass = loupe?.querySelector("img");
    const size = 144;
    const zoom = 2.35;
    if (loupe && glass) {
      const place = (frame, event) => {
        const img = frame.querySelector("img");
        const rect = frame.getBoundingClientRect();
        if (!img || !rect.width || !rect.height) return;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (glass.src !== img.currentSrc && glass.src !== img.src) glass.src = img.currentSrc || img.src;
        glass.style.width = `${rect.width}px`;
        glass.style.height = `${rect.height}px`;
        glass.style.transform = `translate(${(size / 2 - x * zoom).toFixed(1)}px, ${(size / 2 - y * zoom).toFixed(1)}px) scale(${zoom})`;
        loupe.style.left = `${event.clientX}px`;
        loupe.style.top = `${event.clientY}px`;
        loupe.hidden = false;
        frame.classList.add("is-looking");
      };
      document.querySelectorAll(".space-grid .frame").forEach((frame) => {
        frame.addEventListener("pointerenter", (event) => place(frame, event));
        frame.addEventListener("pointermove", (event) => place(frame, event));
        frame.addEventListener("pointerleave", () => {
          loupe.hidden = true;
          frame.classList.remove("is-looking");
        });
      });
    }
  }

  initRises();
  setScroll(window.scrollY);
})();
