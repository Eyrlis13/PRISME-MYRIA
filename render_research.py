from pathlib import Path
import json,html,re,itertools,hashlib

P=Path(__file__).resolve().parent
d=json.loads((P/'registre_prisme.json').read_text(encoding='utf-8'))
H=lambda x:html.escape(str(x),quote=True)
names={k:v['name'] for k,v in d['profiles'].items()}
labels={'etabli':'Établi','refute':'Réfuté','indetermine':'Indéterminé','partiel':'Partiel','heterogene':'Hétérogène'}
sources={s['id']:s for s in d['sources']}
def refs(rr):
 return ' ; '.join('<a href="#source-'+H(r.split(':')[0])+'">'+H(r)+'</a>' for r in rr)
def table(head,rows,cls=''):
 return '<table class="'+cls+'"><thead><tr>'+''.join('<th>'+H(x)+'</th>' for x in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+x+'</td>' for x in row)+'</tr>' for row in rows)+'</tbody></table>'

out=(P/'rapport.html').read_text(encoding='utf-8').replace('Étaya\u200bge','Étayage')
out=out.replace('<!-- FORMALISATION_CONCEPTUELLE -->',(P/'formalisation_conceptuelle.html').read_text(encoding='utf-8'))
profile_rows=[]
for k,p in d['profiles'].items():
 profile_rows.append([H(p['name']),H(p['premise'])+'<p class="ref">'+refs(p['sources'])+'</p>',H(p['specification']),H(p['missing'])+'<p class="note">'+H(p['not_implied'])+'</p>'])
out=out.replace('<div id="profiles-slot"></div>',table(['Conception','Prémisse','Spécification utilisée','Conditions ouvertes'],profile_rows))
matrix_rows=[]
for c in d['cases']:
 row=['<a href="#'+c['id']+'">'+c['id']+' · '+H(c['title'])+'</a>']
 for k in names:
  r=c['results'][k]
  row.append('<span class="stat">'+labels[r['status']]+'</span><br>'+H(r['conclusion']))
 matrix_rows.append(row)
out=out.replace('<div class="table-wrap" id="matrix-slot"></div>','<div class="table-wrap">'+table(['Cas']+list(names.values()),matrix_rows,'matrix')+'</div>')
pair_rows=[]
for a in d['pair_audits']:
 pair_rows.append([H(' / '.join(names[k] for k in a['pair'])),H(a['result']),H(a['nature'])+'<p>'+', '.join('<a href="#'+c+'">'+c+'</a>' for c in a['witness'])+'</p>',H(a['control'])])
out=out.replace('<div id="pairs-slot"></div>',table(['Comparaison','Différence examinée','Nature et témoins','Contrôle'],pair_rows))
sens_rows=[]
for s in d['sensitivity']:
 sens_rows.append([H(s['id']+' · '+s['case'])+'<p>'+H(s['change'])+'</p>',H(s['before']),H(s['after']),H(s['lesson'])+'<p class="ref">'+refs(s['sources'])+'</p>'])
out=out.replace('<div id="sensitivity-slot"></div>',table(['Contrôle','Situation initiale','Conséquence','Enseignement'],sens_rows))
cases=[]
for c in d['cases']:
 rows=[]
 for k in names:
  r=c['results'][k]
  rows.append([H(names[k]),'<span class="stat">'+labels[r['status']]+'</span><p>'+H(r['conclusion'])+'</p>',H(r['warrant'])+'<p class="ref">'+refs(r['refs'])+'</p>',H(r['scope'])+'<p>'+H(r['reserve'])+'</p>'])
 cases.append('<section class="case" id="'+c['id']+'"><h3>'+H(c['id']+' · '+c['title'])+'</h3><p>'+H(c['context'])+'</p><p>Objectif commun : '+H(c['objective'])+'</p><p>Faits et hypothèses du dossier construit :</p><ul>'+''.join('<li>'+H(f)+'</li>' for f in c['facts'])+'</ul><p>Épreuve : '+H(c['test'])+'</p>'+('<p class="note">'+H(c['limits'])+'</p>' if c['limits'] else '')+table(['Conception','Conclusion','Justification et appuis','Portée et réserve'],rows)+'<p class="note">Dossier commun '+c['dossier_hash'][:16]+' · '+H(c['kind'])+'</p></section>')
out=out.replace('<div id="cases-slot"></div>',''.join(cases))
ss=[]
for s in d['sources']:
 ss.append('<section class="source" id="source-'+s['id']+'"><h3>'+H(s['id']+' · '+s['authors']+' ('+str(s['year'])+')')+'</h3><p><a href="'+H(s['url'])+'">'+H(s['title'])+'</a></p><p>Passages : '+H(s['passages'])+'</p><p>Lecture : '+H(s['read'])+'</p><p>Fonction : '+H(s['role'])+'</p><p>Limite : '+H(s['limit'])+'</p></section>')
out=out.replace('<div id="sources-slot"></div>',''.join(ss))
(P/'RAPPORT_PRISME_2026-10-15.html').write_text(out,encoding='utf-8')

checks=[]
assert len(d['cases'])==15 and len(names)==5
assert len({c['id'] for c in d['cases']})==15
for c in d['cases']:
 assert set(c['results'])==set(names)
 expected=hashlib.sha256(json.dumps([c['objective'],c['facts']],ensure_ascii=False,sort_keys=True).encode()).hexdigest()
 assert expected==c['dossier_hash']
 for k,r in c['results'].items():
  assert r['status'] in labels
  assert all(r[x] for x in ['conclusion','warrant','refs','reserve','scope','change'])
  assert all(ref.split(':')[0] in sources for ref in r['refs'])
  checks.append(c['id']+'-'+k)
assert {tuple(sorted(x['pair'])) for x in d['pair_audits']}=={tuple(sorted(p)) for p in itertools.combinations(names,2)}
assert all(x['status']=='etabli' for x in d['cases'][0]['results'].values())
assert all(x['status']=='indetermine' for x in next(c for c in d['cases'] if c['id']=='C10')['results'].values())
assert next(c for c in d['cases'] if c['id']=='C06')['results']['V']['status']=='indetermine'
assert next(c for c in d['cases'] if c['id']=='C07')['results']['V']['status']=='refute'
for id in ['C06','C07']:
 assert next(c for c in d['cases'] if c['id']==id)['facts'][:3]==d['cases'][0]['facts'][:3]
result=dict(cases=15,lectures=len(checks),paires_completes=10,controles_sensibilite=6,empreintes_verifiees=True,references_resolues=True,temoins_convergence=True,portee='Contrôle structurel du registre ; ne remplace pas l’examen scientifique des inférences.')
(P/'CONTROLES_REGISTRE.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
