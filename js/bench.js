/*
 * Banc optique : source (domaine), prismes pentagonaux (conceptions), spectres.
 * Un prisme par configuration comparée. La face tournée vers le rayon est la
 * conception active. Le dessin est un SVG recalculé à chaque rotation.
 */
(function () {
  var P = window.PRISME;
  var D = P.data;
  var NS = "http://www.w3.org/2000/svg";
  var R = 78, SY = 0.4, H = 58, CX = 210, STEP = 72, SLOT_H = 280, TOP = 160;
  var RAY_COLORS = ["#7aa6e0", "#f0b54a", "#6cc192"];

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function norm(a) { return ((a % 360) + 360) % 360; }
  /* angle du prisme pour que la face k soit tournée vers le rayon (midangle 172°) */
  function thetaFor(k) { return 136 - STEP * k; }
  function faceFor(theta) { return ((Math.round((136 - theta) / STEP) % 5) + 5) % 5; }
  function pts(cx, cy, theta) {
    var a = [];
    for (var i = 0; i < 5; i++) {
      var r = (theta + STEP * i) * Math.PI / 180;
      a.push([cx + R * Math.cos(r), cy + SY * R * Math.sin(r), theta + STEP * i]);
    }
    return a;
  }
  function poly(p) { return p.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "); }

  /* Dessine un prisme dans le groupe g (vidé au préalable). */
  function drawPrism(g, cy, theta, labels, activeK, integrated) {
    while (g.firstChild) g.removeChild(g.firstChild);
    var top = pts(CX, cy, theta), bot = pts(CX, cy + H, theta);
    var faces = [];
    for (var i = 0; i < 5; i++) {
      var j = (i + 1) % 5;
      var mid = norm(theta + STEP * i + 36);
      faces.push({ i: i, j: j, mid: mid, front: Math.sin(mid * Math.PI / 180) > 0 });
    }
    faces.sort(function (a, b) { return Math.sin(a.mid * Math.PI / 180) - Math.sin(b.mid * Math.PI / 180); });
    faces.forEach(function (f) {
      if (f.front) return;
      g.appendChild(el("polygon", { class: "lat back", points: poly([top[f.i], top[f.j], bot[f.j], bot[f.i]]) }));
    });
    g.appendChild(el("polygon", { class: "bottom", points: poly(bot) }));
    faces.forEach(function (f) {
      if (!f.front) return;
      var cls = "lat" + (f.i === activeK ? " active" : "") + (f.i === activeK && !integrated ? " inert" : "");
      g.appendChild(el("polygon", { class: cls, points: poly([top[f.i], top[f.j], bot[f.j], bot[f.i]]) }));
    });
    g.appendChild(el("polygon", { class: "top", points: poly(top) }));
    faces.forEach(function (f) {
      if (f.i === activeK) return;
      var mx = (top[f.i][0] + top[f.j][0]) / 2, my = (top[f.i][1] + top[f.j][1]) / 2;
      var dx = mx - CX, dy = my - cy, len = Math.hypot(dx, dy) || 1;
      var far = f.front ? H + 16 : 14;
      var x = mx + dx / len * far, y = my + dy / len * far;
      var ang = Math.atan2(top[f.j][1] - top[f.i][1], top[f.j][0] - top[f.i][0]) * 180 / Math.PI;
      if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      /* faces arrière : l'étiquette s'écarte du sommet partagé pour ne pas rencontrer sa voisine */
      var anchor = f.front ? "middle" : (mx < CX - 6 ? "end" : mx > CX + 6 ? "start" : "middle");
      if (!f.front) { x = mx + dx / len * far + (mx < CX - 6 ? 10 : mx > CX + 6 ? -10 : 0); }
      var t = el("text", { class: "flab", x: x.toFixed(1), y: y.toFixed(1), "text-anchor": anchor, transform: "rotate(" + ang.toFixed(0) + " " + x.toFixed(1) + " " + y.toFixed(1) + ")" }, labels[f.i]);
      g.appendChild(t);
    });
    var lab = el("text", { class: "flab on", x: CX, y: (cy + H + SY * R + 26).toFixed(1), "text-anchor": "middle" });
    lab.appendChild(el("tspan", { class: "cap2" }, "FACE VERS LE RAYON · "));
    lab.appendChild(el("tspan", {}, labels[activeK]));
    g.appendChild(lab);
  }

  function spectrumPath(x, y, i) {
    var o = (i - 1) * 4, o2 = (i - 1) * 46;
    return "M" + x + " " + (y + o) + " C " + (x + 60) + " " + (y + o) + ", " + (x + 80) + " " + (y + o2) + ", " + (x + 150) + " " + (y + o2);
  }

  /*
   * opts: { slots: [{conceptionId, integrated}], onChange(slotIdx, conceptionId), slotNames }
   * conceptions dans l'ordre du catalogue ; chaque face k = D.conceptions[k].
   */
  P.createBench = function (opts) {
    var n = opts.slots.length;
    var labels = D.conceptions.map(function (c) { return c.label; });
    var benchH = TOP + SLOT_H * (n - 1) + H + 120;
    var svg = el("svg", { viewBox: "0 0 420 " + benchH, class: "bench-svg", role: "img", "aria-label": "Banc optique : rayon du domaine, prismes des conceptions, spectres des critères" });
    var defs = el("defs");
    defs.innerHTML =
      '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>' +
      '<linearGradient id="glassTop" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>' +
      '<linearGradient id="beamg" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></linearGradient>' +
      '<filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>' +
      '<filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>';
    svg.appendChild(defs);
    var srcY = benchH / 2;
    var inX = (CX - R * 0.809 - 2).toFixed(1);
    var beams = el("g", { class: "beams" });
    var rays = el("g", { class: "rays" });
    var prisms = [];
    var caps = el("g", { class: "caps" });
    caps.appendChild(el("text", { class: "cap", x: 20, y: 30 }, "LUMIÈRE BLANCHE"));
    caps.appendChild(el("text", { class: "cap sub", x: 20, y: 45 }, "le domaine choisi"));
    var ribbons = el("g", { class: "ribbons", "aria-hidden": "true" });
    ribbons.appendChild(el("path", { d: "M250 -40 L470 230 L470 330 L250 60 Z" }));
    ribbons.appendChild(el("path", { d: "M-60 " + (benchH - 40) + " L150 " + (benchH - 300) + " L230 " + (benchH - 300) + " L20 " + (benchH - 40) + " Z" }));
    svg.insertBefore(ribbons, svg.firstChild.nextSibling);
    svg.appendChild(beams); svg.appendChild(rays);

    var state = opts.slots.map(function (s, i) {
      var k = Math.max(0, D.conceptions.map(function (c) { return c.id; }).indexOf(s.conceptionId));
      return { k: k, theta: thetaFor(k), integrated: !!s.integrated, cy: TOP + SLOT_H * i, anim: null, drag: null };
    });

    state.forEach(function (st, i) {
      var inY = st.cy + H / 2;
      var g1 = el("path", { class: "beam", d: "M0 " + srcY + " L" + inX + " " + inY, "stroke-width": 18, filter: "url(#glow)" });
      var g2 = el("path", { class: "beam", d: "M0 " + srcY + " L" + inX + " " + inY, "stroke-width": 8 });
      beams.appendChild(g1); beams.appendChild(g2);
      var outX = CX + R - 6, outY = st.cy + H / 2;
      st.rayEls = [];
      var halo = el("g", { filter: "url(#soft)" });
      for (var r = 0; r < 3; r++) halo.appendChild(el("path", { class: "ray", stroke: RAY_COLORS[r], d: spectrumPath(outX, outY, r) }));
      rays.appendChild(halo);
      for (r = 0; r < 3; r++) { var p = el("path", { class: "ray", stroke: RAY_COLORS[r], d: spectrumPath(outX, outY, r) }); rays.appendChild(p); st.rayEls.push(p); }
      st.rayEls.push(halo);
      st.inert = el("path", { class: "beam inert", d: "M" + outX + " " + outY + " L420 " + outY, "stroke-width": 8 });
      rays.appendChild(st.inert);
      var g = el("g", { class: "prism", tabindex: "0", role: "slider", "aria-valuemin": 0, "aria-valuemax": 4, "aria-orientation": "horizontal", "data-slot": String(i) });
      svg.appendChild(g);
      st.g = g;
      caps.appendChild(el("text", { class: "cap", x: CX, y: st.cy - 68, "text-anchor": "middle" }, "PRISME " + (opts.slotNames ? opts.slotNames[i] : String.fromCharCode(65 + i))));
      bindInteraction(st, i);
      render(st);
    });
    caps.appendChild(el("text", { class: "cap sub", x: CX, y: benchH - 18, "text-anchor": "middle" }, "glisser, flèches ou touches 1 à 5 pour tourner un prisme"));
    svg.appendChild(caps);

    function render(st) {
      var k = faceFor(st.theta);
      drawPrism(st.g, st.cy, st.theta, labels, k, st.integrated);
      st.rayEls.forEach(function (e) { e.style.opacity = st.integrated ? "" : "0"; });
      st.inert.style.opacity = st.integrated ? "0" : "";
      st.g.setAttribute("aria-valuenow", String(k));
      st.g.setAttribute("aria-valuetext", "Face vers le rayon : " + labels[k] + (st.integrated ? "" : " (configuration non intégrée)"));
      st.g.setAttribute("aria-label", "Prisme " + (st.g.dataset.slot * 1 + 1) + ", conception " + labels[k]);
    }

    function animateTo(st, i, k, source) {
      var target = thetaFor(k);
      var cur = st.theta;
      var delta = ((target - cur + 540) % 360) - 180;
      if (st.anim) cancelAnimationFrame(st.anim);
      if (reducedMotion() || Math.abs(delta) < 0.5) {
        st.theta = target; st.k = k; render(st); if (source !== "sync") opts.onChange(i, D.conceptions[k].id);
        return;
      }
      var t0 = performance.now(), dur = 520, from = cur;
      function step(t) {
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        st.theta = from + delta * e;
        render(st);
        if (p < 1) st.anim = requestAnimationFrame(step);
        else { st.anim = null; st.theta = target; st.k = k; render(st); if (source !== "sync") opts.onChange(i, D.conceptions[k].id); }
      }
      st.anim = requestAnimationFrame(step);
    }

    function bindInteraction(st, i) {
      var g = st.g;
      g.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        st.drag = { x: e.clientX, theta: st.theta, moved: false };
        g.setPointerCapture(e.pointerId);
        g.classList.add("dragging");
        e.preventDefault();
      });
      g.addEventListener("pointermove", function (e) {
        if (!st.drag) return;
        var dx = e.clientX - st.drag.x;
        if (Math.abs(dx) > 3) st.drag.moved = true;
        st.theta = st.drag.theta + dx * 0.6;
        render(st);
      });
      function end() {
        if (!st.drag) return;
        var moved = st.drag.moved; st.drag = null; g.classList.remove("dragging");
        var k = faceFor(st.theta);
        if (moved) animateTo(st, i, k, "drag");
        else animateTo(st, i, (st.k + 1) % 5, "click");
      }
      g.addEventListener("pointerup", end);
      g.addEventListener("pointercancel", end);
      g.addEventListener("keydown", function (e) {
        var handled = true;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") animateTo(st, i, (st.k + 1) % 5, "key");
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") animateTo(st, i, (st.k + 4) % 5, "key");
        else if (/^[1-5]$/.test(e.key)) animateTo(st, i, Number(e.key) - 1, "key");
        else if (e.key === "Home") animateTo(st, i, opts.initial ? opts.initial[i] : st.k, "key");
        else handled = false;
        if (handled) e.preventDefault();
      });
    }

    return {
      el: svg,
      /* met à jour l'état d'intégration et la face, sans rappeler onChange */
      set: function (i, conceptionId, integrated, animated) {
        var st = state[i];
        var k = D.conceptions.map(function (c) { return c.id; }).indexOf(conceptionId);
        st.integrated = !!integrated;
        if (k >= 0 && k !== st.k) { if (animated) animateTo(st, i, k, "sync"); else { st.k = k; st.theta = thetaFor(k); } }
        render(st);
      },
      rotateTo: function (i, k) { animateTo(state[i], i, k, "button"); },
      focus: function (i) { state[i].g.focus(); },
    };
  };
})();
