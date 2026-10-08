/*
 * Cadran-prisme : un prisme pentagonal vu en coupe. Chaque côté est une
 * conception de la valeur sociale ; le côté du haut reçoit le rayon.
 * On le tourne en cliquant un nom, en glissant, ou au clavier.
 */
(function () {
  var P = window.PRISME;
  var D = P.data;
  var NS = "http://www.w3.org/2000/svg";
  var W = 440, HGT = 270, CX = 220, CY = 128, R = 70, STEP = 72;
  var DEPTH = { x: 16, y: -12 };
  var RAYS = ["#7aa6e0", "#f0b54a", "#6cc192"];

  function reduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function rad(a) { return a * Math.PI / 180; }
  function verts(phi, dx, dy) {
    var v = [];
    for (var k = 0; k < 5; k++) { var a = rad(-126 + STEP * k + phi); v.push([CX + (dx || 0) + R * Math.cos(a), CY + (dy || 0) + R * Math.sin(a)]); }
    return v;
  }
  function pts(v) { return v.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  function phiFor(k) { return -STEP * k; }
  function faceAt(phi) { return ((Math.round(-phi / STEP) % 5) + 5) % 5; }
  var APO = R * Math.cos(rad(36));

  /*
   * opts : { conceptionId, integrated, letter, onChange(conceptionId) }
   * Renvoie { el, set(conceptionId, integrated), entry(), exit(), focus() }.
   */
  P.createDial = function (opts) {
    var ids = D.conceptions.map(function (c) { return c.id; });
    var labels = D.conceptions.map(function (c) { return c.label; });
    var k = Math.max(0, ids.indexOf(opts.conceptionId));
    var phi = phiFor(k), anim = null, drag = null, integrated = !!opts.integrated;

    var svg = el("svg", { viewBox: "0 0 " + W + " " + HGT, class: "dial-svg", "aria-hidden": "true" });
    svg.innerHTML =
      '<defs><linearGradient id="g-' + opts.letter + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset=".55" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>' +
      '<filter id="glow-' + opts.letter + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>';
    var body = el("g"); svg.appendChild(body);
    var inner = el("g", { class: "inner" }); svg.appendChild(inner);
    var labs = el("g", { class: "labels" }); svg.appendChild(labs);

    var wrap = document.createElement("div");
    wrap.className = "dial";
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "slider");
    wrap.setAttribute("aria-valuemin", "1");
    wrap.setAttribute("aria-valuemax", "5");
    wrap.setAttribute("aria-label", "Prisme " + opts.letter + " : conception tournée vers le rayon");
    wrap.appendChild(svg);

    function draw() {
      while (body.firstChild) body.removeChild(body.firstChild);
      while (inner.firstChild) inner.removeChild(inner.firstChild);
      while (labs.firstChild) labs.removeChild(labs.firstChild);
      var front = verts(phi), back = verts(phi, DEPTH.x, DEPTH.y);
      var settled = Math.abs(phi - phiFor(faceAt(phi))) < 0.5;
      var active = faceAt(phi);
      body.appendChild(el("polygon", { class: "p-back", points: pts(back) }));
      for (var i = 0; i < 5; i++) body.appendChild(el("line", { class: "p-edge", x1: front[i][0], y1: front[i][1], x2: back[i][0], y2: back[i][1] }));
      body.appendChild(el("polygon", { class: "p-front", points: pts(front), fill: "url(#g-" + opts.letter + ")" }));
      /* côté actif : celui du haut */
      var a0 = front[active], a1 = front[(active + 1) % 5];
      if (settled) {
        body.appendChild(el("line", { class: "p-active-glow", x1: a0[0], y1: a0[1], x2: a1[0], y2: a1[1], filter: "url(#glow-" + opts.letter + ")" }));
        body.appendChild(el("line", { class: "p-active" + (integrated ? "" : " inert"), x1: a0[0], y1: a0[1], x2: a1[0], y2: a1[1] }));
        /* lumière dans le verre : blanche jusqu'au centre, puis décomposée vers le sommet du bas */
        var top = [CX, CY - APO], bottom = [CX, CY + R];
        inner.appendChild(el("line", { class: "in-white", x1: top[0], y1: top[1], x2: CX, y2: CY + 6 }));
        if (integrated) {
          RAYS.forEach(function (c, j) {
            inner.appendChild(el("line", { class: "in-ray", stroke: c, x1: CX, y1: CY + 6, x2: bottom[0] + (j - 1) * 5, y2: bottom[1] - 2 }));
          });
        } else inner.appendChild(el("line", { class: "in-white faint", x1: CX, y1: CY + 6, x2: bottom[0], y2: bottom[1] }));
      }
      /* noms des conceptions, à l'extérieur de chaque côté (sauf le côté actif) */
      for (var f = 0; f < 5; f++) {
        var ang = -90 + STEP * f + phi;
        var isActive = f === active && settled;
        if (isActive) continue;
        var c = Math.cos(rad(ang)), s = Math.sin(rad(ang));
        var rr = APO + 20;
        var x = CX + rr * c + (s < -0.2 ? DEPTH.x * 0.5 : 0), y = CY + rr * s + 4 + (s < -0.2 ? DEPTH.y * 0.5 : 0);
        var anchor = c > 0.3 ? "start" : c < -0.3 ? "end" : "middle";
        var t = el("text", { class: "p-lab", x: x.toFixed(1), y: y.toFixed(1), "text-anchor": anchor, "data-face": String(f) });
        var words = labels[f].split(" ");
        if (labels[f].length > 16 && words.length > 1) {
          /* nom long : deux lignes, centrées verticalement sur la position */
          var cut = Math.ceil(words.length / 2);
          t.setAttribute("y", (y - 7).toFixed(1));
          t.appendChild(el("tspan", { x: x.toFixed(1) }, words.slice(0, cut).join(" ")));
          t.appendChild(el("tspan", { x: x.toFixed(1), dy: "15" }, words.slice(cut).join(" ")));
        } else t.textContent = labels[f];
        (function (ff) { t.addEventListener("click", function (e) { e.stopPropagation(); rotateTo(ff, true); }); })(f);
        labs.appendChild(t);
      }
      wrap.setAttribute("aria-valuenow", String(active + 1));
      wrap.setAttribute("aria-valuetext", labels[active] + (integrated ? "" : " (configuration non intégrée)"));
    }

    function rotateTo(target, notify) {
      var to = phiFor(target);
      var delta = ((to - phi + 540) % 360) - 180;
      if (anim) cancelAnimationFrame(anim);
      var done = function () { phi = to; k = target; draw(); if (notify) opts.onChange(ids[target]); };
      if (reduced() || Math.abs(delta) < 0.5) { done(); return; }
      var from = phi, t0 = performance.now(), dur = 560;
      wrap.classList.add("turning");
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        phi = from + delta * e; draw();
        if (p < 1) anim = requestAnimationFrame(step); else { anim = null; wrap.classList.remove("turning"); done(); }
      })(t0);
    }

    function pointerAngle(e) {
      var r = svg.getBoundingClientRect(), sc = r.width / W;
      return Math.atan2(e.clientY - (r.top + CY * sc), e.clientX - (r.left + CX * sc)) * 180 / Math.PI;
    }
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.classList.contains("p-lab")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { a: pointerAngle(e), phi: phi, moved: false };
      svg.setPointerCapture(e.pointerId); wrap.classList.add("dragging"); e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var d = ((pointerAngle(e) - drag.a + 540) % 360) - 180;
      if (Math.abs(d) > 2) drag.moved = true;
      phi = drag.phi + d; draw();
    });
    function end() {
      if (!drag) return;
      var moved = drag.moved; drag = null; wrap.classList.remove("dragging");
      rotateTo(moved ? faceAt(phi) : (k + 1) % 5, true);
    }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    wrap.addEventListener("keydown", function (e) {
      var handled = true;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") rotateTo((k + 1) % 5, true);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") rotateTo((k + 4) % 5, true);
      else if (/^[1-5]$/.test(e.key)) rotateTo(Number(e.key) - 1, true);
      else if (e.key === "Home" && opts.initial) rotateTo(ids.indexOf(opts.initial), true);
      else handled = false;
      if (handled) e.preventDefault();
    });

    draw();

    function toPage(x, y) {
      var r = svg.getBoundingClientRect(), sc = r.width / W;
      return { x: r.left + x * sc, y: r.top + y * sc };
    }
    return {
      el: wrap,
      set: function (conceptionId, integ) { integrated = !!integ; var t = ids.indexOf(conceptionId); if (t >= 0 && t !== k) { k = t; phi = phiFor(t); } draw(); },
      rotateTo: function (conceptionId) { rotateTo(ids.indexOf(conceptionId), true); },
      entry: function () { return toPage(CX, CY - APO); },
      exit: function () { return toPage(CX, CY + R); },
      turning: function () { return !!anim || !!drag; },
      integrated: function () { return integrated; },
    };
  };
})();
