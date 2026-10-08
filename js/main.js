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
  var bench = null;

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
    bench = null;
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

  /* Source : onze domaines comme onze lampes. */
  function renderSource(cmp) {
    var src = h("aside", { class: "src", "aria-label": "Source : domaines de critères" });
    src.appendChild(h("h2", { class: "colh", text: "Source · domaines de critères" }));
    var ul = h("ul", { class: "lamps", role: "list" });
    D.domains.forEach(function (d) {
      var n = P.comparisonsOfDomain(d.id).length;
      var on = d.id === state.domainId;
      ul.appendChild(h("li", null, h("button", {
        type: "button", class: "lamp" + (on ? " on" : n ? " avail" : " off"), "aria-pressed": String(on), "data-domain": d.id,
        title: n ? "" : "Non intégré à cette version",
        "aria-label": d.label + (n ? "" : " (non intégré à cette version)"),
        onclick: function () { loadDomain(d.id); render(); },
      }, h("span", { class: "dot", "aria-hidden": "true" }), h("span", { class: "name", text: d.label }))));
    });
    src.appendChild(ul);
    src.appendChild(h("p", { class: "legend", "aria-hidden": "true" }, h("span", { class: "dot" }), "grisé : non intégré à cette version"));
    if (cmp) {
      if (cmp.contextMode === "common") src.appendChild(V.contextCard(P.idx.contexts[cmp.contextId]));
      else src.appendChild(h("section", { class: "sit", "aria-label": "Situation" }, h("b", { text: "Situation" }), h("p", { text: "Propre à chaque prisme : voir chaque spectre." })));
      if (cmp.situations) src.appendChild(V.situationBlock(cmp, state, function (id) { state.situationId = id; render(); }));
    } else {
      src.appendChild(h("section", { class: "sit placeholder", role: "status" }, h("b", { text: P.NOT_INTEGRATED }), h("p", { class: "small muted", text: P.NOT_INTEGRATED_NOTE })));
    }
    return src;
  }

  function renderComparison() {
    var cmp = group();
    var slots = slotsResolved();
    var root = h("div", { class: "compare" });

    var head = h("div", { class: "ex-head" });
    var titleBox = h("div", { class: "ex-titlebox" });
    if (cmp) {
      titleBox.appendChild(h("p", { class: "eyebrow", text: P.idx.domains[cmp.domainId].label }));
      titleBox.appendChild(h("h2", { class: "ex-title", text: cmp.title }));
      titleBox.appendChild(h("p", { class: "subtitle", text: cmp.subtitle }));
    } else titleBox.appendChild(h("h2", { class: "ex-title", text: P.idx.domains[state.domainId].label }));
    head.appendChild(titleBox);
    var tools = h("div", { class: "ex-tools" });
    var list = cmp ? P.comparisonsOfDomain(cmp.domainId) : [];
    if (list.length > 1) {
      tools.appendChild(h("div", { class: "examples seg", role: "group", "aria-label": "Exemple documenté" }, list.map(function (c) {
        return h("button", { type: "button", class: "chip" + (c.id === cmp.id ? " on" : ""), "aria-pressed": String(c.id === cmp.id), text: c.kind === "contre-exemple" ? "Contre-exemples" : "Exemple principal", onclick: function () { loadGroup(c.id); render(); } });
      })));
    }
    tools.appendChild(h("div", { class: "seg", role: "group", "aria-label": "Mode de lecture" },
      h("button", { type: "button", class: "chip" + (state.textOnly ? "" : " on"), id: "view-bench", "aria-pressed": String(!state.textOnly), text: "Banc optique", onclick: function () { state.textOnly = false; render(); } }),
      h("button", { type: "button", class: "chip" + (state.textOnly ? " on" : ""), id: "view-text", "aria-pressed": String(state.textOnly), text: "Texte seul", onclick: function () { state.textOnly = true; render(); } })));
    head.appendChild(tools);
    root.appendChild(head);
    if (cmp && cmp.kind === "contre-exemple") root.appendChild(h("p", { class: "notice warn", role: "note", id: "context-change", text: cmp.contextChangeNotice }));
    if (cmp && cmp.hint) root.appendChild(h("p", { class: "hint", id: "hint", text: cmp.hint }));

    var scene = h("div", { class: "scene" + (state.textOnly ? " textonly" : "") });
    scene.appendChild(renderSource(cmp));

    /* banc optique */
    var benchWrap = h("div", { class: "bench", "aria-label": "Banc optique" });
    if (!state.textOnly) {
      bench = P.createBench({
        slots: slots.map(function (s) { return { conceptionId: s.conceptionId, integrated: !!s.cfg }; }),
        initial: state.initial,
        onChange: function (i, conceptionId) {
          if (state.slots[i].conceptionId === conceptionId) return;
          state.slots[i] = { conceptionId: conceptionId };
          state.openFace[i] = null; state.cumul = false;
          renderScreen(); renderStage();
          var s = slotsResolved()[i];
          bench.set(i, conceptionId, !!s.cfg, false);
        },
      });
      benchWrap.appendChild(bench.el);
      benchWrap.appendChild(h("div", { class: "bench-ctl" }, slots.map(function (s, i) {
        return h("div", { class: "ctl" }, h("span", { class: "lab", text: "Prisme " + String.fromCharCode(65 + i) }),
          h("select", { "aria-label": "Conception du prisme " + String.fromCharCode(65 + i), id: "sel-slot-" + i, onchange: function (e) { bench.rotateTo(i, conceptionIndex(e.target.value)); } },
            D.conceptions.map(function (c) { return h("option", { value: c.id, selected: c.id === s.conceptionId, text: c.label + (cmp && P.configFor(cmp, c.id) ? "" : " (non intégrée)") }); })));
      })));
    }
    scene.appendChild(benchWrap);

    scene.appendChild(h("div", { class: "screen", id: "screen", "aria-label": "Écran : critères spécifiés" }));
    root.appendChild(scene);
    root.appendChild(h("div", { id: "stage" }));
    app.appendChild(root);
    renderScreen();
    renderStage();
  }

  function renderScreen() {
    var cmp = group();
    var screen = document.getElementById("screen");
    if (!screen) return;
    screen.textContent = "";
    screen.appendChild(h("h2", { class: "colh", text: "Écran · critères spécifiés" }));
    var slots = slotsResolved();
    if (state.textOnly) {
      screen.appendChild(h("div", { class: "bench-ctl" }, slots.map(function (s, i) {
        return h("div", { class: "ctl" }, h("span", { class: "lab", text: "Prisme " + String.fromCharCode(65 + i) }),
          h("select", { "aria-label": "Conception du prisme " + String.fromCharCode(65 + i), id: "sel-slot-" + i, onchange: function (e) { state.slots[i] = { conceptionId: e.target.value }; state.openFace[i] = null; state.cumul = false; render(); } },
            D.conceptions.map(function (c) { return h("option", { value: c.id, selected: c.id === s.conceptionId, text: c.label + (cmp && P.configFor(cmp, c.id) ? "" : " (non intégrée)") }); })));
      })));
    }
    slots.forEach(function (s, i) {
      var letter = String.fromCharCode(65 + i);
      if (i === 1 && cmp && slots[0].cfg && slots[1].cfg) screen.appendChild(V.sameLine(cmp));
      if (!s.cfg) { screen.appendChild(V.placeholderCard(s.conceptionId, letter)); return; }
      var extra = cmp && cmp.contextMode === "per-config" ? V.contextCard(P.idx.contexts[s.cfg.contextId], { heading: "Contexte de ce contre-exemple" }) : null;
      screen.appendChild(V.spectrumCard(s.cfg, letter, cmp, state.openFace[i], function (fid) {
        state.openFace[i] = state.openFace[i] === fid ? null : fid;
        renderScreen();
        var b = document.getElementById("band-" + s.cfg.id + "-" + fid);
        if (b && !b.hidden) b.previousSibling.focus();
      }, extra));
    });
  }

  function renderStage() {
    var cmp = group();
    var stage = document.getElementById("stage");
    if (!stage) return;
    stage.textContent = "";
    if (!cmp) return;
    var slots = slotsResolved();
    var sit = cmp.situations ? cmp.situations.filter(function (x) { return x.id === state.situationId; })[0] : null;
    stage.appendChild(V.stageTwo(cmp, slots, sit));
    if (cmp.cumul && slots.every(function (s) { return s.cfg; })) {
      stage.appendChild(h("div", { class: "cumul-bar" }, h("button", {
        type: "button", class: "btn accent", id: "cumul-btn", "aria-pressed": String(state.cumul), "aria-controls": "cumul-panel", text: cmp.cumul.buttonLabel,
        onclick: function () { state.cumul = !state.cumul; renderStage(); if (state.cumul) { var p = document.getElementById("cumul-panel"); if (p) { p.scrollIntoView({ block: "start" }); p.focus({ preventScroll: true }); } } },
      })));
      if (state.cumul) stage.appendChild(V.cumulPanel(cmp, function (id) { return P.idx.configurations[id]; }));
    }
    stage.appendChild(V.annotations(cmp));
  }

  window.addEventListener("hashchange", route);
  loadGroup("cmp-acces");
  route();
})();
