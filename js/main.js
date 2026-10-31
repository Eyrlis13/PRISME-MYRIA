/* Orchestration : état, routage, rendu des trois pages, redessin des faisceaux. */
(function () {
  var P = window.PRISME;
  var C = P.C;
  var h = P.h;
  var U = P.comp;

  var NOTICE = "Ce lien renvoie à une version antérieure de PRISME. Le site a été mis à jour le 31 octobre 2026 sur le modèle de l'article.";
  var TABS = [["modele", "#/", "Modèle conceptuel"], ["illustration", "#/illustration", "Illustration"], ["rapports", "#/rapports", "Rapports"]];

  var state = {
    tab: "modele", notice: null,
    model: { conception: C.accueil.conception_initiale, domaine: C.accueil.domaine_initial },
    illus: { version: "A", left: P.X.couple_initial[0], right: P.X.couple_initial[1] },
    rap: { rapport: null, rev: null, left: "S", right: "I" },
  };
  var app = document.getElementById("app");
  var current = null;

  function route() {
    var hash = location.hash || "";
    var prev = state.tab;
    var tab = /^#\/illustrations?(?=$|[/?])/.test(hash) ? "illustration" : /^#\/rapports(?=$|[/?])/.test(hash) ? "rapports" : "modele";
    var m = hash.match(/^#\/rapports\/([^/]+)(?:\/([^/]+))?/);
    if (m) { state.rap.rapport = decodeURIComponent(m[1]); state.rap.rev = m[2] ? decodeURIComponent(m[2]) : null; }
    var known = /^(#?|#\/|#\/illustration|#\/rapports(\/.*)?)$/.test(hash) || hash === "#/illustrations";
    state.notice = known ? null : NOTICE;
    if (!known && history.replaceState) history.replaceState(null, "", "#/");
    state.tab = tab;
    render();
    if (prev !== state.tab) window.scrollTo(0, 0);
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.textContent = "";
    TABS.forEach(function (t) {
      nav.appendChild(h("a", { href: t[1], class: "tab" + (state.tab === t[0] ? " on" : ""), "aria-current": state.tab === t[0] ? "page" : null, text: t[2] }));
    });
    nav.appendChild(h("button", { type: "button", class: "tab src", id: "nav-sources", onclick: U.openSources, text: "Sources" }));
  }

  var modelApi = { setConception: function (id) { state.model.conception = id; }, setDomaine: function (id) { state.model.domaine = id; } };
  var illusApi = { setVersion: function (id) { state.illus.version = id; render(); } };
  var rapApi = { set: function (patch) { Object.keys(patch).forEach(function (k) { state.rap[k] = patch[k]; }); render(); } };

  function render() {
    renderNav();
    U.closeDrawer(true);
    app.textContent = "";
    if (state.notice) app.appendChild(h("p", { class: "notice wrap", role: "status", text: state.notice }));
    var scene;
    if (state.tab === "illustration") { scene = P.renderIllustration(state.illus, illusApi); app.appendChild(scene); current = { kind: "lines", el: scene }; }
    else if (state.tab === "rapports") { scene = P.renderRapports(state.rap, rapApi); app.appendChild(scene); current = { kind: "lines", el: scene }; }
    else { scene = P.renderModel(state.model, modelApi); app.appendChild(scene); app.appendChild(P.renderUsages()); current = { kind: "model", el: scene }; }
    requestAnimationFrame(redraw);
  }

  function redraw() {
    if (!current) return;
    if (current.kind === "model") P.drawModelRays(current.el);
    else P.drawDossierLines(current.el);
  }
  P.redraw = redraw;
  window.addEventListener("resize", function () { requestAnimationFrame(redraw); });
  document.addEventListener("toggle", function () { requestAnimationFrame(redraw); }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(redraw); });

  document.getElementById("foot-sources").addEventListener("click", U.openSources);
  window.addEventListener("hashchange", route);
  route();
})();
