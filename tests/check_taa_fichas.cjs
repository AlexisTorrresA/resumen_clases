const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const files=['taa-fichas-data.js','glossary-taa.js'];
const context={window:{}};vm.createContext(context);
for(const file of files){
  vm.runInContext(fs.readFileSync('app/static/'+file,'utf8'),context,{filename:file});
}
const data=context.window.TAA_FICHAS;
const glossary=context.window.STUDY_GLOSSARY.taa;
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
assert.equal(Object.keys(data).length,11,'Deben existir 11 temas');
let count=0;
for(let n=1;n<=11;n++){
  const t=data[n];
  assert(t, 'Falta tema '+n);
  assert(t.lead && t.flow.length>=4, 'Faltan explicación y mapa del tema '+n);
  assert(t.case.length>=2 && t.traps.length>=1,'Faltan casos prácticos');
  const lookup=(t.terms||[]).map(term=>glossary.find(row=>normalize(row[0])===normalize(term)));
  assert(lookup.every(Boolean),'Glosario incompleto en tema '+n);
  const cards=[...lookup,...t.extra],seen=new Set();
  for(const card of cards){
    assert.equal(card.length,4,'Ficha incompleta en tema '+n);
    assert(card.every(x=>typeof x==='string'&&x.trim().length>0));
    const label=normalize(card[0]);
    assert(!seen.has(label),'Concepto duplicado en tema '+n+': '+label);
    seen.add(label);
    count++;
  }
}
assert(count>=85,'Se perdieron conceptos fundamentales: '+count);
const html=fs.readFileSync('app/static/index.html','utf8');
for(const file of ['taa-fichas-data.js','taa-fichas-view.js','taa-fichas.css']){
 assert(html.includes(file),'Archivo no cargado: '+file);
}
assert(html.indexOf('taa-fichas-view.js')<html.indexOf('study-workspace.js'),'La navegación de estudio debe envolver las fichas');
console.log('TAA: '+Object.keys(data).length+' temas, '+count+' fichas, sin duplicados dentro de cada tema.');
