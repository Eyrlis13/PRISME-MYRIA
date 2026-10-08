/* Orchestration : état, sélection des configurations, rendu de la comparaison. */
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
    view: P.supports3D() ? "3d" : "flat",
    sync: true,
    angles: [0, 0],
    jIdx: [0, 0],
    situationId: null,
    cumul: false,
    hintDismissed: {},
    print: false,
  };

  var app = document.getElementById("app");
  var printRoot = document.getElementById("print-root");
  var prisms = [];

  function group() {
    return P.idx.comparisons[state.groupId];
  }

  function loadGroup(groupId, preferredConception) {
    var cmp = P.idx.comparisons[groupId];
    state.groupId = groupId;
    state.domainId = cmp.domainId;
    state.slots = cmp.configIds.map(function (id) {
      return { conceptionId: P.idx.configurations[id].conceptionId };
    });
    if (preferredConception) state.slots[0] = { conceptionId: preferredConception };
    state.angles = [0, 0];
    state.jIdx = [0, 0];
    state.cumul = false;
    state.situationId = cmp.situations ? cmp.situations[0].id : null;
  }

  function slotsResolved() {
    var cmp = group();
    return state.slots.map(function (s) {
      return { conceptionId: s.conceptionId, cfg: cmp ? P.configFor(cmp, s.conceptionId) : null };
    });
  }

  /* ---------- routage par fragment ---------- */
  function route() {
    var m = (location.hash || "").match(/^#\/(origine|catalogue|lexique)(?:\/(.+))?$/);
    var prev = state.tab;
    state.tab = m ? m[1] : "comparaisons";
    render();
    if (m && m[2]) {
      var target = document.getElementById(m[2]);
      if (target) {
        target.scrollIntoView({ block: "center" });
        target.focus({ preventScroll: true });
        target.classList.add("flash");
        setTimeout(function () { target.classList.remove("flash"); }, 1600);
      }
    } else if (prev !== state.tab) {
      window.scrollTo(0, 0);
    }
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.textContent = "";
    [
      ["comparaisons", "#/", "Comparaisons"],
      ["catalogue", "#/catalogue", "Catalogue"],
      ["lexique", "#/lexique", "Lexique"],
      ["origine", "#/origine", "Origine du modèle"],
    ].forEach(function (t) {
      nav.appendChild(
        h("a", { href: t[1], class: "tab" + (state.tab === t[0] ? " on" : ""), "aria-current": state.tab === t[0] ? "page" : null, text: t[2] })
      );
    });
  }

  function openFromCatalogue(cmpId, conceptionId) {
    loadGroup(cmpId, conceptionId);
    location.hash = "#/";
  }

  /* ---------- rendu général ---------- */
  function render() {
    renderNav();
    document.body.classList.toggle("print-preview", state.print);
    app.textContent = "";
    prisms = [];
    if (state.tab === "catalogue") app.appendChild(V.catalogue(openFromCatalogue));
    else if (state.tab === "lexique") app.appendChild(V.lexique());
    else if (state.tab === "origine") app.appendChild(V.origine());
    else renderComparison();
    renderPrint();
  }

  function renderPrint() {
    printRoot.textContent = "";
    if (!group()) return;
    printRoot.appendChild(
      h(
        "div",
        { class: "print-toolbar" },
        h("button", { type: "button", class: "btn primary", text: "Imprimer", onclick: function () { window.print(); } }),
        h("button", { type: "button", class: "btn", text: "Retour à l'application", onclick: function () { state.print = false; render(); } })
      )
    );
    printRoot.appendChild(V.printView(group(), { slots: state.slots }));
  }

  function select(label, id, options, value, onchange, disabled) {
    return h(
      "div",
      { class: "field" },
      h("label", { for: id, text: label }),
      h(
        "select",
        { id: id, onchange: function (e) { onchange(e.target.value); }, disabled: disabled },
        options.map(function (o) {
          return h("option", { value: o.value, selected: o.value === value, text: o.label });
        })
      )
    );
  }

  function renderComparison() {
    var cmp = group();
    var root = h("div", { class: "comparison" });

    root.appendChild(
      h(
        "section",
        { class: "intro" },
        h("h2", { class: "orient", text: "Explorer ce qu'un critère apprécie, pourquoi cela compte et ce que l'on peut en conclure." })
      )
    );

    /* Sélection : domaine, exemple, conceptions des deux prismes */
    var cmps = P.comparisonsOfDomain(state.domainId);
    var sel = h("section", { class: "card selectors", "aria-label": "Sélection des configurations" });
    sel.appendChild(
      select(
        "Domaine de critères",
        "sel-domain",
        D.domains.map(function (d) {
          return { value: d.id, label: d.label + (P.comparisonsOfDomain(d.id).length ? "" : " (non intégré à cette version)") };
        }),
        state.domainId,
        function (v) {
          state.domainId = v;
          var list = P.comparisonsOfDomain(v);
          if (list.length) loadGroup(list[0].id);
          else {
            state.groupId = null;
            state.slots = [];
          }
          render();
        }
      )
    );
    sel.appendChild(
      select(
        "Exemple documenté",
        "sel-group",
        cmps.length
          ? cmps.map(function (c) {
              return { value: c.id, label: (c.kind === "contre-exemple" ? "Contre-exemples : " : "") + c.title };
            })
          : [{ value: "", label: "Aucun exemple intégré" }],
        state.groupId,
        function (v) {
          loadGroup(v);
          render();
        },
        !cmps.length
      )
    );
    root.appendChild(sel);

    if (!cmp) {
      root.appendChild(
        h(
          "section",
          { class: "card placeholder", role: "status" },
          h("p", { class: "ph-main", text: P.NOT_INTEGRATED }),
          h("p", { class: "muted", text: P.NOT_INTEGRATED_NOTE })
        )
      );
      app.appendChild(root);
      return;
    }

    sel.appendChild(
      h(
        "div",
        { class: "slot-selects" },
        state.slots.map(function (s, i) {
          return select(
            "Conception du prisme " + (i + 1),
            "sel-slot-" + i,
            D.conceptions.map(function (c) {
              return { value: c.id, label: c.label + (P.configFor(cmp, c.id) ? "" : " (non intégrée)") };
            }),
            s.conceptionId,
            function (v) {
              state.slots[i] = { conceptionId: v };
              state.angles[i] = state.sync ? state.angles[1 - i] : 0;
              state.jIdx[i] = 0;
              state.cumul = false;
              render();
            }
          );
        })
      )
    );

    /* Barre d'outils */
    var tools = h("div", { class: "toolbar", role: "toolbar", "aria-label": "Affichage" });
    tools.appendChild(
      h(
        "div",
        { class: "seg", role: "group", "aria-label": "Mode de vue" },
        h("button", {
          type: "button",
          class: "btn",
          "aria-pressed": String(state.view === "3d"),
          disabled: !P.supports3D(),
          title: P.supports3D() ? null : "Le rendu 3D n'est pas disponible dans ce navigateur.",
          text: "Vue 3D",
          onclick: function () { state.view = "3d"; render(); },
        }),
        h("button", {
          type: "button",
          class: "btn",
          "aria-pressed": String(state.view === "flat"),
          text: "Vue plane",
          onclick: function () { state.view = "flat"; render(); },
        })
      )
    );
    if (state.view === "3d") {
      tools.appendChild(
        h(
          "label",
          { class: "check" },
          h("input", {
            type: "checkbox",
            id: "sync",
            checked: state.sync,
            onchange: function (e) {
              state.sync = e.target.checked;
              if (state.sync && prisms[0] && prisms[1]) {
                prisms[1].setAngle(prisms[0].angle(), true);
                state.angles[1] = prisms[0].angle();
                updateReading();
              }
            },
          }),
          h("span", { text: "Rotation synchronisée" })
        )
      );
      tools.appendChild(
        h("button", {
          type: "button",
          class: "btn",
          id: "reset",
          text: "Position initiale",
          onclick: function () {
            state.angles = [0, 0];
            prisms.forEach(function (p) { p.rotateToFace(0, true); });
            prisms.forEach(function (p, i) { if (p) state.angles[i] = p.angle(); });
            state.hintDismissed[cmp.id] = false;
            updateReading();
            updateHint();
          },
        })
      );
    }
    tools.appendChild(
      h("button", {
        type: "button",
        class: "btn",
        id: "print-btn",
        text: "Vue imprimable",
        onclick: function () { state.print = true; render(); window.scrollTo(0, 0); },
      })
    );
    root.appendChild(tools);

    /* Bannière et contexte */
    root.appendChild(
      h("section", { class: "example-head" }, h("h3", { text: cmp.title }), h("p", { class: "subtitle", text: cmp.subtitle }))
    );
    if (cmp.kind === "contre-exemple") {
      root.appendChild(h("p", { class: "notice warn", role: "note", id: "context-change", text: cmp.contextChangeNotice }));
    }
    if (cmp.contextMode === "common") root.appendChild(V.contextCard(P.idx.contexts[cmp.contextId]));

    root.appendChild(h("p", { class: "hint", id: "hint", role: "note" }));

    if (cmp.situations) {
      root.appendChild(
        V.situationBlock(cmp, state, function (id) {
          state.situationId = id;
          render();
        })
      );
    }

    /* Prismes ou fiches planes */
    var slots = slotsResolved();
    if (state.view === "3d") {
      var cols = h("div", { class: "cols two" });
      slots.forEach(function (s, i) {
        var col = h("div", { class: "col", "data-slot": String(i) });
        if (s.cfg) {
          col.appendChild(V.configHeader(s.cfg));
          if (cmp.contextMode === "per-config") col.appendChild(V.contextCard(P.idx.contexts[s.cfg.contextId], { heading: "Contexte de ce contre-exemple" }));
          var justs = P.justificationsOf(s.cfg);
          if (justs.length > 1) {
            col.appendChild(
              select(
                "Justification affichée",
                "sel-just-" + i,
                justs.map(function (j, n) { return { value: String(n), label: "Justification " + (n + 1) + " sur " + justs.length }; }),
                String(state.jIdx[i]),
                function (v) { state.jIdx[i] = Number(v); render(); }
              )
            );
          }
          var pr = P.createPrism({
            cfg: s.cfg,
            jIdx: state.jIdx[i],
            angle: state.angles[i],
            title: s.cfg.tag + ", conception " + P.idx.conceptions[s.cfg.conceptionId].label,
            onRotate: function (angle, faceIdx, phase) {
              state.angles[i] = angle;
              state.hintDismissed[cmp.id] = true;
              if (state.sync) {
                var other = prisms[1 - i];
                if (other) {
                  other.setAngle(angle, phase === "settle");
                  state.angles[1 - i] = angle;
                }
              }
              if (phase === "settle") updateReading();
              updateHint();
            },
          });
          prisms[i] = pr;
          col.appendChild(pr.el);
        } else {
          col.appendChild(V.placeholderConfig(s.conceptionId, "Prisme " + (i + 1)));
          prisms[i] = null;
        }
        cols.appendChild(col);
      });
      root.appendChild(cols);
      root.appendChild(h("div", { class: "facestatus", id: "facestatus", "aria-live": "polite" }));
      root.appendChild(h("section", { class: "reading", id: "reading", "aria-label": "Panneau de lecture" }));
    } else {
      root.appendChild(renderFlat(cmp, slots));
    }

    root.appendChild(V.annotations(cmp));

    /* Conclusions et cumul */
    var sit = cmp.situations ? cmp.situations.filter(function (x) { return x.id === state.situationId; })[0] : null;
    if (cmp.cumul && slots.every(function (s) { return s.cfg; })) {
      root.appendChild(
        h(
          "div",
          { class: "cumul-bar" },
          h("button", {
            type: "button",
            class: "btn accent",
            id: "cumul-btn",
            "aria-pressed": String(state.cumul),
            "aria-controls": "cumul-panel",
            text: cmp.cumul.buttonLabel,
            onclick: function () {
              state.cumul = !state.cumul;
              render();
              if (state.cumul) {
                var p = document.getElementById("cumul-panel");
                if (p) { p.scrollIntoView({ block: "start" }); p.focus({ preventScroll: true }); }
              }
            },
          })
        )
      );
      if (state.cumul) root.appendChild(V.cumulPanel(cmp, function (id) { return P.idx.configurations[id]; }));
    }
    root.appendChild(V.conclusions(cmp, slots, sit));

    app.appendChild(root);
    updateReading();
    updateHint();
  }

  function renderFlat(cmp, slots) {
    var wrap = h("section", { class: "flat", "aria-label": "Vue plane" });
    var head = h("div", { class: "cols two" });
    slots.forEach(function (s, i) {
      var c = h("div", { class: "col" });
      if (s.cfg) {
        c.appendChild(V.configHeader(s.cfg));
        if (cmp.contextMode === "per-config") c.appendChild(V.contextCard(P.idx.contexts[s.cfg.contextId], { heading: "Contexte de ce contre-exemple" }));
      } else c.appendChild(V.placeholderConfig(s.conceptionId, "Prisme " + (i + 1)));
      head.appendChild(c);
    });
    wrap.appendChild(head);
    P.FACE_ORDER.forEach(function (fid) {
      var rowEl = h("div", { class: "cols two flat-row" });
      slots.forEach(function (s) {
        var cell = h("div", { class: "col flat-card face-card-" + fid });
        if (s.cfg) {
          var f = P.getFace(s.cfg, fid, 0).value;
          cell.appendChild(h("p", { class: "ccell-tag", text: s.cfg.tag + " · " + P.idx.conceptions[s.cfg.conceptionId].label }));
          cell.appendChild(h("p", { class: "flat-short" + (f ? "" : " np"), text: f ? f.short : P.FUNCTION_UNSPECIFIED }));
          cell.appendChild(V.faceDetail(s.cfg, fid, 0));
        } else {
          cell.appendChild(h("p", { class: "np", text: P.NOT_INTEGRATED }));
        }
        rowEl.appendChild(cell);
      });
      wrap.appendChild(rowEl);
    });
    return wrap;
  }

  /* Panneau de lecture : suit la face au premier plan de chaque prisme. */
  function updateReading() {
    var panel = document.getElementById("reading");
    if (!panel) return;
    var cmp = group();
    panel.textContent = "";
    var slots = slotsResolved();
    var ids = [];
    var cols = h("div", { class: "cols two" });
    slots.forEach(function (s, i) {
      var col = h("div", { class: "col" });
      if (s.cfg && prisms[i]) {
        var fid = P.FACE_ORDER[prisms[i].faceIndex()];
        ids.push(fid);
        col.appendChild(h("p", { class: "ccell-tag", text: s.cfg.tag + " · " + P.idx.conceptions[s.cfg.conceptionId].label }));
        col.appendChild(V.faceDetail(s.cfg, fid, state.jIdx[i]));
      } else {
        col.appendChild(h("p", { class: "np", text: P.NOT_INTEGRATED }));
      }
      cols.appendChild(col);
    });
    panel.appendChild(h("h3", { text: "Panneau de lecture : face au premier plan" }));
    panel.appendChild(cols);
    var st = document.getElementById("facestatus");
    if (st) {
      st.textContent = "";
      if (ids.length === 2 && ids[0] === ids[1]) st.textContent = V.faceStatus(cmp, ids[0]);
    }
  }

  function updateHint() {
    var el = document.getElementById("hint");
    if (!el) return;
    var cmp = group();
    var show = state.view === "3d" && !state.hintDismissed[cmp.id];
    el.hidden = !show;
    el.textContent = show ? cmp.hint : "";
  }

  window.addEventListener("hashchange", route);
  if (state.view === "flat" && !P.supports3D()) document.body.classList.add("no3d");

  loadGroup("cmp-acces");
  route();
})();
