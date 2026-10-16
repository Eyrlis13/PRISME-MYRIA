/* Orchestration : état, routage, rendu des deux pages, redessin des faisceaux. */
(function () {
  var P = window.PRISME;
  var D = P.D;
  var h = P.h;
  var U = P.comp;

  var state = {
    tab: "modele",
    model: { conception: null },
    illus: {
      caseId: D.interface.default_case,
      slots: D.interface.default_pair.slice(),
      show: 0,
      textOnly: false,
      flash: null,
    },
  };
  var app = document.getElementById("app");
  var current = null; /* { kind, el } */

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

  function refocusDial(selector) {
    var d = document.querySelector(selector);
    if (d) d.focus({ preventScroll: true });
  }

  var modelApi = {
    setConception: function (id) {
      var hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest(".dial");
      state.model.conception = id;
      render();
      if (hadFocus) refocusDial("#model .dial");
      else if (!id) { var g = document.querySelector("#model .dial"); if (g) g.focus({ preventScroll: true }); }
    },
    goIllustrations: function (id) {
      if (id) {
        var other = id === "G" ? "M" : "G";
        state.illus.slots = [id, other];
      } else state.illus.slots = D.interface.default_pair.slice();
      state.illus.caseId = D.interface.default_case;
      state.illus.show = 0;
      location.hash = "#/illustrations";
    },
  };

  var illusApi = {
    setCase: function (id) {
      state.illus.caseId = id;
      state.illus.flash = null;
      render();
      var t = document.getElementById("case-title");
      if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
    },
    setSlot: function (i, pid) {
      var hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest(".dial");
      state.illus.slots[i] = pid;
      state.illus.flash = i;
      render();
      if (hadFocus) refocusDial('.r-col[data-slot="' + i + '"] .dial');
      setTimeout(function () { state.illus.flash = null; var c = document.querySelector(".r-col.flash"); if (c) c.classList.remove("flash"); }, 1200);
    },
    setShow: function (i) { state.illus.show = i; render(); },
    setTextOnly: function (b) { state.illus.textOnly = b; render(); },
    initialFor: function (i) { return D.interface.default_pair[i]; },
  };

  function render() {
    renderNav();
    U.closeDrawer(true);
    app.textContent = "";
    if (state.tab === "illustrations") {
      var root = P.renderIllustrations(state.illus, illusApi);
      app.appendChild(root);
      current = { kind: "illus", el: root };
    } else {
      var scene = P.renderModel(state.model, modelApi);
      app.appendChild(scene);
      current = { kind: "model", el: scene };
    }
    requestAnimationFrame(redraw);
  }

  function redraw() {
    if (!current) return;
    if (current.kind === "model") P.drawModelRays(current.el);
    else P.drawIllusRays(current.el);
  }
  P.redraw = redraw;
  window.addEventListener("resize", function () { requestAnimationFrame(redraw); });
  document.addEventListener("toggle", function () { requestAnimationFrame(redraw); }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(redraw); });

  window.addEventListener("hashchange", route);
  route();
})();
