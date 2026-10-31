/* Utilitaires et accès aux contenus (window.PRISME_DATA : contenu, modèle de référence, sources). */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  var DATA = window.PRISME_DATA;
  var C = (P.C = DATA.contenu);
  P.M = DATA.modele;
  var S = (P.S = DATA.sources);

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

  /* Les cinq conceptions, dans l'ordre du contenu : ce sont les cinq faces du prisme. */
  P.conceptions = C.conceptions.map(function (c) { return { id: c.id, label: c.nom }; });
  P.conception = function (id) { return C.conceptions.filter(function (c) { return c.id === id; })[0]; };

  /* Les quatre fonctions (rubriques), communes aux cinq conceptions. Couleurs d'identification
     reprises de la version précédente : bleu pâle, ambre, vert, lavande. Elles ne codent aucun résultat. */
  P.fonctions = C.fonctions;
  P.colors = {
    qualification: { ray: "#7aa6e0", tint: "#e9f0fa" },
    portee: { ray: "#f0b54a", tint: "#fcf2df" },
    preuve: { ray: "#6cc192", tint: "#e6f4eb" },
    regle: { ray: "#b49be6", tint: "#f0eafb" },
  };
  P.rays = C.fonctions.map(function (f) { return P.colors[f.id].ray; });

  P.ref = function (id) { return S.references.filter(function (r) { return r.id === id; })[0]; };
  P.refLabel = function (r) {
    var a = r.auteurs.map(function (x) { return x.split(" ").slice(-1)[0]; });
    var who = a.length > 2 ? a[0] + " et al." : a.join(" et ");
    if (r.id === "DCJ2025") who = "de la Cruz Jara et Spanjol";
    return who + " (" + r.annee + ")";
  };
})();
