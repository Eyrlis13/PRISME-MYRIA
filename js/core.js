/* Utilitaires et accès aux données scientifiques (window.PRISME_DATA). */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  var D = (P.D = window.PRISME_DATA);

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

  /* Conceptions, dans l'ordre du fichier (M, I, G, V, N). */
  P.conceptionIds = Object.keys(D.profiles);
  P.conceptions = P.conceptionIds.map(function (id) { return { id: id, label: D.profiles[id].name }; });
  P.profile = function (id) { return D.profiles[id]; };

  /* Dimensions, dans l'ordre recommandé par l'interface. */
  P.dims = D.interface.dimension_order.map(function (id) {
    return D.model.dimensions.filter(function (d) { return d.id === id; })[0];
  });
  P.dimRays = P.dims.map(function (d) { return P.ui.dimColors[d.id].ray; });

  P.caseById = function (id) { return D.cases.filter(function (c) { return c.id === id; })[0]; };
  P.block = function (id) { return D.model.blocks.filter(function (b) { return b.id === id; })[0]; };
  P.link = function (from, to) { return D.model.links.filter(function (l) { return l.from_id === from && l.to_id === to; })[0]; };
  P.source = function (id) { return D.sources.filter(function (s) { return s.id === id; })[0]; };

  /* « DCJ:421–422 » → { source, pages } */
  P.parseRef = function (ref) {
    var i = ref.indexOf(":");
    var id = i < 0 ? ref : ref.slice(0, i);
    return { source: P.source(id), id: id, pages: i < 0 ? "" : ref.slice(i + 1) };
  };

  /* Analyse transversale documentée pour une paire (ordre indifférent), ou null. */
  P.auditFor = function (a, b) {
    return D.pair_audits.filter(function (x) { return (x.pair[0] === a && x.pair[1] === b) || (x.pair[0] === b && x.pair[1] === a); })[0] || null;
  };
  P.sensitivityFor = function (caseId) { return D.sensitivity.filter(function (s) { return s.case === caseId; }); };
  P.sourceLabel = function (s) { return s.authors + " (" + s.year + ")"; };
})();
