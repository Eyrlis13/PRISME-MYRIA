/* Orchestration : état, routage, modèle conceptuel, illustrations, panneau latéral. */
(function () {
  var P = window.PRISME;
  var D = P.data;
  var h = P.h;
  var V = P.views;

  var state = {
    tab: "modele",
    domainId: "portee-acces",
    groupId: "cmp-acces",
    slots: [],
    initial: [],
    openFace: [null, null],
    situationId: null,
    cumul: false,
    showStage2: true,
    turned: false,
    textOnly: false,
    relation: null,
  };
  var app = document.getElementById("app");
  var modelScene = null;

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
    state.turned = false;
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
    var prev = state.tab;
    state.tab = /^#\/illustrations/.test(location.hash || "") ? "illustrations" : "modele";
    render();
    if (prev !== state.tab) window.scrollTo(0, 0);
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.textContent = "";
    [["modele", "#/", "Modèle conceptuel"], ["illustrations", "#/illustrations", "Illustrations"]].forEach(function (t) {
      nav.appendChild(h("a", { href: t[1], class: "tab" + (state.tab === t[0] ? " on" : ""), "aria-current": state.tab === t[0] ? "page" : null, text: t[2] }));
    });
  }

  /* Depuis le modèle : ouvrir l'exemple qui illustre une relation. */
  function goExample(ex, relId) {
    loadGroup(ex.cmpId);
    state.showStage2 = true;
    state.relation = relId ? { id: relId, example: ex } : null;
    closeDrawer(true);
    if (location.hash !== "#/illustrations") location.hash = "#/illustrations"; else render();
    setTimeout(function () {
      var t = ex.stage2 ? document.getElementById("stage2-btn") : document.querySelector(".optic");
      if (t) t.scrollIntoView({ block: "start" });
    }, 30);
  }

  /* ---------- rendu ---------- */
  function render() {
    renderNav();
    app.textContent = "";
    dials = []; sceneEl = null; modelScene = null; closeDrawer(true);
    if (state.tab === "illustrations") renderComparison();
    else renderModelView();
  }

  function renderModelView() {
    modelScene = P.renderModel({ openRelation: openRelation, openNotes: openNotes });
    app.appendChild(modelScene);
    requestAnimationFrame(function () { P.drawModelRays(modelScene); });
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

  /* Dans l'illustration, la référence et la fonction appartiennent au cas construit. */
  var CASE_LABELS = { content: "Contenu", reference: "Référence choisie pour ce cas", function: "Fonction justifiée dans ce cas" };

  /* Sur la bande, le type de fonction est porté par l'étiquette : on ne le répète pas dans la phrase. */
  function bandText(f) {
    if (!f.type) return f.short;
    var t = f.short.replace(/^(Directe|Instrumentale)\s*:\s*/, "");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function renderComparison() {
    var cmp = group();
    var slots = slotsResolved();
    var root = h("div", { class: "compare" });

    /* titre de l'exemple + choix de lecture */
    var head = h("div", { class: "ex-head wrap" });
    var relBanner = null;
    if (state.relation) {
      var R = relationById(state.relation.id);
      relBanner = h("div", { class: "rel-banner wrap", role: "note" },
        h("a", { href: "#/", class: "back", text: "← Modèle conceptuel" }),
        h("span", { class: "rb-k", text: "Relation illustrée" }),
        h("button", { type: "button", class: "rb-rel", onclick: function () { openRelation(R.id); } }, R.id === "P1" || R.id === "P2" ? R.id + " · " + D.model.propositions[R.id].text : R.label),
        h("button", { type: "button", class: "rb-x", "aria-label": "Masquer", text: "×", onclick: function () { state.relation = null; render(); } }));
    }
    var tb = h("div", { class: "ex-titlebox" });
    tb.appendChild(h("h2", { class: "ex-title", text: cmp ? cmp.title : P.idx.domains[state.domainId].label }));
    if (cmp && cmp.kind === "contre-exemple") tb.appendChild(h("p", { class: "ce-note", id: "context-change", role: "note", title: cmp.contextChangeNotice, text: "Autres situations que l'exemple principal" }));
    if (cmp && cmp.contextMode === "common") {
      var ctx = P.idx.contexts[cmp.contextId];
      tb.appendChild(h("button", { type: "button", class: "info-btn", id: "ctx-open", onclick: function () { openDrawer(contextDrawer(ctx)); } }, h("span", { class: "i", "aria-hidden": "true", text: "i" }), "Situation construite"));
    }
    if (cmp && cmp.situations) {
      tb.appendChild(h("div", { class: "sit-row" }, h("div", { class: "seg dark situations", role: "radiogroup", "aria-label": cmp.situationsLabel },
        cmp.situations.map(function (x) {
          var on = x.id === state.situationId;
          return h("button", { type: "button", role: "radio", "aria-checked": String(on), class: "chip" + (on ? " on" : ""), "data-situation": x.id, text: x.shortLabel || x.label, title: x.label, onclick: function () { state.situationId = x.id; render(); } });
        }))));
    }
    head.appendChild(tb);
    var tools = h("div", { class: "ex-tools" });
    var list = cmp ? P.comparisonsOfDomain(cmp.domainId) : [];
    if (list.length > 1) tools.appendChild(h("div", { class: "examples seg dark", role: "group", "aria-label": "Exemple documenté" }, list.map(function (c) {
      return h("button", { type: "button", class: "chip" + (c.id === cmp.id ? " on" : ""), "aria-pressed": String(c.id === cmp.id), text: c.kind === "contre-exemple" ? "Fonctions inversées" : "Exemple principal", onclick: function () { loadGroup(c.id); render(); } });
    })));
    head.appendChild(tools);

    var stage = h("section", { class: "optic" + (state.textOnly ? " textonly" : ""), "aria-label": "Illustration" });
    if (relBanner) stage.appendChild(relBanner);
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
            state.turned = true;
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
      top.appendChild(h("span", { class: "conc-kick", text: "Conception générale mobilisée" }));
      top.appendChild(h("button", { type: "button", class: "conc-name", title: conc.description, "aria-label": "Conception " + conc.label + " : voir la définition", onclick: function () { openDrawer(conceptionDrawer(conc, s.cfg, letter)); } },
        h("span", { class: "letter", text: letter }),
        h("span", { class: "cn", text: conc.label })));
      if (s.cfg) top.appendChild(h("span", { class: "conc-cap", text: s.conceptionId === P.idx.configurations[cmp.configIds[i]].conceptionId ? "justification construite pour ce cas" : "autre justification construite pour ce cas" }));
      if (cmp.contextMode === "per-config" && s.cfg) {
        var cx = P.idx.contexts[s.cfg.contextId];
        top.appendChild(h("button", { type: "button", class: "info-btn ctx-chip", onclick: function () { openDrawer(contextDrawer(cx, "Situation de " + letter)); } }, h("span", { class: "i", "aria-hidden": "true", text: "i" }), "Situation"));
      }
      grid.appendChild(top);

      if (!s.cfg) {
        grid.appendChild(h("div", { class: "band-empty", style: "grid-column:" + col + ";grid-row:2 / span 3", "data-slot": String(i) },
          h("p", { class: "ph-main", text: P.NOT_INTEGRATED }),
          h("p", { title: P.NOT_INTEGRATED_NOTE, text: "Le rayon traverse sans se décomposer." })));
        return;
      }
      P.FACE_ORDER.forEach(function (fid, r) {
        var f = P.getFace(s.cfg, fid, 0).value;
        grid.appendChild(h("button", {
          type: "button", class: "band b-" + fid, "data-slot": String(i), "data-face": fid,
          style: "grid-column:" + col + ";grid-row:" + (r + 2),
          "aria-label": CASE_LABELS[fid] + " " + letter + " : " + (f ? f.full : P.FUNCTION_UNSPECIFIED) + ". Ouvrir le détail",
          onclick: function () { openDrawer(faceDrawer(s.cfg, fid, letter)); },
        },
          h("span", { class: "k" }, CASE_LABELS[fid], f && f.type ? h("span", { class: "pill", text: D.functionTypes[f.type].label }) : null),
          h("span", { class: "t" + (f ? "" : " np"), text: f ? bandText(f) : P.FUNCTION_UNSPECIFIED })));
      });
    });
    P.FACE_ORDER.forEach(function (fid, r) {
      var m = markFor(cmp, fid, slots);
      grid.appendChild(h("div", { class: "mark-cell", style: "grid-column:2;grid-row:" + (r + 2) },
        m ? h("span", { class: "mark " + m.cls, title: m.text, role: "img", "aria-label": m.text, text: m.sym }) : null));
    });
    inner.appendChild(grid);
    inner.appendChild(h("div", { class: "scene-foot" },
      h("p", { class: "legend-marks" },
        h("span", null, h("b", { text: "=" }), " identique"), h("span", null, h("b", { text: "≠" }), " diffère"),
        cmp.situations ? h("span", null, h("b", { text: "≈" }), " converge") : null),
      !state.textOnly ? h("p", { class: "hint-turn", id: "hint", text: "Tourner un prisme fait passer à une autre justification construite pour ce cas. Cliquez un nom autour du prisme." }) : null,
      h("button", { type: "button", class: "link-light small", id: state.textOnly ? "view-bench" : "view-text", onclick: function () { state.textOnly = !state.textOnly; render(); } }, state.textOnly ? "Revenir aux prismes" : "Version texte")));

    var overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    overlay.setAttribute("class", "rays-overlay"); overlay.setAttribute("aria-hidden", "true");
    stage.appendChild(overlay);
    stage.appendChild(inner);
    root.appendChild(stage);
    sceneEl = stage;

    var st2 = h("div", { class: "wrap st2-wrap" });
    st2.appendChild(h("button", { type: "button", class: "stage2-toggle", id: "stage2-btn", "aria-expanded": String(state.showStage2), onclick: function () { state.showStage2 = !state.showStage2; render(); if (state.showStage2) document.getElementById("stage2-btn").scrollIntoView({ block: "start", behavior: "smooth" }); } },
      h("span", { class: "step", text: "Étape 2" }),
      h("span", { text: cmp.situations ? "Implications pour la formulation du critère" : "Le même constat, deux conclusions" }),
      h("span", { class: "chev", "aria-hidden": "true", text: state.showStage2 ? "−" : "+" })));
    if (state.showStage2) st2.appendChild(V.stageTwo(cmp, slots, cmp.situations ? cmp.situations.filter(function (x) { return x.id === state.situationId; })[0] : null));
    if (state.showStage2 && cmp.cumul && slots.every(function (s) { return s.cfg; })) {
      st2.appendChild(h("div", { class: "cumul-bar" }, h("button", {
        type: "button", class: "btn accent", id: "cumul-btn", "aria-pressed": String(state.cumul), "aria-controls": "cumul-panel", text: cmp.cumul.buttonLabel,
        onclick: function () { state.cumul = !state.cumul; render(); if (state.cumul) { var p = document.getElementById("cumul-panel"); if (p) { p.scrollIntoView({ block: "start" }); p.focus({ preventScroll: true }); } } },
      })));
      if (state.cumul) st2.appendChild(V.cumulPanel(cmp, function (id) { return P.idx.configurations[id]; }));
    }
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
      var nameEl = dial.el.parentNode.querySelector(".conc-kick") || dial.el.parentNode.querySelector(".conc-name");
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
  function redraw() { if (modelScene) P.drawModelRays(modelScene); else drawRays(); }
  window.addEventListener("resize", function () { requestAnimationFrame(redraw); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(redraw); });

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

  function faceDrawer(cfg, fid, letter) {
    var f = P.getFace(cfg, fid, 0).value;
    var conc = P.idx.conceptions[cfg.conceptionId];
    return h("div", { class: "drawer-body d-" + fid },
      h("p", { class: "eyebrow", text: letter + " · " + conc.label }),
      h("h2", { id: "drawer-title" }, h("span", { class: "swatch s-" + fid, "aria-hidden": "true" }), P.idx.faces[fid].label, f && f.type ? h("span", { class: "pill", text: D.functionTypes[f.type].label }) : null),
      h("blockquote", { class: "full" + (f ? "" : " np"), text: f ? f.full : P.FUNCTION_UNSPECIFIED }),
      V.faceDetail(cfg, fid, 0));
  }
  function conceptionDrawer(conc, cfg, letter) {
    return h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Prisme " + letter + " · conception de la valeur sociale" }),
      h("h2", { id: "drawer-title", text: conc.label }),
      h("p", { class: "lead", text: conc.description }),
      h("p", { class: "muted small", text: "Description reprise de la typologie de de la Cruz Jara et Spanjol (2025). Elle présente l'approche ; elle ne permet pas de déduire automatiquement un critère." }),
      cfg ? h("p", { class: "muted small", text: cfg.tag + " · " + cfg.completeness.status + ". " + cfg.completeness.note }) : h("p", { class: "muted small", text: P.NOT_INTEGRATED + " " + P.NOT_INTEGRATED_NOTE }));
  }
  function contextDrawer(ctx, title) {
    return h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: ctx.constructed ? "Situation construite à des fins de raisonnement" : "Situation" }),
      h("h2", { id: "drawer-title", text: title || ctx.title }),
      V.contextCard(ctx, { full: true }));
  }

  function relationById(id) { return D.model.relations.filter(function (r) { return r.id === id; })[0]; }

  function refChips(ids) {
    return h("ul", { class: "chips" }, ids.map(function (id) {
      var r = P.idx.references[id];
      return h("li", null, h("button", { type: "button", class: "chip ref-chip", onclick: function () { openRef(id); } }, r.short));
    }));
  }

  /* Explication d'une relation du modèle : mobilisé, à justifier, déduit. */
  function openRelation(id) {
    var R = relationById(id);
    var prop = D.model.propositions[id];
    var body = h("div", { class: "drawer-body rel-body" },
      h("p", { class: "eyebrow", text: prop ? "Apport de l'article" : "Relation du modèle" }),
      h("h2", { id: "drawer-title", text: prop ? id : R.label }),
      prop ? h("p", { class: "lead", text: prop.text }) : null,
      h("dl", { class: "rel-steps" },
        h("div", null, h("dt", { text: "Ce qui est mobilisé" }), h("dd", { text: R.mobilise })),
        h("div", null, h("dt", { text: "Ce qui doit être justifié" }), h("dd", { text: R.justifier })),
        h("div", null, h("dt", { text: "Ce qu'on peut en déduire" }), h("dd", { text: R.deduire }))),
      h("div", { class: "rel-examples" }, R.examples.map(function (ex) {
        return h("button", { type: "button", class: "btn primary ex-btn", onclick: function () { goExample(ex, id); } }, "Voir cette relation dans un exemple : " + ex.label);
      })),
      h("details", { class: "more" }, h("summary", { text: "Préciser" }),
        R.detail ? h("p", { text: R.detail }) : null,
        id === "orientation" ? h("dl", { class: "conc-list" }, D.conceptions.map(function (c) { return [h("dt", { text: c.label }), h("dd", { text: c.description })]; })) : null,
        h("p", { class: "lab", text: "Appuis" }), refChips(R.supports)),
      R.source === "proposition" ? h("p", { class: "muted small", text: "Explication rédigée pour l'application, à valider." }) : null);
    openDrawer(body);
  }

  function openRef(id) {
    var r = P.idx.references[id];
    openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Note" }),
      h("h2", { id: "drawer-title", text: r.short }),
      h("p", { text: r.full }),
      r.doi ? h("p", null, h("a", { href: "https://doi.org/" + r.doi, target: "_blank", rel: "noopener noreferrer", text: "https://doi.org/" + r.doi })) : null,
      h("p", { class: "muted small" }, "Établit : " + r.establishes)));
  }
  P.openRef = openRef;

  function openNotes() {
    openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Notes" }),
      h("h2", { id: "drawer-title", text: "Références" }),
      h("ol", { class: "refs" }, D.references.map(function (r) {
        return h("li", { class: "ref" }, h("p", { text: r.full }),
          r.doi ? h("p", null, h("a", { href: "https://doi.org/" + r.doi, target: "_blank", rel: "noopener noreferrer", text: "https://doi.org/" + r.doi })) : null,
          h("p", { class: "muted small", text: "Établit : " + r.establishes }));
      })),
      h("p", { class: "muted small", text: "Les domaines viennent de Teasdale, les conceptions de de la Cruz Jara et Spanjol. La distinction entre contenu, référence de valeur et fonction, les propositions P1 et P2 et les exemples appartiennent au travail analytique de l'article. Aucune formulation d'exemple n'est une citation d'un auteur." })));
  }

  window.addEventListener("hashchange", route);
  loadGroup("cmp-acces");
  route();
})();
