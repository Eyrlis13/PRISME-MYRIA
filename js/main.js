/* Orchestration : état, source (domaines), banc optique, écran, étape 2, rubriques. */
(function () {
  var P = window.PRISME;
  var D = P.data;
  var h = P.h;
  var V = P.views;

  var state = {
    tab: "comparaisons",
    domainId: "portee-acces",
    groupId: "cmp-acces",
    slots: [],
    initial: [],
    openFace: [null, null],
    situationId: null,
    cumul: false,
    textOnly: false,
    print: false,
  };
  var app = document.getElementById("app");
  var printRoot = document.getElementById("print-root");

  function group() { return state.groupId ? P.idx.comparisons[state.groupId] : null; }
  function conceptionIndex(id) { return D.conceptions.map(function (c) { return c.id; }).indexOf(id); }

  function loadGroup(groupId, preferredConception) {
    var cmp = P.idx.comparisons[groupId];
    state.groupId = groupId;
    state.domainId = cmp.domainId;
    state.slots = cmp.configIds.map(function (id) { return { conceptionId: P.idx.configurations[id].conceptionId }; });
    if (preferredConception) state.slots[0] = { conceptionId: preferredConception };
    state.initial = state.slots.map(function (s) { return conceptionIndex(s.conceptionId); });
    state.openFace = [null, null];
    state.cumul = false;
    state.situationId = cmp.situations ? cmp.situations[0].id : null;
  }
  function loadDomain(domainId) {
    state.domainId = domainId;
    var list = P.comparisonsOfDomain(domainId);
    if (list.length) loadGroup(list[0].id);
    else { state.groupId = null; state.slots = [{ conceptionId: D.conceptions[0].id }, { conceptionId: D.conceptions[1].id }]; state.openFace = [null, null]; }
  }
  function slotsResolved() {
    var cmp = group();
    return state.slots.map(function (s) { return { conceptionId: s.conceptionId, cfg: cmp ? P.configFor(cmp, s.conceptionId) : null }; });
  }

  /* ---------- routage ---------- */
  function route() {
    var m = (location.hash || "").match(/^#\/(origine|catalogue|lexique)(?:\/(.+))?$/);
    var prev = state.tab;
    state.tab = m ? m[1] : "comparaisons";
    state.print = false;
    render();
    if (m && m[2]) {
      var target = document.getElementById(m[2]);
      if (target) { target.scrollIntoView({ block: "center" }); target.focus({ preventScroll: true }); target.classList.add("flash"); setTimeout(function () { target.classList.remove("flash"); }, 1600); }
    } else if (prev !== state.tab) window.scrollTo(0, 0);
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.textContent = "";
    [["comparaisons", "#/", "Comparer"], ["catalogue", "#/catalogue", "Catalogue"], ["lexique", "#/lexique", "Lexique"], ["origine", "#/origine", "Origine du modèle"]].forEach(function (t) {
      nav.appendChild(h("a", { href: t[1], class: "tab" + (state.tab === t[0] ? " on" : ""), "aria-current": state.tab === t[0] ? "page" : null, text: t[2] }));
    });
    nav.appendChild(h("button", { type: "button", class: "tab btnlike", id: "print-btn", text: "Imprimer", onclick: function () { if (!group()) { loadGroup("cmp-acces"); } state.tab = "comparaisons"; state.print = true; render(); window.scrollTo(0, 0); } }));
  }

  function openFromCatalogue(cmpId, conceptionId) { loadGroup(cmpId, conceptionId); location.hash = "#/"; render(); }

  /* ---------- rendu ---------- */
  function render() {
    renderNav();
    document.body.classList.toggle("print-preview", state.print);
    app.textContent = "";
    dials = []; sceneEl = null; closeDrawer(true);
    if (state.tab === "catalogue") app.appendChild(V.catalogue(openFromCatalogue));
    else if (state.tab === "lexique") app.appendChild(V.lexique());
    else if (state.tab === "origine") app.appendChild(V.origine());
    else renderComparison();
    renderPrint();
  }

  function renderPrint() {
    printRoot.textContent = "";
    if (!group() || !state.print) return;
    printRoot.appendChild(h("div", { class: "print-toolbar" },
      h("button", { type: "button", class: "btn primary", text: "Imprimer", onclick: function () { window.print(); } }),
      h("button", { type: "button", class: "btn", text: "Retour à l'application", onclick: function () { state.print = false; render(); } })));
    printRoot.appendChild(V.printView(group(), slotsResolved(), state.situationId));
  }

  /* ---------- scène optique ---------- */
  var dials = [];
  var sceneEl = null;

  function markFor(cmp, faceId, slots) {
    var a = slots[0].cfg, b = slots[1].cfg;
    if (!a || !b) return null;
    var label = P.idx.faces[faceId].label;
    if (a.id === b.id) return { sym: "=", cls: "eq", text: label + " : identique, même configuration" };
    var st = V.faceStatus(cmp, faceId);
    var sit = cmp.situations ? cmp.situations.filter(function (x) { return x.id === state.situationId; })[0] : null;
    if (st === "identique") return { sym: "=", cls: "eq", text: label + " : identique sous A et B" };
    if (st === "diffère" && faceId === "content" && sit && sit.relation === "convergence") return { sym: "≈", cls: "conv", text: label + " : formulations différentes, qui convergent dans cette situation" };
    if (st === "diffère") return { sym: "≠", cls: "neq", text: label + " : diffère entre A et B" };
    if (st === "non spécifié") return { sym: "–", cls: "na", text: label + " : non spécifié dans cet exemple" };
    return null;
  }

  function renderSourceBar(cmp) {
    var bar = h("div", { class: "source" });
    var picker = h("details", { class: "domain-picker" });
    picker.appendChild(h("summary", { "aria-label": "Domaine de critères : " + P.idx.domains[state.domainId].label + ". Changer de domaine" },
      h("span", { class: "src-k", text: "Source · domaine de critères" }),
      h("span", { class: "src-v" }, P.idx.domains[state.domainId].label, h("span", { class: "caret", "aria-hidden": "true", text: " ▾" })),
      h("span", { class: "lamp-glow", "aria-hidden": "true" })));
    var ul = h("ul", { class: "lamps" });
    D.domains.forEach(function (d) {
      var n = P.comparisonsOfDomain(d.id).length;
      var on = d.id === state.domainId;
      ul.appendChild(h("li", null, h("button", {
        type: "button", class: "lamp" + (on ? " on" : n ? " avail" : " off"), "aria-pressed": String(on), "data-domain": d.id,
        "aria-label": d.label + (n ? "" : " (non intégré à cette version)"),
        onclick: function () { loadDomain(d.id); render(); },
      }, h("span", { class: "dot", "aria-hidden": "true" }), h("span", { class: "name", text: d.label }), n ? null : h("span", { class: "off-tag", text: "non intégré" }))));
    });
    picker.appendChild(h("div", { class: "lamps-pop" }, ul));
    bar.appendChild(picker);
    return bar;
  }

  function renderComparison() {
    var cmp = group();
    var slots = slotsResolved();
    var root = h("div", { class: "compare" });

    /* titre de l'exemple + choix de lecture */
    var head = h("div", { class: "ex-head wrap" });
    var tb = h("div", { class: "ex-titlebox" });
    tb.appendChild(h("h2", { class: "ex-title", text: cmp ? cmp.title : P.idx.domains[state.domainId].label }));
    if (cmp) tb.appendChild(h("p", { class: "subtitle", text: cmp.subtitle }));
    if (cmp && cmp.kind === "contre-exemple") tb.appendChild(h("p", { class: "ce-note", id: "context-change", role: "note", text: cmp.contextChangeNotice }));
    if (cmp && cmp.contextMode === "common") {
      var ctx = P.idx.contexts[cmp.contextId];
      var cut = ctx.text.indexOf(". ");
      tb.appendChild(h("p", { class: "sit-line" },
        h("span", { class: "sit-k", text: "Situation construite" }),
        h("span", { text: cut > 0 ? ctx.text.slice(0, cut + 1) : ctx.text }),
        h("button", { type: "button", class: "link-light", id: "ctx-open", text: "Lire la suite", onclick: function () { openDrawer(contextDrawer(ctx)); } })));
    }
    if (cmp && cmp.situations) {
      tb.appendChild(h("div", { class: "sit-row" }, h("span", { class: "sit-k", text: "Situation" }), h("div", { class: "seg dark situations", role: "radiogroup", "aria-label": cmp.situationsLabel },
        cmp.situations.map(function (x) {
          var on = x.id === state.situationId;
          return h("button", { type: "button", role: "radio", "aria-checked": String(on), class: "chip" + (on ? " on" : ""), "data-situation": x.id, text: x.shortLabel || x.label, title: x.label, onclick: function () { state.situationId = x.id; render(); } });
        }))));
    }
    head.appendChild(tb);
    var tools = h("div", { class: "ex-tools" });
    var list = cmp ? P.comparisonsOfDomain(cmp.domainId) : [];
    if (list.length > 1) tools.appendChild(h("div", { class: "examples seg dark", role: "group", "aria-label": "Exemple documenté" }, list.map(function (c) {
      return h("button", { type: "button", class: "chip" + (c.id === cmp.id ? " on" : ""), "aria-pressed": String(c.id === cmp.id), text: c.kind === "contre-exemple" ? "Contre-exemples" : "Exemple principal", onclick: function () { loadGroup(c.id); render(); } });
    })));
    tools.appendChild(h("div", { class: "seg dark", role: "group", "aria-label": "Mode de lecture" },
      h("button", { type: "button", class: "chip" + (state.textOnly ? "" : " on"), id: "view-bench", "aria-pressed": String(!state.textOnly), text: "Prismes", onclick: function () { state.textOnly = false; render(); } }),
      h("button", { type: "button", class: "chip" + (state.textOnly ? " on" : ""), id: "view-text", "aria-pressed": String(state.textOnly), text: "Texte seul", onclick: function () { state.textOnly = true; render(); } })));
    head.appendChild(tools);

    var stage = h("section", { class: "optic" + (state.textOnly ? " textonly" : ""), "aria-label": "Scène optique" });
    stage.appendChild(head);
    var inner = h("div", { class: "optic-inner wrap" });
    inner.appendChild(renderSourceBar(cmp));

    if (!cmp) {
      inner.appendChild(h("div", { class: "empty", role: "status" }, h("p", { class: "ph-main", text: P.NOT_INTEGRATED }), h("p", { text: P.NOT_INTEGRATED_NOTE })));
      stage.appendChild(inner); root.appendChild(stage); app.appendChild(root); return;
    }

    /* grille : A | marques | B */
    var grid = h("div", { class: "spectra" });
    dials = [];
    slots.forEach(function (s, i) {
      var letter = String.fromCharCode(65 + i);
      var col = i === 0 ? "1" : "3";
      var conc = P.idx.conceptions[s.conceptionId];
      var top = h("div", { class: "prism-cell", style: "grid-column:" + col + ";grid-row:1" });
      if (!state.textOnly) {
        var dial = P.createDial({
          letter: letter, conceptionId: s.conceptionId, integrated: !!s.cfg, initial: state.slots[i].initial || P.idx.configurations[cmp.configIds[i]].conceptionId,
          onChange: function (cid) {
            if (state.slots[i].conceptionId === cid) { drawRays(); return; }
            var refocus = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("dial");
            state.slots[i] = { conceptionId: cid };
            render();
            if (refocus && dials[i]) dials[i].el.focus({ preventScroll: true });
          },
        });
        dials[i] = dial;
        top.appendChild(dial.el);
      } else {
        top.appendChild(h("label", { class: "txt-sel" }, h("span", { text: "Prisme " + letter }),
          h("select", { id: "sel-slot-" + i, onchange: function (e) { state.slots[i] = { conceptionId: e.target.value }; render(); } },
            D.conceptions.map(function (c) { return h("option", { value: c.id, selected: c.id === s.conceptionId, text: c.label + (P.configFor(cmp, c.id) ? "" : " (non intégrée)") }); }))));
      }
      top.appendChild(h("div", { class: "conc-name" },
        h("span", { class: "letter", text: letter }),
        h("span", { class: "cn", text: conc.label }),
        s.cfg && s.cfg.completeness.status !== "complète" ? h("span", { class: "tag", title: s.cfg.completeness.note, text: "exemple partiel" }) : null));
      top.appendChild(h("p", { class: "conc-desc", text: conc.description }));
      if (cmp.contextMode === "per-config" && s.cfg) {
        var cx = P.idx.contexts[s.cfg.contextId];
        top.appendChild(h("button", { type: "button", class: "ctx-chip", onclick: function () { openDrawer(contextDrawer(cx, "Contexte propre à " + letter)); } }, "Contexte propre à " + letter + " · lire"));
      }
      grid.appendChild(top);

      if (!s.cfg) {
        grid.appendChild(h("div", { class: "band-empty", style: "grid-column:" + col + ";grid-row:2 / span 3", "data-slot": String(i) },
          h("p", { class: "ph-main", text: P.NOT_INTEGRATED }),
          h("p", { text: "Le rayon traverse ce prisme sans se décomposer. " + P.NOT_INTEGRATED_NOTE })));
        return;
      }
      P.FACE_ORDER.forEach(function (fid, r) {
        var f = P.getFace(s.cfg, fid, 0).value;
        grid.appendChild(h("button", {
          type: "button", class: "band b-" + fid, "data-slot": String(i), "data-face": fid,
          style: "grid-column:" + col + ";grid-row:" + (r + 2),
          "aria-label": P.idx.faces[fid].label + " " + letter + " : " + (f ? f.full : P.FUNCTION_UNSPECIFIED) + ". Ouvrir le détail",
          onclick: function () { openDrawer(faceDrawer(s.cfg, fid, letter)); },
        },
          h("span", { class: "k" }, P.idx.faces[fid].label, f && f.type ? h("span", { class: "pill", text: D.functionTypes[f.type].label }) : null),
          h("span", { class: "t" + (f ? "" : " np"), text: f ? f.short : P.FUNCTION_UNSPECIFIED })));
      });
    });
    P.FACE_ORDER.forEach(function (fid, r) {
      var m = markFor(cmp, fid, slots);
      grid.appendChild(h("div", { class: "mark-cell", style: "grid-column:2;grid-row:" + (r + 2) },
        m ? h("span", { class: "mark " + m.cls, title: m.text, role: "img", "aria-label": m.text, text: m.sym }) : null));
    });
    inner.appendChild(grid);
    if (slots[0].cfg && slots[1].cfg) inner.appendChild(h("p", { class: "legend-marks" },
      h("span", null, h("b", { text: "=" }), " identique"), h("span", null, h("b", { text: "≠" }), " diffère"),
      cmp.situations ? h("span", null, h("b", { text: "≈" }), " converge dans cette situation") : null,
      h("span", { class: "hint-turn", text: state.textOnly ? "" : "Cliquez un nom autour d'un prisme pour le tourner." })));

    var overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    overlay.setAttribute("class", "rays-overlay"); overlay.setAttribute("aria-hidden", "true");
    stage.appendChild(overlay);
    stage.appendChild(inner);
    root.appendChild(stage);
    sceneEl = stage;

    var st2 = h("div", { class: "wrap" }, V.stageTwo(cmp, slots, cmp.situations ? cmp.situations.filter(function (x) { return x.id === state.situationId; })[0] : null));
    if (cmp.cumul && slots.every(function (s) { return s.cfg; })) {
      st2.appendChild(h("div", { class: "cumul-bar" }, h("button", {
        type: "button", class: "btn accent", id: "cumul-btn", "aria-pressed": String(state.cumul), "aria-controls": "cumul-panel", text: cmp.cumul.buttonLabel,
        onclick: function () { state.cumul = !state.cumul; render(); if (state.cumul) { var p = document.getElementById("cumul-panel"); if (p) { p.scrollIntoView({ block: "start" }); p.focus({ preventScroll: true }); } } },
      })));
      if (state.cumul) st2.appendChild(V.cumulPanel(cmp, function (id) { return P.idx.configurations[id]; }));
    }
    st2.appendChild(V.annotations(cmp));
    root.appendChild(st2);
    app.appendChild(root);
    requestAnimationFrame(drawRays);
  }

  /* Rayons : de la source vers chaque prisme, puis du prisme vers ses trois bandes. */
  var RAY_COLORS = { content: "#7aa6e0", reference: "#f0b54a", function: "#6cc192" };
  function drawRays() {
    if (!sceneEl || state.textOnly) return;
    var svg = sceneEl.querySelector(".rays-overlay");
    if (!svg) return;
    var box = sceneEl.getBoundingClientRect();
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    function rel(p) { return { x: p.x - box.left, y: p.y - box.top }; }
    function path(d, cls, color) { var e = document.createElementNS("http://www.w3.org/2000/svg", "path"); e.setAttribute("d", d); e.setAttribute("class", cls); if (color) e.setAttribute("stroke", color); svg.appendChild(e); return e; }
    var lamp = sceneEl.querySelector(".lamp-glow");
    var lr = lamp ? lamp.getBoundingClientRect() : null;
    var src = lr ? rel({ x: lr.left + lr.width / 2, y: lr.top + lr.height / 2 }) : null;
    var stacked = dials[0] && dials[1] && dials[1].entry().y > dials[0].exit().y;
    dials.forEach(function (dial, i) {
      if (!dial) return;
      var en = rel(dial.entry()), ex = rel(dial.exit());
      var from = src && !(stacked && i === 1) ? src : { x: en.x, y: en.y - 60 };
      var d = "M" + from.x + " " + from.y + " C " + from.x + " " + (from.y + 50) + ", " + en.x + " " + (en.y - 70) + ", " + en.x + " " + en.y;
      path(d, "beam-glow"); path(d, "beam-core");
      var bands = sceneEl.querySelectorAll('.band[data-slot="' + i + '"]');
      if (!dial.integrated() || !bands.length) {
        var empty = sceneEl.querySelector('.band-empty[data-slot="' + i + '"]');
        var ey = empty ? rel({ x: 0, y: empty.getBoundingClientRect().top }).y - 6 : ex.y + 40;
        path("M" + ex.x + " " + ex.y + " L" + ex.x + " " + ey, "beam-core faint");
        return;
      }
      var nameEl = dial.el.parentNode.querySelector(".conc-name");
      var nameTop = nameEl ? rel({ x: 0, y: nameEl.getBoundingClientRect().top }).y : ex.y + 80;
      var y1 = Math.min(ex.y + 22, nameTop - 34), y2 = nameTop - 8;
      [].forEach.call(bands, function (b, j) {
        var r = b.getBoundingClientRect();
        var tl = rel({ x: r.left, y: r.top });
        var lane = tl.x - 10 - j * 7;
        var ty = tl.y + 22;
        var spread = (j - 1) * 4;
        var yy = y2 - (2 - j) * 7;
        var dd = "M" + (ex.x + spread) + " " + ex.y + " L " + (ex.x + spread) + " " + y1 +
          " C " + (ex.x + spread) + " " + (yy - 4) + ", " + (ex.x + spread - 30) + " " + yy + ", " + (ex.x - 60) + " " + yy +
          " L " + (lane + 14) + " " + yy + " Q " + lane + " " + yy + ", " + lane + " " + (yy + 14) +
          " L " + lane + " " + (ty - 10) + " Q " + lane + " " + ty + ", " + (lane + 10) + " " + ty + " L " + (tl.x + 2) + " " + ty;
        var fid = b.getAttribute("data-face");
        path(dd, "ray-glow", RAY_COLORS[fid]); path(dd, "ray-core", RAY_COLORS[fid]);
      });
    });
  }
  window.addEventListener("resize", function () { requestAnimationFrame(drawRays); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(drawRays); });

  /* ---------- panneau latéral ---------- */
  var lastFocus = null;
  function openDrawer(content) {
    closeDrawer(true);
    lastFocus = document.activeElement;
    var scrim = h("div", { class: "scrim", onclick: function () { closeDrawer(); } });
    var dr = h("aside", { class: "drawer", role: "dialog", "aria-modal": "true", "aria-labelledby": "drawer-title", tabindex: "-1" },
      h("button", { type: "button", class: "drawer-close", "aria-label": "Fermer", text: "×", onclick: function () { closeDrawer(); } }), content);
    document.body.appendChild(scrim); document.body.appendChild(dr);
    document.body.classList.add("drawer-open");
    dr.focus();
  }
  function closeDrawer(silent) {
    var d = document.querySelector(".drawer"), s = document.querySelector(".scrim");
    if (d) d.remove(); if (s) s.remove();
    document.body.classList.remove("drawer-open");
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.querySelector(".drawer")) closeDrawer(); });
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".drawer a.chip")) closeDrawer(true); });

  function faceDrawer(cfg, fid, letter) {
    var f = P.getFace(cfg, fid, 0).value;
    var conc = P.idx.conceptions[cfg.conceptionId];
    return h("div", { class: "drawer-body d-" + fid },
      h("p", { class: "eyebrow", text: letter + " · " + conc.label }),
      h("h2", { id: "drawer-title" }, h("span", { class: "swatch s-" + fid, "aria-hidden": "true" }), P.idx.faces[fid].label, f && f.type ? h("span", { class: "pill", text: D.functionTypes[f.type].label }) : null),
      h("blockquote", { class: "full" + (f ? "" : " np"), text: f ? f.full : P.FUNCTION_UNSPECIFIED }),
      V.faceDetail(cfg, fid, 0));
  }
  function contextDrawer(ctx, title) {
    return h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: ctx.constructed ? "Situation construite à des fins de raisonnement" : "Situation" }),
      h("h2", { id: "drawer-title", text: title || ctx.title }),
      V.contextCard(ctx, { full: true }));
  }

  window.addEventListener("hashchange", route);
  loadGroup("cmp-acces");
  route();
})();
