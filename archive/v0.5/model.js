/*
 * Vue « Modèle conceptuel » : le trajet du faisceau, hors exemple.
 * Propriété à apprécier → conception de la valeur → références compatibles →
 * précision dans la situation → référence retenue → critère (contenu, fonction, référence)
 * → conclusions autorisées selon la fonction.
 */
(function () {
  var P = window.PRISME;
  var D = P.data;
  var M = D.model;
  var h = P.h;
  var NS = "http://www.w3.org/2000/svg";
  var AMBER = "#f0b54a", GREEN = "#6cc192";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function rad(a) { return a * Math.PI / 180; }

  /* Prisme vu en coupe. horizontal : le faisceau entre par la face gauche ; vertical : par la face du haut. */
  function prismSvg(horizontal) {
    var W = 200, H = 200, cx = 100, cy = 100, R = 62, apo = R * Math.cos(rad(36));
    var base = horizontal ? 144 : -126;
    var s = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "m-prism " + (horizontal ? "is-h" : "is-v"), "aria-hidden": "true" });
    var dx = 12, dy = -9;
    function pent(ox, oy) {
      var pts = [];
      for (var k = 0; k < 5; k++) { var a = rad(base + 72 * k); pts.push((cx + ox + R * Math.cos(a)).toFixed(1) + "," + (cy + oy + R * Math.sin(a)).toFixed(1)); }
      return pts.join(" ");
    }
    s.appendChild(svgEl("polygon", { class: "p-back", points: pent(dx, dy) }));
    s.appendChild(svgEl("polygon", { class: "p-front m-glass", points: pent(0, 0) }));
    var inX = horizontal ? cx - apo : cx, inY = horizontal ? cy : cy - apo;
    var outX = horizontal ? cx + R : cx, outY = horizontal ? cy : cy + R;
    /* face d'entrée */
    var a0 = rad(base), a1 = rad(base + 72);
    s.appendChild(svgEl("line", { class: "p-active", x1: cx + R * Math.cos(a0), y1: cy + R * Math.sin(a0), x2: cx + R * Math.cos(a1), y2: cy + R * Math.sin(a1) }));
    s.appendChild(svgEl("line", { class: "in-white", x1: inX, y1: inY, x2: cx, y2: cy }));
    /* dans le verre, la lumière s'oriente : un cône ambré vers la sortie */
    var cone = horizontal
      ? "M" + cx + " " + cy + " L" + outX + " " + (outY - 9) + " L" + outX + " " + (outY + 9) + " Z"
      : "M" + cx + " " + cy + " L" + (outX - 9) + " " + outY + " L" + (outX + 9) + " " + outY + " Z";
    s.appendChild(svgEl("path", { d: cone, fill: AMBER, opacity: ".45" }));
    s.dataset.in = inX + "," + inY;
    s.dataset.out = outX + "," + outY;
    s.dataset.vb = W + "," + H;
    return s;
  }

  /* Éventail des références compatibles et fente de précision. */
  function fanSvg(horizontal) {
    var L = 300, Wd = 200, slit = 205, origin = 100;
    var cands = [30, 68, 114, 160], pick = 2;
    var s = svgEl("svg", { viewBox: horizontal ? "0 0 " + L + " " + Wd : "0 0 " + Wd + " " + L, class: "m-fan " + (horizontal ? "is-h" : "is-v"), "aria-hidden": "true" });
    function P2(along, across) { return horizontal ? [along, across] : [across, along]; }
    function line(a, b, attrs) { var p = P2(a[0], a[1]), q = P2(b[0], b[1]); attrs.x1 = p[0]; attrs.y1 = p[1]; attrs.x2 = q[0]; attrs.y2 = q[1]; s.appendChild(svgEl("line", attrs)); }
    cands.forEach(function (c, i) {
      line([0, origin], [slit, c], { class: "cand" + (i === pick ? " picked" : ""), stroke: AMBER });
    });
    /* fente : deux segments laissant une ouverture sur la référence retenue */
    var gap = 9, sel = cands[pick];
    line([slit, 8], [slit, sel - gap], { class: "slit" });
    line([slit, sel + gap], [slit, Wd - 8], { class: "slit" });
    var slope = (sel - origin) / slit;
    var exitAcross = sel + slope * (L - slit);
    line([slit, sel], [L, exitAcross], { class: "kept", stroke: AMBER });
    var pin = P2(0, origin), pout = P2(L, exitAcross);
    s.dataset.in = pin.join(",");
    s.dataset.out = pout.join(",");
    s.dataset.vb = (horizontal ? [L, Wd] : [Wd, L]).join(",");
    return s;
  }

  function relBtn(relId, cls, children, api, label) {
    return h("button", { type: "button", class: "rel " + (cls || ""), "data-rel": relId, "aria-label": label || null, onclick: function () { api.openRelation(relId); } }, children);
  }

  P.renderModel = function (api) {
    var st = M.stations, dims = M.dimensions;
    var scene = h("section", { class: "optic model", id: "model", "aria-label": M.title });
    var overlay = svgEl("svg", { class: "rays-overlay", "aria-hidden": "true" });
    scene.appendChild(overlay);
    var inner = h("div", { class: "wrap model-inner" });
    scene.appendChild(inner);

    inner.appendChild(h("header", { class: "m-head" }, h("h2", { text: M.title }), h("p", { class: "m-lead", text: M.lead.text })));

    var fDomain = h("div", { class: "frame f-domain" }, h("span", { class: "frame-tab", title: M.frames.domain.note, text: M.frames.domain.label }));
    var row = h("div", { class: "m-row" });

    row.appendChild(h("div", { class: "st st-prop" },
      h("span", { class: "lamp-glow", "data-anchor": "prop", "aria-hidden": "true" }),
      h("span", { class: "st-label", text: st.property.label }),
      h("span", { class: "st-cap", text: st.property.caption })));

    row.appendChild(h("div", { class: "st st-prism" },
      relBtn("orientation", "prism-btn", [prismSvg(true), prismSvg(false)], api, st.conception.label + " : ce que la conception mobilise"),
      h("span", { class: "st-label", text: st.conception.label }),
      h("span", { class: "st-cap", text: st.conception.caption })));

    var fSit = h("div", { class: "frame f-sit" }, h("span", { class: "frame-tab", title: M.frames.situation.note, text: M.frames.situation.label }));
    var sitRow = h("div", { class: "m-sit-row" });
    sitRow.appendChild(h("div", { class: "st st-fan" },
      fanSvg(true), fanSvg(false),
      h("div", { class: "fan-labels" },
        relBtn("orientation", "fan-l", [h("span", { class: "st-label", text: st.compatible.label }), h("span", { class: "st-cap", text: st.compatible.caption })], api),
        relBtn("precision", "fan-r", [h("span", { class: "st-label", text: st.precision.label }), h("span", { class: "st-cap", text: st.precision.caption })], api))));

    var crit = h("div", { class: "crit" },
      h("p", { class: "crit-title", text: st.criterion.label }),
      h("div", { class: "dim dim-content", "data-anchor": "content" },
        h("span", { class: "dk", text: dims.content.label }), h("span", { class: "dq", text: dims.content.question })),
      relBtn("fonction", "dim dim-function", [
        h("span", { class: "fn-link", "aria-hidden": "true" }),
        h("span", { class: "dk" }, dims.function.label, h("span", { class: "fn-kinds", text: "directe · instrumentale · les deux" })),
        h("span", { class: "dq", text: dims.function.question })], api),
      h("div", { class: "dim dim-reference", "data-anchor": "reference" },
        h("span", { class: "dk" }, st.retained.label, h("span", { class: "dtag", text: dims.reference.tag })),
        h("span", { class: "dq", text: dims.reference.question })));
    sitRow.appendChild(h("div", { class: "st st-crit" }, crit));
    fSit.appendChild(sitRow);
    row.appendChild(fSit);
    fDomain.appendChild(relBtn("P1", "callout c-p1", [h("span", { class: "pk", text: "P1" }), h("span", { class: "ptxt", text: M.propositions.P1.text }), h("span", { class: "more", "aria-hidden": "true", text: "›" })], api));
    fDomain.appendChild(row);
    inner.appendChild(fDomain);

    /* Section 4 : fonctions et conclusions */
    var F = M.functions;
    var func = h("section", { class: "m-func", "aria-label": F.title });
    func.appendChild(h("h3", { class: "mf-title", text: F.title }));
    var grid = h("div", { class: "mf-grid" });
    F.items.forEach(function (it, i) {
      grid.appendChild(h("div", { class: "mf-just", "data-anchor": i === 0 ? "just-a" : "just-b", style: "grid-column:" + (i ? 3 : 1) + ";grid-row:1" },
        h("p", { class: "mf-simple", text: "« " + it.simple + " »" }),
        h("p", { class: "mf-name" }, h("span", { class: "fn-dot", "aria-hidden": "true" }), "Nom scientifique : ", h("strong", { text: it.name })),
        h("p", { class: "mf-note", text: it.note })));
    });
    grid.appendChild(h("div", { class: "mf-inputs", style: "grid-column:1 / -1;grid-row:2" },
      h("div", { class: "mf-in" }, h("span", { class: "mf-k", text: F.inputs.label }), h("span", { text: F.inputs.text })),
      relBtn("P2", "callout c-p2", [h("span", { class: "pk", text: "P2" }), h("span", { class: "ptxt", text: M.propositions.P2.text }), h("span", { class: "more", "aria-hidden": "true", text: "›" })], api)));
    F.items.forEach(function (it, i) {
      var col = i ? 3 : 1;
      grid.appendChild(h("div", { class: "mf-concl", style: "grid-column:" + col + ";grid-row:3" },
        h("span", { class: "mf-k" }, "Conclusion autorisée", h("span", { class: "mf-tag", text: it.name })),
        h("p", { class: "mf-main", text: it.allowed }),
        it.condition ? h("p", { class: "mf-cond", text: it.condition }) : null));
      grid.appendChild(h("div", { class: "mf-remain", style: "grid-column:" + col + ";grid-row:4" },
        h("span", { class: "mf-k", text: "Éléments restant à établir" }),
        h("p", { text: it.remaining })));
    });
    func.appendChild(grid);
    func.appendChild(h("ul", { class: "mf-notes" }, F.notes.map(function (n) { return h("li", { text: n }); })));
    inner.appendChild(func);

    inner.appendChild(h("p", { class: "m-foot" },
      h("button", { type: "button", class: "link-light small", id: "notes-btn", onclick: api.openNotes }, "Notes et références"),
      h("span", { class: "sep", "aria-hidden": "true", text: "·" }),
      h("a", { class: "link-light small", href: "#/illustrations", text: "Voir les illustrations" })));
    return scene;
  };

  /* ---------- faisceaux, calculés d'après la mise en page ---------- */
  function visible(el) { return el && el.getBoundingClientRect().width > 0; }
  function svgPoint(svg, which) {
    var vb = svg.dataset.vb.split(",").map(Number), p = svg.dataset[which].split(",").map(Number);
    var r = svg.getBoundingClientRect();
    return { x: r.left + p[0] * r.width / vb[0], y: r.top + p[1] * r.height / vb[1] };
  }

  P.drawModelRays = function (scene) {
    if (!scene) return;
    var svg = scene.querySelector(".rays-overlay");
    var box = scene.getBoundingClientRect();
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = svgEl("defs");
    defs.innerHTML = '<marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="' + AMBER + '"/></marker>' +
      '<marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="' + GREEN + '"/></marker>';
    svg.appendChild(defs);
    function rel(p) { return { x: p.x - box.left, y: p.y - box.top }; }
    function rect(el) { var r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left, cy: (r.top + r.bottom) / 2 - box.top }; }
    function path(d, cls, color, marker) { var e = svgEl("path", { d: d, class: cls }); if (color) e.setAttribute("stroke", color); if (marker) e.setAttribute("marker-end", "url(#" + marker + ")"); svg.appendChild(e); }
    function curve(a, b, horiz) {
      if (horiz) { var mx = (a.x + b.x) / 2; return "M" + a.x + " " + a.y + " C " + mx + " " + a.y + ", " + mx + " " + b.y + ", " + b.x + " " + b.y; }
      var my = (a.y + b.y) / 2; return "M" + a.x + " " + a.y + " C " + a.x + " " + my + ", " + b.x + " " + my + ", " + b.x + " " + b.y;
    }

    var prismH = scene.querySelector(".m-prism.is-h"), prismV = scene.querySelector(".m-prism.is-v");
    var horiz = visible(prismH);
    var prism = horiz ? prismH : prismV;
    var fan = scene.querySelector(".m-fan.is-" + (horiz ? "h" : "v"));
    var lamp = rect(scene.querySelector('[data-anchor="prop"]'));
    var pin = rel(svgPoint(prism, "in")), pout = rel(svgPoint(prism, "out"));
    var fin = rel(svgPoint(fan, "in")), fout = rel(svgPoint(fan, "out"));
    var a0 = horiz ? { x: lamp.r - 4, y: lamp.cy } : { x: lamp.cx, y: lamp.b - 4 };

    /* propriété → conception : faisceau blanc */
    var d1 = curve(a0, pin, horiz);
    path(d1, "beam-glow"); path(d1, "beam-core");
    /* conception → éventail : la lumière orientée */
    var d2 = curve(pout, fin, horiz);
    path(d2, "beam-glow"); path(d2, "beam-core warm");

    /* fente → référence retenue : même couleur que la bande Référence */
    var refBand = rect(scene.querySelector('[data-anchor="reference"]'));
    var contBand = rect(scene.querySelector('[data-anchor="content"]'));
    var target = { x: refBand.l + 2, y: refBand.cy };
    var d3;
    if (horiz) d3 = curve(fout, target, true);
    else {
      var lane = refBand.l - 12;
      var ct = rect(scene.querySelector(".crit-title"));
      var yL = Math.max(fout.y + 40, Math.min(fout.y + 60, ct.t - 6));
      d3 = "M" + fout.x + " " + fout.y + " C " + fout.x + " " + (fout.y + (yL - fout.y) / 2) + ", " + lane + " " + (fout.y + (yL - fout.y) / 3) + ", " + lane + " " + yL +
        " L " + lane + " " + (target.y - 12) + " Q " + lane + " " + target.y + ", " + (lane + 12) + " " + target.y + " L " + target.x + " " + target.y;
    }
    path(d3, "ray-glow", AMBER); path(d3, "ray-core", AMBER);

    /* la référence oriente le contenu : arc ambré à droite du critère */
    var rx = Math.max(refBand.r, contBand.r) + 4;
    var bulge = horiz ? 30 : 14;
    path("M" + rx + " " + refBand.cy + " C " + (rx + bulge) + " " + refBand.cy + ", " + (rx + bulge) + " " + contBand.cy + ", " + (rx + 2) + " " + contBand.cy, "orient-arc", AMBER, "arr-amber");

    /* critère → justifications : liens verts, à angle droit, sous le titre de la section */
    var fn = rect(scene.querySelector(".crit"));
    var ja = rect(scene.querySelector('[data-anchor="just-a"]')), jb = rect(scene.querySelector('[data-anchor="just-b"]'));
    var title = rect(scene.querySelector(".mf-title"));
    var x0 = fn.cx, y0 = fn.b + 2;
    if (jb.t > ja.b) {
      /* empilé (téléphone) : un seul lien jusqu'au titre */
      path("M" + x0 + " " + y0 + " L " + x0 + " " + (title.t - 6), "fn-line", GREEN, "arr-green");
    } else {
      var yH = title.b + 14, r = 12;
      [ja, jb].forEach(function (j) {
        var tx = j.cx, dir = tx < x0 ? -1 : 1;
        var d = Math.abs(tx - x0) < 2
          ? "M" + x0 + " " + y0 + " L " + tx + " " + (j.t - 3)
          : "M" + x0 + " " + y0 + " L " + x0 + " " + (yH - r) + " Q " + x0 + " " + yH + ", " + (x0 + dir * r) + " " + yH +
            " L " + (tx - dir * r) + " " + yH + " Q " + tx + " " + yH + ", " + tx + " " + (yH + r) + " L " + tx + " " + (j.t - 3);
        path(d, "fn-line", GREEN, "arr-green");
      });
    }
  };
})();
