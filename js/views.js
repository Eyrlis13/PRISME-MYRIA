/* Vues : écran des spectres, détail d'une bande, étape du constat, catalogue, lexique, origine, impression. */
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
        h("a", { class: "chip", href: "#/origine/" + s.ref, title: ref.full, text: ref.short }),
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

  /* Une bande du spectre : titre, formulation, détail dépliable. */
  V.band = function (cfg, faceId, cmp, opened, onToggle) {
    var def = P.idx.faces[faceId];
    var f = P.getFace(cfg, faceId, 0).value;
    var status = cmp ? V.faceStatus(cmp, faceId) : "";
    var id = "band-" + cfg.id + "-" + faceId;
    var head = h("button", {
      type: "button", class: "band-head", "aria-expanded": String(!!opened), "aria-controls": id,
      onclick: function () { onToggle(faceId); },
    },
      h("span", { class: "k" }, def.label, f && f.type ? h("span", { class: "pill", text: D.functionTypes[f.type].label }) : null),
      h("span", { class: "t" + (f ? "" : " np"), text: f ? f.full : (faceId === "function" ? P.FUNCTION_UNSPECIFIED : P.NOT_PROVIDED) }),
      status === "identique" ? h("span", { class: "status status-identique", text: "identique" }) : h("span"),
      h("span", { class: "chev", "aria-hidden": "true", text: "›" })
    );
    var body = h("div", { class: "band-body", id: id, hidden: !opened }, V.faceDetail(cfg, faceId, 0));
    return h("div", { class: "band b-" + faceId + (opened ? " open" : "") }, head, body);
  };

  V.spectrumCard = function (cfg, letter, cmp, openFace, onToggle, extra) {
    var conc = P.idx.conceptions[cfg.conceptionId];
    var card = h("section", { class: "spec", "aria-label": "Spectre " + letter + ", " + conc.label });
    var comp = cfg.completeness;
    card.appendChild(h("header", { class: "who" },
      h("span", { class: "letter", text: letter }),
      h("b", { text: conc.label }),
      comp.status !== "complète" ? h("span", { class: "tag", title: comp.note, text: "exemple " + comp.status }) : null,
      h("small", { text: conc.description })));
    if (extra) card.appendChild(extra);
    card.appendChild(h("div", { class: "bands" }, P.FACE_ORDER.map(function (fid) { return V.band(cfg, fid, cmp, openFace === fid, onToggle); })));
    return card;
  };

  V.placeholderCard = function (conceptionId, letter) {
    var conc = P.idx.conceptions[conceptionId];
    return h("section", { class: "spec placeholder", role: "status" },
      h("header", { class: "who" }, h("span", { class: "letter", text: letter }), h("b", { text: conc.label }), h("small", { text: conc.description })),
      h("p", { class: "ph-main", text: P.NOT_INTEGRATED }),
      h("p", { class: "muted small", text: P.NOT_INTEGRATED_NOTE + " Le rayon traverse ce prisme sans se décomposer." }));
  };

  /* Ligne entre deux spectres, tirée du groupe de comparaison. */
  V.sameLine = function (cmp) {
    var same = [], diff = [], unsp = [];
    P.FACE_ORDER.forEach(function (fid) {
      var s = V.faceStatus(cmp, fid), l = P.idx.faces[fid].label.toLowerCase();
      if (s === "identique") same.push(l); else if (s === "diffère") diff.push(l); else if (s) unsp.push(l);
    });
    var parts = [];
    if (same.length) parts.push(same.join(" et ") + " identique" + (same.length > 1 ? "s" : ""));
    if (diff.length) parts.push(diff.join(" et ") + " diffère" + (diff.length > 1 ? "nt" : ""));
    if (unsp.length) parts.push(unsp.join(" et ") + " non spécifié" + (unsp.length > 1 ? "s" : ""));
    return h("p", { class: "same", text: parts.join(" · ") });
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

  V.annotations = function (cmp) {
    function names(keys) { return keys.map(function (k) { return D.elements[k]; }).join(", "); }
    var dl = h("dl", { class: "kvs tight" });
    if (cmp.constant.length) dl.appendChild(row("Maintenu constant", h("span", { text: names(cmp.constant) })));
    if (cmp.varies.length) dl.appendChild(row("Varie", h("span", { text: names(cmp.varies) })));
    if (cmp.unspecified && cmp.unspecified.length) dl.appendChild(row("Non spécifié", h("span", { text: names(cmp.unspecified) })));
    return h("details", { class: "card annot", "aria-label": "Éléments constants et variables" },
      h("summary", null, h("span", { text: "Ce que la comparaison maintient et ce qu'elle fait varier" })), dl,
      h("p", { class: "muted small", text: "L'équivalence des éléments constants est posée par la construction du groupe de comparaison. Une égalité de texte ne suffit pas à établir l'équivalence scientifique de deux critères." }));
  };

  /* Étape 2 : le constat traverse chaque critère. Même grille que la scène : A | marque | B. */
  V.stageTwo = function (cmp, slots, situation) {
    var formulation = slots.some(function (s) { return s.cfg && s.cfg.assessment.mode === "formulation"; });
    var root = h("section", { class: "stage2", "aria-label": "Étape 2" });
    if (P.printing) root.appendChild(h("h2", null, h("span", { class: "step", text: "Étape 2" }),
      formulation ? "Ce que chaque référence implique pour la formulation" : "Le même constat, deux conclusions"));
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
      cell.appendChild(h("p", { class: "s2-k" }, h("span", { class: "letter sm", text: letter }), a.mode === "formulation" ? "Implication" : "Conclusion soutenue"));
      cell.appendChild(supported ? h("p", { class: "s2-main", text: supported }) : h("p", null, np()));
      var more = h("details", { class: "more" }, h("summary", { text: "Ce qui reste à établir" + (a.conditions && a.conditions.length ? ", condition" : "") }));
      if (a.conditions && a.conditions.length) more.appendChild(h("p", { class: "cond" }, h("span", { class: "lab inline", text: "Condition : " }), a.conditions.join(" ")));
      more.appendChild(remaining ? h("p", { text: remaining }) : h("p", null, np()));
      if (a.supports && a.supports.length) more.appendChild(chips(a.supports));
      cell.appendChild(more);
      grid.appendChild(cell);
    });
    root.appendChild(grid);
    if (cmp.noticeReading) root.appendChild(h("p", { class: "notice", text: cmp.noticeReading }));
    return root;
  };

  V.situationBlock = function (cmp, state, onChange) {
    var s = cmp.situations;
    var cur = s.filter(function (x) { return x.id === state.situationId; })[0] || s[0];
    var group = h("div", { class: "radio-group", role: "radiogroup", "aria-label": cmp.situationsLabel });
    s.forEach(function (x) {
      var id = "sit-" + x.id;
      group.appendChild(h("label", { class: "radio" + (x.id === cur.id ? " on" : ""), for: id },
        h("input", { type: "radio", name: "situation", id: id, value: x.id, checked: x.id === cur.id, onchange: function () { onChange(x.id); } }),
        h("span", { text: x.label })));
    });
    return h("section", { class: "sit situation", "aria-label": cmp.situationsLabel },
      h("b", { text: cmp.situationsLabel + " · modifie le rayon, non le prisme" }), group,
      h("p", { class: "small", text: cur.description }),
      h("p", { class: "relation relation-" + cur.relation }, h("strong", { text: cur.relationLabel + ". " }), cur.relationText),
      h("p", { class: "notice small", text: cmp.situationsWarning }),
      h("p", { class: "muted small", text: cmp.situationsConstant }));
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

  /* ---------- Rubriques ---------- */
  V.catalogue = function (open) {
    var wrap = h("div", { class: "page" });
    wrap.appendChild(h("h2", { text: "Catalogue et couverture" }));
    wrap.appendChild(h("p", { class: "muted", text: "Les onze domaines et les cinq conceptions restent tous consultables. La mention « non intégrée » concerne la couverture de cette version, non la pertinence d'un critère sous une conception." }));
    wrap.appendChild(h("h3", { text: "Couverture : domaine × conception" }));
    var tbl = h("table", { class: "matrix" });
    var thead = h("tr", null, h("th", { scope: "col", text: "Domaine" }));
    D.conceptions.forEach(function (c) { thead.appendChild(h("th", { scope: "col", text: c.label })); });
    tbl.appendChild(h("thead", null, thead));
    var tb = h("tbody");
    D.domains.forEach(function (d) {
      var tr = h("tr", null, h("th", { scope: "row", text: d.label }));
      D.conceptions.forEach(function (c) {
        var hit = D.configurations.filter(function (cf) { return cf.domainId === d.id && cf.conceptionId === c.id; });
        var td = h("td");
        if (hit.length) hit.forEach(function (cf) {
          var cmp = D.comparisons.filter(function (x) { return x.configIds.indexOf(cf.id) >= 0; })[0];
          td.appendChild(h("button", { type: "button", class: "link", text: cmp.title, onclick: function () { open(cmp.id, c.id); } }));
        });
        else td.appendChild(h("span", { class: "np", text: "Non intégrée" }));
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    wrap.appendChild(h("div", { class: "table-scroll" }, tbl));
    wrap.appendChild(h("h3", { text: "Conceptions de la valeur sociale" }));
    wrap.appendChild(h("p", { class: "muted", text: "Ces descriptions présentent chaque approche. Elles ne constituent pas des règles permettant de déduire automatiquement des critères." }));
    var cl = h("dl", { class: "conc-list" });
    D.conceptions.forEach(function (c) { cl.appendChild(h("dt", { text: c.label })); cl.appendChild(h("dd", { text: c.description })); });
    wrap.appendChild(cl);
    return wrap;
  };

  V.lexique = function () {
    var wrap = h("div", { class: "page" });
    wrap.appendChild(h("h2", { text: "Lexique" }));
    wrap.appendChild(h("h3", { text: "La métaphore optique" }));
    var m = h("dl", { class: "conc-list" });
    D.metaphor.forEach(function (e) { m.appendChild(h("dt", { text: e.term })); m.appendChild(h("dd", { text: e.definition })); });
    wrap.appendChild(m);
    wrap.appendChild(h("h3", { text: "Le modèle" }));
    var dl = h("dl", { class: "conc-list" });
    D.lexique.forEach(function (e) { dl.appendChild(h("dt", { text: e.term })); dl.appendChild(h("dd", { text: e.definition })); });
    wrap.appendChild(dl);
    wrap.appendChild(h("p", { class: "notice", text: "L'application ne calcule aucun score global de valeur sociale, aucune pondération et aucun classement des conceptions. Une fonction instrumentale peut être essentielle à une valeur prioritaire." }));
    return wrap;
  };

  V.referenceItem = function (r) {
    return h("li", { id: "ref-" + r.id.replace(/^ref-/, ""), class: "ref", tabindex: "-1" },
      h("p", { class: "ref-full", text: r.full }),
      r.doi ? h("p", null, h("a", { href: "https://doi.org/" + r.doi, target: "_blank", rel: "noopener noreferrer", text: "https://doi.org/" + r.doi })) : null,
      h("p", { class: "muted small" }, h("span", { class: "lab inline", text: "Établit : " }), r.establishes));
  };

  V.origine = function () {
    var wrap = h("div", { class: "page" });
    wrap.appendChild(h("h2", { text: "Origine du modèle" }));
    wrap.appendChild(h("ul", { class: "plain" },
      h("li", { text: "Les onze domaines sont empruntés à Teasdale, dans la version retenue par l'article." }),
      h("li", { text: "Les cinq conceptions sont empruntées à de la Cruz Jara et Spanjol." }),
      h("li", { text: "La distinction entre contenu, référence de valeur et fonction, ainsi que les comparaisons présentées ici, appartiennent au travail analytique de l'article en cours. La métaphore optique (rayon, prisme, spectre) est un choix de présentation de l'application." }),
      h("li", { text: "Pour les exemples, les publications établissent les prémisses conceptuelles. Les formulations des critères, les situations et leurs comparaisons proviennent du manuscrit. Aucune formulation d'exemple n'est une citation littérale d'un auteur." })));
    wrap.appendChild(h("h3", { text: "Références" }));
    var ol = h("ol", { class: "refs" });
    D.references.forEach(function (r) { ol.appendChild(V.referenceItem(r)); });
    wrap.appendChild(ol);
    wrap.appendChild(h("h3", { text: "Historique des modifications du catalogue" }));
    wrap.appendChild(h("ul", { class: "plain" }, D.changelog.map(function (c) { return h("li", { text: c.date + " : " + c.note }); })));
    return wrap;
  };

  /* ---------- Vue imprimable ---------- */
  V.printView = function (cmp, slots, situationId) {
    P.printing = true;
    var root = h("div", { class: "print-doc" });
    root.appendChild(h("h1", { text: "Le prisme des critères" }));
    root.appendChild(h("h2", { text: cmp.title + " : " + cmp.subtitle }));
    root.appendChild(h("p", { class: "muted", text: "Domaine : " + P.idx.domains[cmp.domainId].label }));
    if (cmp.contextMode === "common") root.appendChild(V.contextCard(P.idx.contexts[cmp.contextId]));
    if (cmp.contextChangeNotice) root.appendChild(h("p", { class: "notice", text: cmp.contextChangeNotice }));
    root.appendChild(V.annotations(cmp));
    slots.forEach(function (s, i) {
      var letter = String.fromCharCode(65 + i);
      if (!s.cfg) { root.appendChild(V.placeholderCard(s.conceptionId, letter)); return; }
      var sec = h("section", { class: "print-cfg" });
      sec.appendChild(h("h3", { text: letter + " · " + P.idx.conceptions[s.cfg.conceptionId].label + " (" + s.cfg.tag + ")" }));
      sec.appendChild(h("p", { class: "muted", text: P.idx.conceptions[s.cfg.conceptionId].description }));
      if (cmp.contextMode === "per-config") sec.appendChild(V.contextCard(P.idx.contexts[s.cfg.contextId], { heading: "Contexte de ce contre-exemple" }));
      P.FACE_ORDER.forEach(function (fid) {
        var f = P.getFace(s.cfg, fid, 0).value;
        sec.appendChild(h("h4", null, P.idx.faces[fid].label, f && f.type ? " (" + D.functionTypes[f.type].label.toLowerCase() + ")" : ""));
        sec.appendChild(h("blockquote", { class: "full" + (f ? "" : " np"), text: f ? f.full : (fid === "function" ? P.FUNCTION_UNSPECIFIED : P.NOT_PROVIDED) }));
        sec.appendChild(V.faceDetail(s.cfg, fid, 0));
      });
      sec.appendChild(h("p", { class: "muted small", text: "Complétude : " + s.cfg.completeness.status + ". " + s.cfg.completeness.note }));
      root.appendChild(sec);
    });
    if (cmp.situations) {
      cmp.situations.forEach(function (sit) {
        var sec = h("section", { class: "print-cfg" });
        sec.appendChild(h("h3", { text: "Situation : " + sit.label }));
        sec.appendChild(h("p", { text: sit.description }));
        sec.appendChild(h("p", null, h("strong", { text: sit.relationLabel + ". " }), sit.relationText));
        sec.appendChild(V.stageTwo(cmp, slots, sit));
        root.appendChild(sec);
      });
      root.appendChild(h("p", { class: "notice", text: cmp.situationsWarning }));
    } else root.appendChild(V.stageTwo(cmp, slots, null));
    if (cmp.cumul && slots.every(function (s) { return s.cfg; })) root.appendChild(V.cumulPanel(cmp, function (id) { return P.idx.configurations[id]; }));
    root.appendChild(h("h3", { text: "Références" }));
    root.appendChild(h("ol", { class: "refs" }, D.references.map(function (r) { return h("li", null, r.full, r.doi ? " https://doi.org/" + r.doi : ""); })));
    root.appendChild(h("p", { class: "muted small", text: "Le prisme des critères, PRISME MYRIA. Situations construites à des fins de raisonnement. Aucun score, aucune pondération, aucun classement." }));
    root.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
    root.querySelectorAll("details").forEach(function (e) { e.open = true; });
    P.printing = false;
    return root;
  };
})();
