/* Utilitaires et accès aux contenus (window.PRISME_DATA : modèle v2, illustrations, sources, copie des rapports). */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  var DATA = window.PRISME_DATA;
  var C = (P.C = DATA.modele);
  P.IL = DATA.illustrations;
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

  /* Les cinq conceptions, dans l'ordre du contenu : ce sont les cinq faces du prisme (nom court sur les faces). */
  P.ids = C.conceptions.map(function (c) { return c.id; });
  P.conceptions = C.conceptions.map(function (c) { return { id: c.id, label: c.nom_court }; });
  P.conception = function (id) { return C.conceptions.filter(function (c) { return c.id === id; })[0]; };
  /* « la conception individualiste », « la conception centrée sur des parties prenantes ciblées » */
  P.sousNom = function (id) { var n = P.conception(id).nom; return "la conception " + n.charAt(0).toLowerCase() + n.slice(1); };

  /* Les quatre volets, communs aux cinq conceptions. Couleurs d'identification : bleu pâle, ambre, vert, lavande.
     Elles ne codent aucune issue. */
  P.volets = C.volets;
  P.colors = {
    qualification: { ray: "#7aa6e0", tint: "#e9f0fa" },
    portee: { ray: "#f0b54a", tint: "#fcf2df" },
    preuve: { ray: "#6cc192", tint: "#e6f4eb" },
    regle: { ray: "#b49be6", tint: "#f0eafb" },
  };
  P.rays = C.volets.map(function (v) { return P.colors[v.id].ray; });

  /* Issues : le libellé est toujours écrit ; un repère de forme (plein, demi, ouvert) double la teinte. */
  var NS = "http://www.w3.org/2000/svg";
  function glyph(id) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 12 12"); svg.setAttribute("class", "ig"); svg.setAttribute("aria-hidden", "true");
    var c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", "6"); c.setAttribute("cy", "6"); c.setAttribute("r", "4.5");
    c.setAttribute("fill", id === "autorisee" ? "currentColor" : "none"); c.setAttribute("stroke", "currentColor"); c.setAttribute("stroke-width", "1.6");
    svg.appendChild(c);
    if (id === "delimitee") {
      var half = document.createElementNS(NS, "path");
      half.setAttribute("d", "M6 1.5 A4.5 4.5 0 0 0 6 10.5 Z"); half.setAttribute("fill", "currentColor");
      svg.appendChild(half);
    }
    return svg;
  }
  P.issue = function (id) { return C.issues.valeurs.filter(function (v) { return v.id === id; })[0]; };
  P.issueRank = function (id) { return C.issues.valeurs.map(function (v) { return v.id; }).indexOf(id); };
  P.issueChip = function (id, extra) {
    var v = P.issue(id);
    if (!v) return null;
    return P.h("span", { class: "issue " + (extra || ""), "data-issue": id },
      glyph(id), v.libelle);
  };

  P.ref = function (id) { return S.references.filter(function (r) { return r.id === id; })[0]; };
  P.refLabel = function (r) {
    var a = r.auteurs.map(function (x) { return x.split(" ").slice(-1)[0]; });
    var who = a.length > 2 ? a[0] + " et al." : a.join(" et ");
    if (r.id === "DCJ2025") who = "de la Cruz Jara et Spanjol";
    return who + " (" + r.annee + ")";
  };
  P.cellule = function (id) { return C.repertoire.cellules.filter(function (c) { return c.id === id; })[0]; };
  P.domaine = function (code) { var d = C.domaines.filter(function (x) { return x.code === code; })[0]; return d ? d.nom : null; };

  /*
   * Phrase de comparaison, d'après data/rapports/schema.json > schema > comparaison_template.
   * Aucun calcul : on nomme les deux issues ; si elles diffèrent, la relation manquante de la lecture
   * la plus éloignée de « autorisée » et ce qui changerait son issue.
   */
  function bas(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function sansPoint(t) { return t.replace(/\s*\.\s*$/, ""); }
  function apresA(t) {
    var m = /^Pour (.+?) : (.+)$/.exec(t);
    if (m) return ", pour " + m[1] + ", à " + bas(sansPoint(m[2]));
    t = bas(sansPoint(t));
    if (/^le /.test(t)) return " au " + t.slice(3);
    if (/^les /.test(t)) return " aux " + t.slice(4);
    return " à " + t;
  }
  P.comparaison = function (idA, la, idB, lb) {
    var lib = function (l) { return P.issue(l.issue).libelle.toLowerCase(); };
    var out = "Sous " + P.sousNom(idA) + ", l’affirmation « " + sansPoint(la.affirmation) + " » est " + lib(la) + ". " +
      "Sous " + P.sousNom(idB) + ", l’affirmation « " + sansPoint(lb.affirmation) + " » est " + lib(lb) + ".";
    if (la.issue === lb.issue) return out + " Les deux garanties exigent ici les mêmes relations.";
    var w = P.issueRank(la.issue) > P.issueRank(lb.issue) ? la : lb;
    if (w.relation_manquante) out += " La différence tient" + apresA(w.relation_manquante) + ".";
    if (w.ce_qui_changerait_l_issue) out += " Ce qui changerait l’issue : " + bas(sansPoint(w.ce_qui_changerait_l_issue)) + ".";
    return out;
  };

  /*
   * Rapports : data/rapports/index.json liste les fichiers ; chacun est lu au chargement.
   * Ouverte comme fichier local (fetch indisponible), la page utilise la copie incluse dans prisme-data.js.
   */
  var cache = null;
  function valide(r) { return r && r.id && r.titre && r.dossier && Array.isArray(r.enonces); }
  P.loadRapports = function () {
    if (cache) return cache;
    var copie = function () { return { index: DATA.rapports.index, list: DATA.rapports.fichiers.filter(valide), origine: "copie" }; };
    if (location.protocol === "file:" || !window.fetch) { cache = Promise.resolve(copie()); return cache; }
    cache = fetch("data/rapports/index.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("index"); return r.json(); })
      .then(function (idx) {
        return Promise.all(idx.fichiers.map(function (f) {
          return fetch("data/rapports/" + f, { cache: "no-cache" })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
        })).then(function (list) {
          list.forEach(function (r, i) { if (!valide(r)) console.warn("PRISME : rapport ignoré, " + idx.fichiers[i]); });
          return { index: idx, list: list.filter(valide), origine: "site" };
        });
      })
      .catch(copie);
    return cache;
  };
})();
