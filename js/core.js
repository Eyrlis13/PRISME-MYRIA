/* Utilitaires, index des données et accès aux faces. Aucun contenu scientifique ici. */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  var D = P.data;

  function by(arr) {
    var m = {};
    arr.forEach(function (x) {
      m[x.id] = x;
    });
    return m;
  }

  P.idx = {
    domains: by(D.domains),
    conceptions: by(D.conceptions),
    contexts: by(D.contexts),
    configurations: by(D.configurations),
    justifications: by(D.justifications),
    comparisons: by(D.comparisons),
    references: by(D.references),
    faces: by(D.faces),
  };

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

  P.justificationsOf = function (cfg) {
    return cfg.justificationIds.map(function (id) {
      return P.idx.justifications[id];
    });
  };

  /* Renvoie {value, justification} pour une face. `value` vaut null lorsque
     la face n'est pas renseignée (par exemple une fonction non spécifiée). */
  P.getFace = function (cfg, faceId, jIdx) {
    var js = P.justificationsOf(cfg);
    var j = js[Math.min(jIdx || 0, js.length - 1)] || null;
    if (faceId === "content") return { value: cfg.content, justification: j };
    if (faceId === "reference") return { value: j ? j.valueReference : null, justification: j };
    return { value: j ? j.function : null, justification: j };
  };

  P.configFor = function (cmp, conceptionId) {
    for (var i = 0; i < cmp.configIds.length; i++) {
      var c = P.idx.configurations[cmp.configIds[i]];
      if (c.conceptionId === conceptionId) return c;
    }
    return null;
  };

  P.comparisonsOfDomain = function (domainId) {
    return D.comparisons.filter(function (c) {
      return c.domainId === domainId;
    });
  };

  P.NOT_INTEGRATED = "Configuration non intégrée à cette version.";
  P.NOT_INTEGRATED_NOTE =
    "Cette indication concerne la couverture de l'application. Elle ne signifie pas que le critère serait sans pertinence sous cette conception.";
  P.NOT_PROVIDED = "Non renseigné dans cet exemple";
  P.FUNCTION_UNSPECIFIED = "Fonction non spécifiée dans cet exemple";

  P.FACE_ORDER = ["content", "reference", "function"];
})();
