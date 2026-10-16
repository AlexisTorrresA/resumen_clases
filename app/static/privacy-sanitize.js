(function(){
  const replacements=[
    [/los exámenes históricos/gi,'los ejercicios de práctica'],
    [/exámenes históricos/gi,'ejercicios de práctica'],
    [/los exámenes compartidos/gi,'las preguntas de práctica'],
    [/exámenes compartidos/gi,'preguntas de práctica'],
    [/los test compartidos/gi,'las preguntas tipo test'],
    [/test compartidos/gi,'preguntas tipo test'],
    [/modelos de examen/gi,'práctica'],
    [/exámenes? anteriores/gi,'práctica']
  ];
  const clean=v=>{
    if(typeof v==='string') return replacements.reduce((s,[a,b])=>s.replace(a,b),v);
    if(Array.isArray(v)) return v.map(clean);
    if(v&&typeof v==='object'){Object.keys(v).forEach(k=>v[k]=clean(v[k]));return v;}
    return v;
  };
  ['MASTER_DATA','SUBJECT_VA','SUBJECT_TAA','SUBJECT_IGPIA','SUBJECT_RPA'].forEach(k=>{if(window[k])clean(window[k])});
})();
