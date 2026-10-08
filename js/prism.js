/*
 * Composant prisme : un prisme triangulaire en transformations CSS 3D.
 * Trois faces latérales (Contenu, Référence de valeur, Fonction) ; les
 * deux bases ferment le volume et ne portent aucune dimension théorique.
 * La taille du prisme et celle des faces sont constantes.
 */
(function () {
  var P = window.PRISME;
  var h = P.h;
  var STEP = 120; /* degrés entre deux faces */

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  P.supports3D = function () {
    return !!(window.CSS && CSS.supports && CSS.supports("transform-style", "preserve-3d"));
  };

  function faceIndexOf(angle) {
    return (((Math.round(-angle / STEP) % 3) + 3) % 3);
  }
  function angleForFace(k, current) {
    var base = -STEP * k;
    return base + 360 * Math.round((current - base) / 360);
  }

  /*
   * opts : { cfg, jIdx, angle, title, onRotate(angle, faceIdx, phase, source) }
   * Renvoie { el, setAngle(angle, animated), faceIndex(), angle() }.
   */
  P.createPrism = function (opts) {
    var cfg = opts.cfg;
    var angle = opts.angle || 0;
    var dragging = null;

    var prism = h("div", { class: "prism" });
    P.FACE_ORDER.forEach(function (fid, k) {
      var f = P.getFace(cfg, fid, opts.jIdx).value;
      var faceDef = P.idx.faces[fid];
      var unspecified = !f;
      prism.appendChild(
        h(
          "div",
          { class: "face face-" + fid, "data-k": String(k), "aria-hidden": "true" },
          h("span", { class: "face-title", text: faceDef.label }),
          h("span", { class: "face-text" + (unspecified ? " np" : ""), text: unspecified ? P.FUNCTION_UNSPECIFIED : f.short })
        )
      );
    });
    prism.appendChild(h("div", { class: "base base-top", "aria-hidden": "true" }));
    prism.appendChild(h("div", { class: "base base-bottom", "aria-hidden": "true" }));

    var stage = h(
      "div",
      {
        class: "stage",
        tabindex: "0",
        role: "group",
        "aria-roledescription": "prisme",
      },
      prism
    );

    var live = h("span", { class: "sr-only", "aria-live": "polite" });
    var buttons = P.FACE_ORDER.map(function (fid, k) {
      return h("button", {
        type: "button",
        class: "face-btn face-btn-" + fid,
        "data-face": fid,
        text: P.idx.faces[fid].label,
        onclick: function () {
          rotateTo(k, "button");
        },
      });
    });
    var btnRow = h("div", { class: "face-buttons", role: "group", "aria-label": "Amener une face au premier plan" }, buttons);

    var wrap = h(
      "div",
      { class: "prism-wrap" },
      stage,
      btnRow,
      h("p", { class: "kbd-hint", text: "Glissez pour tourner, ou utilisez les flèches. Touches 1, 2, 3 : une face. Début : position initiale." }),
      live
    );

    function apply(animated) {
      prism.style.transition = animated && !reducedMotion() ? "transform 520ms cubic-bezier(.3,.7,.2,1)" : "none";
      prism.style.transform = "rotateX(-12deg) rotateY(" + angle + "deg)";
    }
    function refreshLabels() {
      var k = faceIndexOf(Math.round(angle / STEP) * STEP);
      var fid = P.FACE_ORDER[k];
      var f = P.getFace(cfg, fid, opts.jIdx).value;
      buttons.forEach(function (b, i) {
        b.setAttribute("aria-pressed", i === k ? "true" : "false");
      });
      var label =
        (opts.title || "Prisme") + ". Face " + P.idx.faces[fid].label + " au premier plan : " + (f ? f.short : P.FUNCTION_UNSPECIFIED);
      stage.setAttribute("aria-label", label + ". Flèches gauche et droite pour tourner.");
      return { k: k, text: label };
    }

    function settle(source) {
      angle = Math.round(angle / STEP) * STEP;
      apply(true);
      var st = refreshLabels();
      live.textContent = st.text;
      if (opts.onRotate) opts.onRotate(angle, st.k, "settle", source);
    }
    function rotateTo(k, source) {
      angle = angleForFace(k, angle);
      apply(true);
      var st = refreshLabels();
      live.textContent = st.text;
      if (opts.onRotate) opts.onRotate(angle, st.k, "settle", source);
    }

    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = { x: e.clientX, a: angle, moved: false };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("dragging");
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragging.x;
      if (Math.abs(dx) > 3) dragging.moved = true;
      angle = dragging.a + dx * 0.55;
      apply(false);
      if (opts.onRotate) opts.onRotate(angle, faceIndexOf(angle), "drag", "drag");
    });
    function end() {
      if (!dragging) return;
      var moved = dragging.moved;
      dragging = null;
      stage.classList.remove("dragging");
      if (moved) settle("drag");
    }
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);

    stage.addEventListener("keydown", function (e) {
      var cur = faceIndexOf(Math.round(angle / STEP) * STEP);
      var handled = true;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") rotateTo((cur + 1) % 3, "key");
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") rotateTo((cur + 2) % 3, "key");
      else if (e.key === "1" || e.key === "2" || e.key === "3") rotateTo(Number(e.key) - 1, "key");
      else if (e.key === "Home" || e.key === "Escape") rotateTo(0, "key");
      else handled = false;
      if (handled) e.preventDefault();
    });

    apply(false);
    refreshLabels();

    return {
      el: wrap,
      angle: function () {
        return angle;
      },
      faceIndex: function () {
        return faceIndexOf(Math.round(angle / STEP) * STEP);
      },
      /* Appliquée par la rotation synchronisée ; ne déclenche pas onRotate. */
      setAngle: function (a, animated) {
        angle = a;
        apply(!!animated);
        refreshLabels();
      },
      rotateToFace: function (k, animated) {
        angle = angleForFace(k, angle);
        apply(!!animated);
        refreshLabels();
      },
    };
  };
})();
