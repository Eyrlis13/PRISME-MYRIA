/*
 * Page « Rapports » : affiche des analyses préparées hors du site (un fichier JSON par rapport, data/rapports/).
 * Le site n'analyse rien : il choisit le rapport, deux conceptions, et compose la phrase de comparaison
 * d'après le gabarit du schéma. Aucun score, aucune agrégation entre rapports.
 */
(function () {
  var P = window.PRISME;
  var h = P.h;
  var U = P.comp;

  /* Textes fixes : brief v2, section 4 (e, f). */
  var MENTION = "Les analyses affichées ont été produites hors du site selon le protocole de la section 5.2 du manuscrit et contrôlées par l’autrice. Le site n’analyse pas les rapports.";
  var NOTE_PROFIL = "Ces fréquences décrivent les justifications du rapport, pas la quantité de valeur produite ni la qualité des appuis.";
  var NON_EXAMINEE = "Non examinée sous cette conception";

  function nombre(x) { return String(Math.round(x * 100) / 100).replace(".", ","); }

  /* Par défaut : les deux conceptions pour lesquelles le rapport fournit le plus de lectures (à égalité, ordre d'apparition). */
  P.defaultPair = function (r) {
    var count = {}, first = [];
    r.enonces.forEach(function (e) {
      Object.keys(e.lectures || {}).forEach(function (cid) {
        if (P.ids.indexOf(cid) < 0) return;
        if (!(cid in count)) { count[cid] = 0; first.push(cid); }
        count[cid]++;
      });
    });
    P.ids.forEach(function (cid) { if (first.indexOf(cid) < 0) first.push(cid); });
    var order = first.slice().sort(function (a, b) { return (count[b] || 0) - (count[a] || 0) || first.indexOf(a) - first.indexOf(b); });
    return order.slice(0, 2);
  };

  function pages(e) {
    var p = (e.passages || []).map(function (x) { return x.page; }).filter(Boolean);
    return p.length ? (p.length > 1 ? "pp. " : "p. ") + p.join(", ") : null;
  }

  function cell(e, cid) {
    var l = e.lectures && e.lectures[cid];
    var c = P.conception(cid);
    if (!l) return h("div", { class: "rp-cell none", "data-c": cid }, h("p", { class: "rp-c", text: c.nom_court }), h("p", { class: "rp-none", text: NON_EXAMINEE }));
    return h("div", { class: "rp-cell", "data-c": cid },
      h("p", { class: "rp-c", text: c.nom_court }),
      h("p", { class: "rp-aff", text: l.affirmation }),
      P.lectureIssues(l));
  }

  function enonceRow(r, e, pair, state) {
    var la = e.lectures && e.lectures[pair[0]], lb = e.lectures && e.lectures[pair[1]];
    var pg = pages(e);
    var lvl2 = !la && !lb ? null : h("details", { class: "more lvl" }, h("summary", { text: "Voir les quatre volets" }),
      h("div", { class: "lv-wrap" }, h("table", { class: "lv" },
        h("thead", null, h("tr", null, h("td"), pair.map(function (cid) { return h("th", { scope: "col", text: P.conception(cid).nom }); }))),
        h("tbody", null,
          h("tr", null, h("th", { scope: "row", text: "Référence de valeur" }), pair.map(function (cid) { var l = e.lectures[cid]; return h("td", { text: l ? l.reference_de_valeur : NON_EXAMINEE, class: l ? null : "muted" }); })),
          P.volets.map(function (v) {
            var col = P.colors[v.id];
            return h("tr", { style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
              h("th", { scope: "row" }, h("span", { class: "dot", "aria-hidden": "true" }), v.terme),
              pair.map(function (cid) { var l = e.lectures[cid]; return h("td", { text: l ? l.volets[v.id] : "", class: l ? null : "muted" }); }));
          }),
          h("tr", { class: "lv-change" }, h("th", { scope: "row", text: "Ce qui changerait l’issue" }), pair.map(function (cid) {
            var l = e.lectures[cid];
            return h("td", { text: l ? (l.ce_qui_changerait_l_issue || "") : "" });
          }))))));
    var prem = pair.map(function (cid) { var l = e.lectures[cid]; return l && l.premisse_ajoutee ? [cid, l.premisse_ajoutee] : null; }).filter(Boolean);
    var lvl3 = h("details", { class: "more lvl" }, h("summary", { text: "Voir les passages et les prémisses" }),
      e.passages && e.passages.length ? h("ul", { class: "passages" }, e.passages.map(function (p) {
        return h("li", null, h("blockquote", { text: p.extrait }), p.page ? h("span", { class: "pg", text: "p. " + p.page }) : null);
      })) : null,
      prem.length ? h("div", { class: "prem" }, h("p", { class: "lab", text: "Prémisses ajoutées par l’analyse" }),
        h("ul", { class: "plain" }, prem.map(function (p) { return h("li", null, h("span", { class: "lab inline", text: P.conception(p[0]).nom_court + " · " }), p[1]); }))) : null,
      r.limites ? h("div", { class: "prem" }, h("p", { class: "lab", text: "Limites" }), h("p", { text: r.limites })) : null);
    ["2", "3"].forEach(function (n, i) {
      var d = [lvl2, lvl3][i], key = e.id + ":" + n;
      if (!d) return;
      if (state.open[key]) d.open = true;
      d.addEventListener("toggle", function () { state.open[key] = d.open; });
    });
    return h("article", { class: "rp-row", id: "enonce-" + e.id, "aria-labelledby": "et-" + e.id },
      h("header", { class: "rp-head" },
        h("p", { class: "rp-id", text: e.id }),
        h("div", null,
          h("h3", { class: "rp-t", id: "et-" + e.id }, h("span", { text: e.texte }), pg ? h("span", { class: "pg", text: " (" + pg + ")" }) : null),
          h("p", { class: "rp-avail", text: "Lectures fournies : " + P.ids.filter(function (cid) { return e.lectures && e.lectures[cid]; }).map(function (cid) { return P.conception(cid).nom_court; }).join(", ") }))),
      h("div", { class: "rp-cells" }, cell(e, pair[0]), cell(e, pair[1])),
      la && lb ? h("p", { class: "rp-cmp", text: P.comparaison(pair[0], la, pair[1], lb) }) : null,
      lvl2, lvl3);
  }

  function profil(r) {
    var pf = r.profil;
    if (!pf) return null;
    var total = P.ids.reduce(function (s, cid) { return s + (pf.parts[cid] || 0); }, 0);
    var bar = h("div", { class: "pf-bar", role: "img", "aria-label": "Parts par conception : " + P.ids.map(function (cid) { return P.conception(cid).nom_court + " " + nombre(pf.parts[cid] || 0); }).join(", ") },
      P.ids.map(function (cid, i) {
        var n = pf.parts[cid] || 0;
        return n > 0 ? h("span", { class: "pf-seg s" + i, style: "flex-grow:" + n }, h("span", { class: "pf-n", text: P.conception(cid).nom_court + " " + nombre(n) })) : null;
      }));
    return h("section", { class: "page profil", "aria-labelledby": "pf-t" },
      h("h2", { id: "pf-t", text: "Profil du rapport" }),
      h("ul", { class: "pf-counts" },
        h("li", null, h("strong", { text: nombre(pf.affirmations_examinees) }), " affirmations examinées"),
        h("li", null, h("strong", { text: nombre(pf.rattachees) }), " rattachées"),
        h("li", null, h("strong", { text: nombre(pf.indeterminees) }), " indéterminées")),
      total > 0 ? bar : null,
      h("ul", { class: "pf-legend" }, P.ids.map(function (cid, i) {
        return h("li", null, h("span", { class: "pf-sw s" + i, "aria-hidden": "true" }), P.conception(cid).nom_court + " : " + nombre(pf.parts[cid] || 0));
      })),
      pf.concurrentes && pf.concurrentes.length ? h("div", { class: "pf-conc" }, h("p", { class: "lab", text: "Lectures concurrentes" }),
        h("ul", { class: "plain" }, pf.concurrentes.map(function (c) {
          return h("li", null, h("span", { class: "lab inline", text: c.enonce + " · " + c.lectures.map(function (x) { return P.conception(x).nom_court; }).join(" / ") + " · " }), c.note);
        }))) : null,
      h("p", { class: "pf-fixed", text: NOTE_PROFIL }),
      pf.convention ? h("p", { class: "muted small" }, h("span", { class: "lab inline", text: "Convention · " }), pf.convention) : null,
      pf.note ? h("p", { class: "muted small", text: pf.note }) : null);
  }

  /*
   * state : { id, pair: [id, id], open: {}, dossierOpen }
   * api : { setRapport(id), setPair(side, id) }
   */
  P.renderRapports = function (state, api, rapports) {
    var list = rapports.list;
    var find = function (id) { return list.filter(function (x) { return x.id === id; })[0]; };
    var r = find(state.id) || find(rapports.index.par_defaut) || list[0];
    var scene = h("section", { class: "optic rapports", id: "rapports", "aria-labelledby": "page-title" });
    var inner = h("div", { class: "wrap illus-inner" });
    scene.appendChild(inner);
    inner.appendChild(h("header", { class: "i-head" },
      h("h2", { id: "page-title", text: P.C.accueil.cta_rapports }),
      h("p", { class: "rp-mention", text: MENTION })));
    var page = h("div", null, scene);
    if (!r) { inner.appendChild(h("p", { class: "i-expl", text: "Aucun rapport n’est disponible." })); return page; }
    state.id = r.id;
    if (!state.pair) state.pair = P.defaultPair(r);

    var sel = h("select", { id: "rapport-select", onchange: function (e) { api.setRapport(e.target.value); } },
      list.map(function (x) {
        return h("option", { value: x.id, selected: x.id === r.id ? true : null, text: x.titre + " · " + x.organisation + ", " + x.annee + " · " + x.statut_affichage });
      }));
    inner.appendChild(h("div", { class: "rp-pick" }, h("label", { for: "rapport-select", class: "lab", text: "Rapport" }), sel));

    /* bandeau « Dossier », replié au-delà de quatre lignes */
    var body = h("div", { class: "rp-dos-body" + (state.dossierOpen ? " open" : ""), id: "rp-dos-body" }, P.renderDossier(r, null, "Ce que le rapport établit"),
      h("p", { class: "muted small rp-src" }, h("span", { class: "lab inline", text: "Source · " }), r.source));
    var toggle = h("button", { type: "button", class: "link rp-more", "aria-expanded": state.dossierOpen ? "true" : "false", "aria-controls": "rp-dos-body",
      onclick: function () {
        state.dossierOpen = !state.dossierOpen;
        body.classList.toggle("open", state.dossierOpen);
        toggle.setAttribute("aria-expanded", state.dossierOpen ? "true" : "false");
        toggle.textContent = state.dossierOpen ? "Replier le dossier" : "Afficher tout le dossier";
      } }, state.dossierOpen ? "Replier le dossier" : "Afficher tout le dossier");
    inner.appendChild(h("section", { class: "dossier rp-dos", "aria-labelledby": "rp-dos-t" },
      h("div", { class: "dos-head" }, h("h3", { class: "dos-k", id: "rp-dos-t", text: "Dossier" }), h("span", { class: "tag-built dark", text: r.statut_affichage })),
      body, toggle));

    /* deux conceptions */
    var pair = state.pair;
    inner.appendChild(h("div", { class: "rp-pickers" }, pair.map(function (cid, i) {
      return P.conceptionPicker({ label: i === 0 ? "Première conception" : "Seconde conception", value: cid, other: pair[1 - i],
        onChange: function (id) { api.setPair(i, id); } }).el;
    })));

    var main = h("section", { class: "page rp-list", "aria-label": "Énoncés examinés" },
      r.enonces.map(function (e) { return enonceRow(r, e, pair, state); }));
    page.appendChild(main);
    page.appendChild(profil(r));
    return page;
  };
})();
