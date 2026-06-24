/* GeneConnect — light progressive-enhancement script.
   No dependencies, no tracking. Everything still works without JS. */
(function () {
  "use strict";

  /* ---- Mobile navigation toggle ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  // Localized labels: translated pages set data-label-open/close; English falls back.
  var openLabel = (toggle && toggle.getAttribute("data-label-open")) || "Open menu";
  var closeLabel = (toggle && toggle.getAttribute("data-label-close")) || "Close menu";

  function closeMenu() {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", openLabel);
    links.classList.remove("is-open");
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? openLabel : closeLabel);
      links.classList.toggle("is-open", !open);
    });

    // Close the menu when a link is chosen (mobile)
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });

    // Close on Escape for keyboard users
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ---- Current year in the footer ---- */
  var yearEls = document.querySelectorAll("[data-year]");
  var year = new Date().getFullYear();
  yearEls.forEach(function (el) { el.textContent = year; });

  /* ---- Research tabs: WAI-ARIA roles + keyboard (progressive enhancement) ----
     The research page ships a two-level tab widget (primary "group" tabs and
     secondary "panel" tabs) whose show/hide is wired by an inline script. Here
     we add the ARIA roles, selected state, and arrow-key navigation so assistive
     tech announces it as real tabs. Runs only where #rtabs exists. */
  var rtabs = document.getElementById("rtabs");
  if (rtabs) {
    var primaryList = rtabs.querySelector(".rtab__primary");
    var pBtns = [].slice.call(rtabs.querySelectorAll(".rtab__pbtn"));
    var secRows = [].slice.call(rtabs.querySelectorAll(".rtab__secondary"));

    pBtns.forEach(function (b) {
      var g = b.getAttribute("data-group");
      b.setAttribute("role", "tab");
      if (!b.id) b.id = "rtpb-" + g;
      var row = rtabs.querySelector('.rtab__secondary[data-group="' + g + '"]');
      if (row) {
        if (!row.id) row.id = "rtsec-" + g;
        b.setAttribute("aria-controls", row.id);
      }
    });

    secRows.forEach(function (row) {
      row.setAttribute("role", "tablist");
      var pb = rtabs.querySelector('.rtab__pbtn[data-group="' + row.getAttribute("data-group") + '"]');
      if (pb) row.setAttribute("aria-label", pb.textContent.trim());
      [].slice.call(row.querySelectorAll(".rtab__sbtn")).forEach(function (b) {
        var p = b.getAttribute("data-panel");
        b.setAttribute("role", "tab");
        if (!b.id) b.id = "rtsb-" + p;
        var panel = document.getElementById("panel-" + p);
        if (panel) {
          b.setAttribute("aria-controls", panel.id);
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", b.id);
          panel.setAttribute("tabindex", "0");
        }
      });
    });

    var syncTabs = function () {
      [primaryList].concat(secRows).forEach(function (list) {
        if (!list) return;
        [].slice.call(list.querySelectorAll('[role="tab"]')).forEach(function (b) {
          var on = b.classList.contains("is-active");
          b.setAttribute("aria-selected", on ? "true" : "false");
          b.setAttribute("tabindex", on ? "0" : "-1");
        });
      });
    };
    syncTabs();

    // The inline toggle fires on the button (target phase); this bubble-phase
    // listener runs afterwards, so is-active is already up to date.
    rtabs.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest('[role="tab"]')) syncTabs();
    });

    // Arrow / Home / End roving focus within a tablist (automatic activation).
    rtabs.addEventListener("keydown", function (e) {
      var tab = e.target.closest && e.target.closest('[role="tab"]');
      if (!tab) return;
      var list = tab.closest('[role="tablist"]');
      if (!list) return;
      var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'))
        .filter(function (t) { return t.offsetParent !== null; });
      var i = tabs.indexOf(tab);
      if (i === -1) return;
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      next.click();   // inline script shows the matching group/panel
      next.focus();
      syncTabs();
    });
  }

  /* ---- World map: instant label on hover / tap / focus ----
     The SVG dots keep a <title> for accessibility, but native SVG tooltips
     are slow on desktop and never appear on touchscreens, so add our own. */
  var mapFig = document.querySelector(".worldmap");
  if (mapFig) {
    var mapDots = mapFig.querySelectorAll(".dot");
    if (mapDots.length) {
      var tip = document.createElement("div");
      tip.className = "map-tip";
      tip.setAttribute("role", "status");
      tip.hidden = true;
      mapFig.appendChild(tip);

      var showTip = function (dot) {
        var titleEl = dot.querySelector("title");
        var label = titleEl ? titleEl.textContent : "";
        if (!label) return;
        tip.textContent = label;
        tip.hidden = false;
        var d = dot.getBoundingClientRect();
        var f = mapFig.getBoundingClientRect();
        tip.style.left = (d.left - f.left + d.width / 2) + "px";
        tip.style.top = (d.top - f.top) + "px";
      };
      var hideTip = function () { tip.hidden = true; };

      mapDots.forEach(function (dot) {
        dot.setAttribute("tabindex", "0");
        dot.setAttribute("role", "img");
        dot.addEventListener("mouseenter", function () { showTip(dot); });
        dot.addEventListener("mouseleave", hideTip);
        dot.addEventListener("focus", function () { showTip(dot); });
        dot.addEventListener("blur", hideTip);
        dot.addEventListener("click", function (e) { e.stopPropagation(); showTip(dot); });
      });

      // On touch, a tap elsewhere (or a scroll) dismisses the label
      document.addEventListener("click", function (e) {
        if (!e.target.closest || !e.target.closest(".dot")) hideTip();
      });
      window.addEventListener("scroll", hideTip, { passive: true });
    }
  }

  /* ---- Swipe left / right to move between nav pages (touch only) ----
     Progressive enhancement: a quick horizontal flick jumps to the next or
     previous page in the header-nav order. Touch events never fire from a
     mouse, so desktop pointer/keyboard use is unaffected. Honors RTL
     (Arabic) and stays within the current language folder, because the nav
     links are relative (e.g. "about.html" resolves inside /es/, /ja/, ...). */
  if (links) {
    var navAnchors = Array.prototype.slice.call(links.querySelectorAll("a"));
    var order = navAnchors.map(function (a) { return a.getAttribute("href"); });

    // Which page are we on? Prefer aria-current, fall back to the URL.
    var curIdx = -1;
    var currentLink = links.querySelector("a[aria-current]");
    if (currentLink) curIdx = navAnchors.indexOf(currentLink);
    if (curIdx === -1) {
      var here = location.pathname.split("/").pop() || "index.html";
      curIdx = order.indexOf(here);
    }

    if (curIdx !== -1 && order.length > 1) {
      var rtl = document.documentElement.getAttribute("dir") === "rtl";
      var sx = 0, sy = 0, stamp = 0, armed = false;
      var MIN_X = 60;    // decisive horizontal distance
      var MAX_OFF = 45;  // little vertical drift
      var RATIO = 1.7;   // horizontal must clearly dominate vertical
      var MAX_MS = 700;  // a flick, not a slow drag or text selection
      var EDGE = 24;     // leave the very edges to the browser's back/forward

      var blocked = function (el) {
        if (links.classList.contains("is-open")) return true; // menu open
        return !!(el.closest &&
          el.closest("a,button,select,input,textarea,label,summary"));
      };

      document.addEventListener("touchstart", function (e) {
        if (e.touches.length !== 1) { armed = false; return; }
        var t = e.touches[0];
        if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) { armed = false; return; }
        if (blocked(e.target)) { armed = false; return; }
        sx = t.clientX; sy = t.clientY; stamp = e.timeStamp; armed = true;
      }, { passive: true });

      document.addEventListener("touchend", function (e) {
        if (!armed) return;
        armed = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - sx, dy = t.clientY - sy;
        if (e.timeStamp - stamp > MAX_MS) return;
        if (Math.abs(dx) < MIN_X) return;
        if (Math.abs(dy) > MAX_OFF || Math.abs(dx) < Math.abs(dy) * RATIO) return;

        var step = dx < 0 ? 1 : -1;   // swipe left → next page
        if (rtl) step = -step;        // mirror for right-to-left layouts
        var target = curIdx + step;
        if (target < 0 || target >= order.length) return; // stop at the ends
        location.href = order[target];
      }, { passive: true });
    }
  }
})();
