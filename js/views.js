/* Panneaux de lecture, de conclusions, fiches planes, cumul, catalogue, origine. */
(function () {
  var P = window.PRISME;
  var D = P.data;
  var h = P.h;
  var V = (P.views = {});

  function np(text) {
    return h("em", { class: "np", text: text || P.NOT_PROVIDED });
  }

  /* Lien d'appui documentaire vers rubrique « Origine du modèle ». */
  function chips(supports) {
    if (!supports || !supports.length) return np("Aucun appui documentaire renseigné");
    return h(
      "ul",
      { class: "chips" },
      supports.map(function (s) {
        var ref = P.idx.references[s.ref];
        return h(
          "li",
          null,
          h("a", { class: "chip", href: "#/origine/" + s.ref, title: s.note || ref.full, text: ref.short }),
          s.note ? h("span", { class: "chip-note", text: " " + s.note }) : null
        );
      })
    );
  }

  function originBadge(origin) {
    if (!origin) return np("Origine non renseignée");
    return h("span", { class: "origin origin-" + origin, text: D.origins[origin] });
  }

  function conditionsList(conds) {
    if (!conds || !conds.length) return np("Aucune condition renseignée");
    return h(
      "ul",
      { class: "plain" },
      conds.map(function (c) {
        return h("li", { text: c });
      })
    );
  }

  function row(label, node) {
    return h("div", { class: "kv" }, h("dt", { text: label }), h("dd", null, node));
  }

  /* Détail complet d'une face. Même rendu en vue 3D (panneau de lecture) et en vue plane. */
  V.faceDetail = function (cfg, faceId, jIdx) {
    var def = P.idx.faces[faceId];
    var g = P.getFace(cfg, faceId, jIdx);
    var f = g.value;
    var j = g.justification;
    var el = h("article", { class: "detail detail-" + faceId, "aria-label": def.label + ", " + cfg.tag });
    el.appendChild(
      h(
        "h4",
        { class: "detail-title" },
        h("span", { class: "swatch swatch-" + faceId, "aria-hidden": "true" }),
        def.label,
        f && f.type ? h("span", { class: "type-badge", text: D.functionTypes[f.type].label }) : null
      )
    );
    if (!f) {
      el.appendChild(h("p", { class: "full np", text: faceId === "function" ? P.FUNCTION_UNSPECIFIED : P.NOT_PROVIDED }));
      el.appendChild(h("p", { class: "role", text: def.role }));
      el.appendChild(
        h(
          "dl",
          { class: "kvs" },
          row("Origine de l'énoncé", np("Non renseignée")),
          row("Appuis documentaires", np())
        )
      );
      return el;
    }
    el.appendChild(h("blockquote", { class: "full", text: f.full }));
    el.appendChild(h("p", { class: "role", text: def.role }));
    var dl = h("dl", { class: "kvs" });
    if (faceId === "function" && f.type) {
      var ft = D.functionTypes[f.type];
      dl.appendChild(row("Type de fonction", h("span", null, ft.definition + " ", h("span", { class: "muted", text: ft.note }))));
    }
    if (f.explanation) dl.appendChild(row("Explication", h("span", { text: f.explanation })));
    if (faceId === "function" && j && j.explanation) dl.appendChild(row("Lecture de la fonction", h("span", { text: j.explanation })));
    dl.appendChild(row("Conditions propres au cas", conditionsList(f.conditions)));
    dl.appendChild(row("Origine de l'énoncé", originBadge(f.origin)));
    dl.appendChild(row("Appuis documentaires", chips(f.supports)));
    el.appendChild(dl);
    return el;
  };

  /* Cartouche de configuration : étiquette, conception, destinataires. */
  V.configHeader = function (cfg) {
    var conc = P.idx.conceptions[cfg.conceptionId];
    return h(
      "header",
      { class: "cfg-head" },
      h("p", { class: "cfg-tag", text: cfg.tag }),
      h("p", { class: "cfg-conc" }, h("span", { class: "label-k", text: "Conception : " }), h("strong", { text: conc.label })),
      h("p", { class: "cfg-desc", text: conc.description })
    );
  };

  V.placeholderConfig = function (conceptionId, slotLabel) {
    var conc = P.idx.conceptions[conceptionId];
    return h(
      "div",
      { class: "placeholder" },
      h("p", { class: "cfg-tag", text: slotLabel }),
      h("p", { class: "cfg-conc" }, h("span", { class: "label-k", text: "Conception : " }), h("strong", { text: conc.label })),
      h("p", { class: "cfg-desc", text: conc.description }),
      h("p", { class: "ph-main", role: "status", text: P.NOT_INTEGRATED }),
      h("p", { class: "muted", text: P.NOT_INTEGRATED_NOTE })
    );
  };

  V.contextCard = function (ctx, opts) {
    opts = opts || {};
    return h(
      "section",
      { class: "context card", "aria-label": "Contexte" },
      h("h3", { text: opts.heading || "Contexte" }),
      ctx.constructed ? h("p", { class: "constructed", text: "Situation construite à des fins de raisonnement." }) : null,
      h("p", { text: ctx.text }),
      h(
        "dl",
        { class: "kvs" },
        row("Destinataires", h("span", { text: ctx.recipients })),
        row("Source du critère", ctx.sourceCritere ? h("span", { text: ctx.sourceCritere }) : np("Non renseignée (exemple construit)")),
        row("Source des données", ctx.sourceDonnees ? h("span", { text: ctx.sourceDonnees }) : np("Non renseignée (exemple construit)"))
      )
    );
  };

  /* Annotations tirées des groupes de comparaison (constant, varie, non spécifié). */
  V.annotations = function (cmp) {
    function names(keys) {
      return keys.map(function (k) {
        return D.elements[k];
      });
    }
    var dl = h("dl", { class: "annot" });
    if (cmp.constant.length)
      dl.appendChild(h("div", { class: "kv" }, h("dt", { text: "Maintenu constant" }), h("dd", { text: names(cmp.constant).join(", ") })));
    if (cmp.varies.length)
      dl.appendChild(h("div", { class: "kv" }, h("dt", { text: "Varie" }), h("dd", { text: names(cmp.varies).join(", ") })));
    if (cmp.unspecified && cmp.unspecified.length)
      dl.appendChild(h("div", { class: "kv" }, h("dt", { text: "Non spécifié" }), h("dd", { text: names(cmp.unspecified).join(", ") })));
    return h(
      "section",
      { class: "card annot-card", "aria-label": "Éléments constants et variables" },
      h("h3", { text: "Ce que la comparaison maintient et ce qu'elle fait varier" }),
      dl,
      h("p", {
        class: "muted",
        text: "L'équivalence des éléments constants est posée par la construction du groupe de comparaison. Une égalité de texte ne suffit pas à établir l'équivalence scientifique de deux critères.",
      })
    );
  };

  var FACE_KEY = { content: "contenu", reference: "reference", function: "fonction" };
  V.faceStatus = function (cmp, faceId) {
    var k = FACE_KEY[faceId];
    var label = P.idx.faces[faceId].label;
    if (cmp.constant.indexOf(k) >= 0) return "Face " + label + " : maintenu constant dans ce groupe de comparaison.";
    if (cmp.varies.indexOf(k) >= 0) return "Face " + label + " : varie dans ce groupe de comparaison.";
    if (cmp.unspecified && cmp.unspecified.indexOf(k) >= 0) return "Face " + label + " : non spécifié dans ce groupe de comparaison.";
    return "";
  };

  /* Panneau des conclusions : lignes alignées pour comparer les configurations. */
  V.conclusions = function (cmp, slots, situation) {
    var root = h("section", { class: "card conclusions", "aria-label": "Panneau des conclusions" });
    root.appendChild(h("h3", { text: "Ce que le constat permet de soutenir" }));
    root.appendChild(
      h("p", {
        class: "muted",
        text: "Textes préparés pour chaque configuration. L'application les affiche ; elle ne produit aucun jugement automatique sur une organisation réelle et ne calcule aucun score.",
      })
    );
    var cfgs = slots.map(function (s) {
      return s.cfg;
    });
    var formulation = cfgs.some(function (c) {
      return c && c.assessment.mode === "formulation";
    });
    var rows = [
      { label: "Observé ou supposé dans l'exemple", get: function (a) { return a.observed; } },
      { label: "Standard retenu", get: function (a) { return a.standard; } },
      {
        label: formulation ? "Implication pour la formulation du critère" : "Conclusion soutenue, sous les conditions indiquées",
        get: function (a, c) {
          if (a.mode === "formulation") {
            var s = situation && situation.byConfig[c.id];
            return s ? s.implication : null;
          }
          return a.supported;
        },
        conds: true,
      },
      {
        label: "Ce qui reste à établir pour une conclusion plus large",
        get: function (a, c) {
          if (a.mode === "formulation") {
            var s = situation && situation.byConfig[c.id];
            return s ? s.remaining : null;
          }
          return a.remaining;
        },
      },
    ];
    rows.forEach(function (r) {
      var wrapRow = h("div", { class: "crow" }, h("h4", { text: r.label }));
      var cells = h("div", { class: "ccells" });
      slots.forEach(function (s) {
        var cell = h("div", { class: "ccell" });
        cell.appendChild(h("p", { class: "ccell-tag", text: s.cfg ? s.cfg.tag + " · " + P.idx.conceptions[s.conceptionId].label : P.idx.conceptions[s.conceptionId].label }));
        if (!s.cfg) {
          cell.appendChild(h("p", { class: "np", text: P.NOT_INTEGRATED }));
        } else {
          var txt = r.get(s.cfg.assessment, s.cfg);
          cell.appendChild(txt ? h("p", { text: txt }) : h("p", null, np()));
          if (r.conds && s.cfg.assessment.conditions && s.cfg.assessment.conditions.length) {
            cell.appendChild(
              h("div", { class: "cond" }, h("span", { class: "label-k", text: "Condition : " }), s.cfg.assessment.conditions.join(" "))
            );
          }
        }
        cells.appendChild(cell);
      });
      wrapRow.appendChild(cells);
      root.appendChild(wrapRow);
    });
    var supports = [];
    cfgs.forEach(function (c) {
      if (c && c.assessment.supports)
        c.assessment.supports.forEach(function (s) {
          if (!supports.some(function (x) { return x.ref === s.ref; })) supports.push(s);
        });
    });
    if (supports.length) root.appendChild(h("div", { class: "cmeta" }, h("span", { class: "label-k", text: "Appuis documentaires : " }), chips(supports)));
    if (cmp.noticeReading) root.appendChild(h("p", { class: "notice", text: cmp.noticeReading }));
    return root;
  };

  V.situationBlock = function (cmp, state, onChange) {
    var s = cmp.situations;
    var cur = s.filter(function (x) { return x.id === state.situationId; })[0] || s[0];
    var group = h("div", { class: "radio-group", role: "radiogroup", "aria-label": cmp.situationsLabel });
    s.forEach(function (x) {
      var id = "sit-" + x.id;
      group.appendChild(
        h(
          "label",
          { class: "radio" + (x.id === cur.id ? " on" : ""), for: id },
          h("input", { type: "radio", name: "situation", id: id, value: x.id, checked: x.id === cur.id, onchange: function () { onChange(x.id); } }),
          h("span", { text: x.label })
        )
      );
    });
    return h(
      "section",
      { class: "card situation", "aria-label": cmp.situationsLabel },
      h("h3", { text: cmp.situationsLabel }),
      group,
      h("p", { class: "notice", text: cmp.situationsWarning }),
      h("p", { class: "muted", text: cmp.situationsConstant }),
      h("p", null, h("span", { class: "label-k", text: "Situation choisie : " }), cur.description),
      h("p", { class: "relation relation-" + cur.relation }, h("strong", { text: cur.relationLabel + ". " }), cur.relationText)
    );
  };

  V.cumulPanel = function (cmp, cfgOf) {
    var c = cmp.cumul;
    var wrap = h("section", { class: "card cumul", id: "cumul-panel", tabindex: "-1", "aria-label": "Justifications cumulées" });
    wrap.appendChild(h("h3", { text: "Justifications cumulées" }));
    wrap.appendChild(h("p", { class: "lead", text: c.statement }));
    var common = cfgOf(c.chains[0].configId);
    wrap.appendChild(
      h(
        "p",
        { class: "muted" },
        h("span", { class: "label-k", text: "Éléments communs aux deux chaînes : " }),
        "contenu (« " + common.content.full + " »), standard et constat."
      )
    );
    var chains = h("div", { class: "chains" });
    c.chains.forEach(function (ch) {
      var cfg = cfgOf(ch.configId);
      var j = P.justificationsOf(cfg)[0];
      var conc = P.idx.conceptions[cfg.conceptionId];
      var steps = [
        ["Contenu", "content", cfg.content.full],
        ["Référence de valeur", "reference", j.valueReference.full],
        ["Fonction", "function", j.function.full],
        ["Conclusion soutenue", null, cfg.assessment.supported],
        ["Reste à établir", null, cfg.assessment.remaining],
      ];
      chains.appendChild(
        h(
          "div",
          { class: "chain" },
          h("h4", { text: ch.title }),
          h("p", { class: "ccell-tag", text: cfg.tag + " · " + conc.label }),
          h(
            "ol",
            { class: "steps" },
            steps.map(function (st) {
              return h(
                "li",
                { class: st[1] ? "step step-" + st[1] : "step" },
                h("span", { class: "step-k", text: st[0] }),
                h("span", { text: st[2] })
              );
            })
          )
        )
      );
    });
    wrap.appendChild(chains);
    wrap.appendChild(h("p", { class: "notice", text: c.closing }));
    wrap.appendChild(h("p", { class: "muted", text: c.separation }));
    return wrap;
  };

  /* Catalogue : domaines, conceptions et couverture. */
  V.catalogue = function (open) {
    var wrap = h("div", { class: "catalogue" });
    wrap.appendChild(h("h2", { text: "Catalogue" }));
    wrap.appendChild(
      h("p", {
        class: "muted",
        text: "Les onze domaines et les cinq conceptions restent tous consultables. La mention « non intégrée » concerne la couverture de cette version, non la pertinence d'un critère sous une conception.",
      })
    );
    wrap.appendChild(h("h3", { text: "Domaines de critères" }));
    var dl = h("ol", { class: "domain-list" });
    D.domains.forEach(function (d) {
      var cmps = P.comparisonsOfDomain(d.id);
      dl.appendChild(
        h(
          "li",
          null,
          h("span", { class: "dom-name", text: d.label }),
          cmps.length
            ? h(
                "span",
                { class: "dom-cov" },
                cmps.map(function (c) {
                  return h("button", { type: "button", class: "link", text: c.title, onclick: function () { open(c.id); } });
                })
              )
            : h("span", { class: "np", text: "Non intégré à cette version" })
        )
      );
    });
    wrap.appendChild(dl);
    wrap.appendChild(h("h3", { text: "Conceptions de la valeur sociale" }));
    wrap.appendChild(
      h("p", {
        class: "muted",
        text: "Ces descriptions présentent chaque approche. Elles ne constituent pas des règles permettant de déduire automatiquement des critères.",
      })
    );
    var cl = h("dl", { class: "conc-list" });
    D.conceptions.forEach(function (c) {
      cl.appendChild(h("dt", { text: c.label }));
      cl.appendChild(h("dd", { text: c.description }));
    });
    wrap.appendChild(cl);

    wrap.appendChild(h("h3", { text: "Couverture : domaine × conception" }));
    var tbl = h("table", { class: "matrix" });
    var thead = h("tr", null, h("th", { scope: "col", text: "Domaine" }));
    D.conceptions.forEach(function (c) {
      thead.appendChild(h("th", { scope: "col", text: c.label }));
    });
    tbl.appendChild(h("thead", null, thead));
    var tb = h("tbody");
    D.domains.forEach(function (d) {
      var tr = h("tr", null, h("th", { scope: "row", text: d.label }));
      D.conceptions.forEach(function (c) {
        var hit = D.configurations.filter(function (cf) {
          return cf.domainId === d.id && cf.conceptionId === c.id;
        });
        var td = h("td");
        if (hit.length) {
          hit.forEach(function (cf) {
            var cmp = D.comparisons.filter(function (x) { return x.configIds.indexOf(cf.id) >= 0; })[0];
            td.appendChild(h("button", { type: "button", class: "link", text: "Intégrée : " + cmp.title, onclick: function () { open(cmp.id, c.id); } }));
          });
        } else td.appendChild(h("span", { class: "np", text: "Non intégrée" }));
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    wrap.appendChild(h("div", { class: "table-scroll" }, tbl));
    return wrap;
  };

  V.lexique = function () {
    var wrap = h("div", { class: "lexique" });
    wrap.appendChild(h("h2", { text: "Lexique" }));
    var dl = h("dl", { class: "conc-list" });
    D.lexique.forEach(function (e) {
      dl.appendChild(h("dt", { text: e.term }));
      dl.appendChild(h("dd", { text: e.definition }));
    });
    wrap.appendChild(dl);
    wrap.appendChild(
      h("p", {
        class: "notice",
        text: "L'application ne calcule aucun score global de valeur sociale, aucune pondération et aucun classement des conceptions. Une fonction instrumentale peut être essentielle à une valeur prioritaire.",
      })
    );
    return wrap;
  };

  V.referenceItem = function (r) {
    return h(
      "li",
      { id: "ref-" + r.id.replace(/^ref-/, ""), class: "ref", tabindex: "-1" },
      h("p", { class: "ref-full", text: r.full }),
      r.doi
        ? h("p", null, h("a", { href: "https://doi.org/" + r.doi, target: "_blank", rel: "noopener noreferrer", text: "https://doi.org/" + r.doi }))
        : null,
      h("p", { class: "muted" }, h("span", { class: "label-k", text: "Établit : " }), r.establishes)
    );
  };

  V.origine = function () {
    var wrap = h("div", { class: "origine" });
    wrap.appendChild(h("h2", { text: "Origine du modèle" }));
    wrap.appendChild(
      h(
        "ul",
        { class: "plain" },
        h("li", { text: "Les onze domaines sont empruntés à Teasdale, dans la version retenue par l'article." }),
        h("li", { text: "Les cinq conceptions sont empruntées à de la Cruz Jara et Spanjol." }),
        h("li", {
          text: "L'organisation du prisme en contenu, référence de valeur et fonction, ainsi que les comparaisons présentées ici, appartiennent au travail analytique de l'article en cours.",
        }),
        h("li", {
          text: "Pour les exemples, les publications établissent les prémisses conceptuelles. Les formulations des critères, les situations et leurs comparaisons proviennent du manuscrit. Aucune formulation d'exemple n'est une citation littérale d'un auteur.",
        })
      )
    );
    wrap.appendChild(h("h3", { text: "Références" }));
    var ol = h("ol", { class: "refs" });
    D.references.forEach(function (r) {
      ol.appendChild(V.referenceItem(r));
    });
    wrap.appendChild(ol);
    wrap.appendChild(h("h3", { text: "Historique des modifications du catalogue" }));
    wrap.appendChild(
      h(
        "ul",
        { class: "plain" },
        D.changelog.map(function (c) {
          return h("li", { text: c.date + " : " + c.note });
        })
      )
    );
    return wrap;
  };

  /* Vue imprimable : contexte, contenus, justifications, conditions, conclusions, références. */
  V.printView = function (cmp, state) {
    var root = h("div", { class: "print-doc" });
    root.appendChild(h("h1", { text: "Le prisme des critères" }));
    root.appendChild(h("h2", { text: cmp.title + " : " + cmp.subtitle }));
    var slots = state.slots.map(function (s) {
      return { conceptionId: s.conceptionId, cfg: P.configFor(cmp, s.conceptionId) };
    });
    if (cmp.contextMode === "common") root.appendChild(V.contextCard(P.idx.contexts[cmp.contextId]));
    if (cmp.contextChangeNotice) root.appendChild(h("p", { class: "notice", text: cmp.contextChangeNotice }));
    root.appendChild(V.annotations(cmp));
    var used = {};
    slots.forEach(function (s, i) {
      if (!s.cfg) {
        root.appendChild(V.placeholderConfig(s.conceptionId, "Prisme " + (i + 1)));
        return;
      }
      used[s.cfg.id] = true;
      var sec = h("section", { class: "print-cfg" });
      sec.appendChild(h("h3", { text: s.cfg.tag + " : " + P.idx.conceptions[s.cfg.conceptionId].label }));
      if (cmp.contextMode === "per-config") sec.appendChild(V.contextCard(P.idx.contexts[s.cfg.contextId], { heading: "Contexte de ce contre-exemple" }));
      sec.appendChild(h("p", { class: "muted", text: P.idx.conceptions[s.cfg.conceptionId].description }));
      P.FACE_ORDER.forEach(function (fid) {
        sec.appendChild(V.faceDetail(s.cfg, fid, 0));
      });
      var comp = s.cfg.completeness;
      sec.appendChild(h("p", { class: "muted" }, h("span", { class: "label-k", text: "Complétude : " }), comp.status + ". " + comp.note));
      root.appendChild(sec);
    });
    if (cmp.situations) {
      cmp.situations.forEach(function (sit) {
        var sec = h("section", { class: "print-cfg" });
        sec.appendChild(h("h3", { text: "Situation : " + sit.label }));
        sec.appendChild(h("p", { text: sit.description }));
        sec.appendChild(h("p", null, h("strong", { text: sit.relationLabel + ". " }), sit.relationText));
        sec.appendChild(V.conclusions(cmp, slots, sit));
        root.appendChild(sec);
      });
      root.appendChild(h("p", { class: "notice", text: cmp.situationsWarning }));
    } else {
      root.appendChild(V.conclusions(cmp, slots, null));
    }
    if (cmp.cumul && slots.every(function (s) { return s.cfg; })) {
      root.appendChild(V.cumulPanel(cmp, function (id) { return P.idx.configurations[id]; }));
    }
    root.appendChild(h("h3", { text: "Références" }));
    var ol = h("ol", { class: "refs" });
    D.references.forEach(function (r) {
      ol.appendChild(h("li", null, h("span", { text: r.full }), r.doi ? h("span", { text: " https://doi.org/" + r.doi }) : null));
    });
    root.appendChild(ol);
    root.appendChild(h("p", { class: "muted", text: "Le prisme des critères, PRISME MYRIA. Situations construites à des fins de raisonnement. Aucun score, aucune pondération, aucun classement." }));
    root.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
    return root;
  };
})();
