/* COPB2.org — language switcher for the static per-language site.
   Each language is its own folder (/es/, /zh/, ...); English is the root.
   This builds a picker that NAVIGATES to the same page in the chosen
   language. No text-swapping (content is baked into each static page). */
(function () {
  "use strict";
  var LANGS = [
    ["en","English"],["zh","中文"],["es","Español"],["fr","Français"],["ja","日本語"]
  ];
  var CODES = {}; LANGS.forEach(function (l) { CODES[l[0]] = 1; });

  var segs = location.pathname.split("/").filter(Boolean);
  var page = "index.html", cur = "en";
  if (segs.length) {
    var last = segs[segs.length - 1];
    if (last.indexOf(".") !== -1) {
      page = last;
      var prev = segs[segs.length - 2];
      if (prev && CODES[prev] && prev !== "en") cur = prev;
    } else if (CODES[last] && last !== "en") {
      cur = last; // directory URL like /es/
    }
  }

  var nav = document.querySelector(".site-header .nav");
  if (nav) {
    var wrap = document.createElement("div");
    wrap.className = "langswitch";
    var sel = document.createElement("select");
    sel.setAttribute("aria-label", "Choose language");
    LANGS.forEach(function (l) {
      var o = document.createElement("option");
      o.value = l[0]; o.textContent = l[1];
      if (l[0] === cur) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      var L = this.value;
      var prefix = (cur === "en") ? "" : "../";
      location.href = prefix + ((L === "en") ? "" : L + "/") + page;
    });
    wrap.appendChild(sel);
    var brand = nav.querySelector(".brand");
    if (brand) nav.insertBefore(wrap, brand.nextSibling); else nav.appendChild(wrap);
  }

  var st = document.createElement("style");
  st.textContent =
    ".langswitch{display:flex;align-items:center;margin-inline-start:1.25rem;margin-inline-end:auto}" +
    ".langswitch select{font:inherit;font-size:.9rem;padding:.32rem .55rem;border:1.5px solid var(--line);border-radius:999px;background:#fff;color:var(--ink);cursor:pointer;max-width:8.5rem}" +
    ".langswitch select:hover{border-color:var(--primary)}" +
    "@media(max-width:1010px){.site-header .nav__toggle{margin-left:0}}" +
    '[dir="rtl"] .nav__links{flex-direction:row-reverse}' +
    '[dir="rtl"] .breadcrumb,[dir="rtl"] .more,[dir="rtl"] .hero__quote cite{direction:rtl}';
  document.head.appendChild(st);
})();
