/* Utilitaires et accès aux contenus (window.PRISME_DATA : contenu, modèle, sources, illustration, rapports). */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  var DATA = window.PRISME_DATA;
  var C = (P.C = DATA.contenu);
  P.M = DATA.modele;
  P.S = DATA.sources;
  P.X = DATA.illustration;
  P.R = DATA.rapports || [];

  /* Création d'éléments DOM. Les textes passent toujours par textContent. */
  P.h = function (tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, v);
      });
    }
    function add(c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) c.forEach(add);
      else if (c.nodeType) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
    for (var i = 2; i < arguments.length; i++) add(arguments[i]);
    return el;
  };

  /* Les cinq conceptions : les cinq faces du prisme. */
  P.conceptions = C.conceptions.map(function (c) { return { id: c.id, label: c.nom }; });
  P.conception = function (id) { return C.conceptions.filter(function (c) { return c.id === id; })[0]; };
  P.domaine = function (id) { return C.domaines.filter(function (d) { return d.id === id; })[0]; };
  P.verdict = function (id) { return C.verdicts.filter(function (v) { return v.id === id; })[0]; };
  P.statut = function (id) { return C.statuts.filter(function (s) { return s.id === id; })[0]; };
  P.nature = function (n) { return C.natures[n] || n; };

  /* Spécification d'un croisement : P.spec("S", "D06"). */
  P.spec = function (cid, did) { return P.M.specifications[cid + did.slice(1)]; };

  /* Les quatre composantes de la spécification de la garantie. Couleurs d'identification
     (bleu pâle, ambre, vert, lavande) : elles ne codent aucun résultat. */
  P.composantes = C.composantes;
  P.colors = {
    raison: { ray: "#7aa6e0", tint: "#e9f0fa" },
    portee: { ray: "#f0b54a", tint: "#fcf2df" },
    preuves: { ray: "#6cc192", tint: "#e6f4eb" },
    regle: { ray: "#b49be6", tint: "#f0eafb" },
  };
  P.rays = C.composantes.map(function (f) { return P.colors[f.id].ray; });

  P.ref = function (id) { return P.S.references.filter(function (r) { return r.id === id; })[0]; };
  P.refLabel = function (r) { return r.court; };
})();
