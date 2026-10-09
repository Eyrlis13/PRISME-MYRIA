/* Vues des illustrations : détail d'une bande, situation, étape du constat, justifications cumulées. */
(function () {
  var P = window.PRISME;
  var D = P.data;
  var h = P.h;
  var V = (P.views = {});

  function np(text) { return h("em", { class: "np", text: text || P.NOT_PROVIDED }); }

  function chips(supports) {
    if (!supports || !supports.length) return np("Aucun appui documentaire renseigné");
    return h("ul", { class: "chips" }, supports.map(function (s) {
      var ref = P.idx.references[s.ref];
      return h("li", null,
        h("button", { type: "button", class: "chip ref-chip", title: ref.full, onclick: function () { P.openRef(s.ref); }, text: ref.short }),
        s.note ? h("span", { class: "chip-note", text: " " + s.note }) : null);
    }));
  }
  function originBadge(origin) {
    if (!origin) return np("Origine non renseignée");
    return h("span", { class: "origin origin-" + origin, text: D.origins[origin] });
  }
  function conditionsList(conds) {
    if (!conds || !conds.length) return np("Aucune condition renseignée");
    return h("ul", { class: "plain" }, conds.map(function (c) { return h("li", { text: c }); }));
  }
  function row(label, node) { return h("div", { class: "kv" }, h("dt", { text: label }), h("dd", null, node)); }

  /* Détail complet d'une bande (même rendu à l'écran, en vue texte et à l'impression). */
  V.faceDetail = function (cfg, faceId, jIdx) {
    var def = P.idx.faces[faceId];
    var g = P.getFace(cfg, faceId, jIdx);
    var f = g.value, j = g.justification;
    var dl = h("dl", { class: "kvs" });
    var wrap = h("div", { class: "detail detail-" + faceId });
    wrap.appendChild(h("p", { class: "role", text: def.role }));
    if (!f) {
      dl.appendChild(row("Formulation", np(faceId === "function" ? P.FUNCTION_UNSPECIFIED : P.NOT_PROVIDED)));
      dl.appendChild(row("Origine de l'énoncé", np("Non renseignée")));
      dl.appendChild(row("Appuis documentaires", np()));
      wrap.appendChild(dl);
      return wrap;
    }
    if (faceId === "function" && f.type) {
      var ft = D.functionTypes[f.type];
      dl.appendChild(row("Fonction " + ft.label.toLowerCase(), h("span", null, ft.definition + " ", h("span", { class: "muted", text: ft.note }))));
    }
    if (f.explanation) dl.appendChild(row("Explication", h("span", { text: f.explanation })));
    if (faceId === "function" && j && j.explanation) dl.appendChild(row("Lecture", h("span", { text: j.explanation })));
    dl.appendChild(row("Conditions propres au cas", conditionsList(f.conditions)));
    dl.appendChild(row("Origine de l'énoncé", originBadge(f.origin)));
    dl.appendChild(row("Appuis documentaires", chips(f.supports)));
    wrap.appendChild(dl);
    return wrap;
  };

  var FACE_KEY = { content: "contenu", reference: "reference", function: "fonction" };
  V.faceStatus = function (cmp, faceId) {
    var k = FACE_KEY[faceId];
    if (cmp.constant.indexOf(k) >= 0) return "identique";
    if (cmp.varies.indexOf(k) >= 0) return "diffère";
    if (cmp.unspecified && cmp.unspecified.indexOf(k) >= 0) return "non spécifié";
    return "";
  };





  V.contextCard = function (ctx, opts) {
    opts = opts || {};
    var dl = h("dl", { class: "kvs tight" },
      row("Destinataires", h("span", { text: ctx.recipients })),
      row("Source du critère", ctx.sourceCritere ? h("span", { text: ctx.sourceCritere }) : np("Non renseignée (exemple construit)")),
      row("Source des données", ctx.sourceDonnees ? h("span", { text: ctx.sourceDonnees }) : np("Non renseignée (exemple construit)")));
    if (opts.full) return h("div", { class: "ctx-full" }, h("p", { class: "lead", text: ctx.text }), dl);
    return h("section", { class: "sit", "aria-label": opts.heading || "Situation" },
      h("b", { text: opts.heading || (ctx.constructed ? "Situation construite" : "Situation") }),
      h("p", { text: ctx.text }), dl);
  };


  /* Étape 2 : le constat traverse chaque critère. Même grille que la scène : A | marque | B. */
  V.stageTwo = function (cmp, slots, situation) {
    var formulation = slots.some(function (s) { return s.cfg && s.cfg.assessment.mode === "formulation"; });
    var root = h("section", { class: "stage2", "aria-label": "Étape 2" });
    var grid = h("div", { class: "s2" });
    var common = cmp.constant.indexOf("standard") >= 0 && cmp.constant.indexOf("constat") >= 0;
    var first = slots.filter(function (s) { return s.cfg; })[0];

    function obs(a) {
      if (!a.observed && !a.standard) return h("p", { class: "np", text: "Aucun standard ni constat dans cet exemple." });
      return h("div", null,
        h("p", { class: "obs-main", text: a.observed || P.NOT_PROVIDED }),
        h("p", { class: "obs-sub" }, h("span", { class: "lab inline", text: "Standard " }), a.standard || P.NOT_PROVIDED));
    }
    var none = slots.every(function (s) { return !s.cfg || (!s.cfg.assessment.observed && !s.cfg.assessment.standard); });
    if (!common && none) {
      grid.appendChild(h("div", { class: "s2-obs span" }, h("p", { class: "np", text: "Aucun standard ni constat dans cet exemple." })));
      common = true;
    } else if (common && first) {
      grid.appendChild(h("div", { class: "s2-obs span" },
        h("span", { class: "s2-k", text: "Constat supposé, identique pour A et B" }), obs(first.cfg.assessment)));
    }
    slots.forEach(function (s, i) {
      var letter = String.fromCharCode(65 + i);
      var col = i === 0 ? "1" : "3";
      var cell = h("div", { class: "s2-card", style: "grid-column:" + col });
      if (!s.cfg) { cell.appendChild(h("p", { class: "np", text: P.NOT_INTEGRATED })); grid.appendChild(cell); return; }
      var a = s.cfg.assessment;
      if (!common) cell.appendChild(h("div", { class: "s2-obs" }, h("span", { class: "s2-k", text: "Constat" }), obs(a)));
      var sit = situation && situation.byConfig[s.cfg.id];
      var supported = a.mode === "formulation" ? (sit ? sit.implication : null) : a.supported;
      var remaining = a.mode === "formulation" ? (sit ? sit.remaining : null) : a.remaining;
      cell.appendChild(h("p", { class: "s2-k" }, h("span", { class: "letter sm", text: letter }), a.mode === "formulation" ? "Implication pour la formulation" : "Conclusion autorisée"));
      cell.appendChild(supported ? h("p", { class: "s2-main", text: supported }) : h("p", null, np()));
      if (a.conditions && a.conditions.length) cell.appendChild(h("p", { class: "cond" }, h("span", { class: "lab inline", text: "Condition : " }), a.conditions.join(" ")));
      cell.appendChild(h("div", { class: "s2-remain" }, h("p", { class: "s2-k", text: "Éléments restant à établir" }), remaining ? h("p", { text: remaining }) : h("p", null, np())));
      if (a.supports && a.supports.length) cell.appendChild(h("div", { class: "cmeta" }, chips(a.supports)));
      grid.appendChild(cell);
    });
    root.appendChild(grid);
    if (cmp.noticeReading) root.appendChild(h("p", { class: "notice", text: cmp.noticeReading }));
    return root;
  };


  V.cumulPanel = function (cmp, cfgOf) {
    var c = cmp.cumul;
    var wrap = h("section", { class: "card cumul", id: "cumul-panel", tabindex: "-1", "aria-label": "Justifications cumulées" });
    wrap.appendChild(h("h3", { text: "Justifications cumulées" }));
    wrap.appendChild(h("p", { class: "lead", text: c.statement }));
    var common = cfgOf(c.chains[0].configId);
    wrap.appendChild(h("p", { class: "muted small" }, h("span", { class: "lab inline", text: "Éléments communs aux deux chaînes : " }), "contenu (« " + common.content.full + " »), standard et constat."));
    var chains = h("div", { class: "chains" });
    c.chains.forEach(function (ch) {
      var cfg = cfgOf(ch.configId), j = P.justificationsOf(cfg)[0], conc = P.idx.conceptions[cfg.conceptionId];
      var steps = [["Contenu", "content", cfg.content.full], ["Référence de valeur", "reference", j.valueReference.full], ["Fonction", "function", j.function.full], ["Conclusion soutenue", null, cfg.assessment.supported], ["Reste à établir", null, cfg.assessment.remaining]];
      chains.appendChild(h("div", { class: "chain" }, h("h4", { text: ch.title }), h("p", { class: "lab", text: cfg.tag + " · " + conc.label }),
        h("ol", { class: "steps" }, steps.map(function (st) { return h("li", { class: st[1] ? "step step-" + st[1] : "step" }, h("span", { class: "step-k", text: st[0] }), h("span", { text: st[2] })); }))));
    });
    wrap.appendChild(chains);
    wrap.appendChild(h("p", { class: "notice", text: c.closing }));
    wrap.appendChild(h("p", { class: "muted small", text: c.separation }));
    return wrap;
  };





})();
