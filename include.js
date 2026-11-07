// Loads each <div data-include="sections/…"> from its own file, then starts script.js.
// The site must be opened through a web server (e.g. VS Code Live Server); browsers block fetch() on file://.
(async () => {
  const slots = [...document.querySelectorAll("[data-include]")];
  let failed = false;

  const bust = "v=10";
  const html = await Promise.all(
    slots.map((slot) =>
      fetch(`${slot.dataset.include}?${bust}`)
        .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
        .catch(() => {
          failed = true;
          return "";
        })
    )
  );
  slots.forEach((slot, i) => {
    slot.outerHTML = html[i];
  });

  if (failed) {
    const notice = document.createElement("p");
    notice.className = "include-error";
    notice.textContent =
      "Some sections could not be loaded. Open this site through a web server (for example, VS Code Live Server) instead of double-clicking index.html.";
    document.getElementById("top")?.prepend(notice);
  }

  const script = document.createElement("script");
  script.src = "script.js?v=6";
  script.onload = () => {
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    target?.scrollIntoView({ behavior: "instant" });
  };
  document.body.appendChild(script);
})();
