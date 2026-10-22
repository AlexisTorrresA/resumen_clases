/* Fichas de Técnicas de Aprendizaje Automático: cada concepto se define una sola vez. */
(function () {
  'use strict';
  const original = openTopic;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const cardsFor = (n) => {
    const d=window.TAA_FICHAS?.[n];
    if(!d)return [];
    const glossary=window.STUDY_GLOSSARY?.taa||[];
    const selected=(d.terms||[]).map(term=>glossary.find(g=>g[0].toLowerCase()===term.toLowerCase())).filter(Boolean)
      .map(g=>[g[0],g[1],g[2],g[3]]);
    const all=[...selected,...(d.extra||[])],seen=new Set();
    return all.filter(card=>{const k=card[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
      if(seen.has(k))return false;seen.add(k);return true;});
  };
  const mapHtml = d => '<div class="taa-flow" role="list" aria-label="Proceso explicado paso a paso">'+
    d.flow.map((step,i)=>'<div class="taa-flow-node" role="listitem"><span>'+(i+1)+'</span><b>'+esc(step)+'</b></div>'+
      (i<d.flow.length-1?'<span class="taa-flow-arrow" aria-hidden="true">→</span>':'')).join('')+'</div>';
  const cardHtml=(c,i)=>'<article class="taa-ficha" id="taa-concept-'+i+'"><div class="taa-ficha-number">'+String(i+1).padStart(2,'0')+'</div>'+
    '<div class="taa-ficha-body"><h3>'+esc(c[0])+'</h3><p class="taa-definition">'+esc(c[1])+'</p>'+
    '<p><b>Cuándo utilizarlo:</b> '+esc(c[2])+'</p>'+
    '<p class="taa-ficha-example"><b>Ejemplo:</b> '+esc(c[3])+'</p></div></article>';
  const codeHtml=n=>{
    const item=window.STUDY_CODE?.['taa:'+n];if(!item)return '';
    return '<section class="studySection taa-section taa-code"><div class="section-kicker">CÓDIGO DE REFERENCIA</div>'+
      '<h2>'+esc(item.title)+'</h2><p>'+esc(item.why)+'</p>'+
      '<div class="codebar"><span>'+esc(item.lang)+'</span><button type="button" data-taa-copy>Copiar</button></div>'+
      '<pre><code>'+esc(item.code)+'</code></pre></section>';
  };
  const demoHtml=n=>{
    let h='';
    if(n===2)h='<p>Introduce una distribución y compara media y mediana.</p><label>Valores separados por comas<input id="taaNumbers" value="900, 1000, 1100, 20000"></label>';
    if(n===3)h='<p>Observa cómo una transformación Min–Max puede salir del intervalo [0,1] con valores nuevos.</p>'+
      '<div class="taa-fields"><label>Mínimo train<input id="taaMin" type="number" value="10"></label><label>Máximo train<input id="taaMax" type="number" value="30"></label><label>Valor nuevo<input id="taaNew" type="number" value="50"></label></div>';
    if(n===4)h='<p>Compara el error absoluto con el error cuadrático.</p>'+
      '<div class="taa-fields"><label>Real 1<input id="taaY1" type="number" value="10"></label><label>Predicción 1<input id="taaP1" type="number" value="12"></label><label>Real 2<input id="taaY2" type="number" value="20"></label><label>Predicción 2<input id="taaP2" type="number" value="16"></label></div>';
    if(n===5)h='<p>Modifica la matriz de confusión y calcula las métricas con valores reales.</p>'+
      '<div class="taa-fields"><label>TP<input id="taaTP" min="0" type="number" value="30"></label><label>FP<input id="taaFP" min="0" type="number" value="10"></label><label>FN<input id="taaFN" min="0" type="number" value="20"></label><label>TN<input id="taaTN" min="0" type="number" value="140"></label></div>';
    if(n===11)h='<p>Una rejilla necesita tantas combinaciones como el producto de alternativas de cada hiperparámetro.</p>'+
      '<div class="taa-fields"><label>Valores de C<input id="taaC" min="1" type="number" value="3"></label><label>Valores gamma<input id="taaGamma" min="1" type="number" value="2"></label><label>Número de folds<input id="taaFolds" min="2" type="number" value="5"></label></div>';
    if(!h)return '';
    return '<section class="studySection taa-section taa-experiment"><div class="section-kicker">EXPERIMENTO INTERACTIVO</div><h2>Compruébalo cambiando los datos</h2>'+
      h+'<button type="button" class="checkbtn" data-taa-calc="'+n+'">Calcular y explicar</button><div class="taa-output" id="taaOutput" role="status" aria-live="polite"></div></section>';
  };
  const navHtml=(n,subject)=>{
    const i=subject.topics.findIndex(t=>t.n===n),before=subject.topics[i-1],after=subject.topics[i+1];
    return '<nav class="topic-pagination" aria-label="Navegar entre temas">'+
      (before?'<button class="topic-nav-btn" onclick="openTopic('+before.n+')"><span>← Tema anterior</span><b>'+esc(before.title)+'</b></button>':'<span></span>')+
      (after?'<button class="topic-nav-btn next" onclick="openTopic('+after.n+')"><span>Siguiente tema →</span><b>'+esc(after.title)+'</b></button>':
       '<button class="topic-nav-btn next" onclick="show(&quot;subjectView&quot;)"><span>Fin del curso</span><b>Volver a asignatura</b></button>')+
      '</nav>';
  };
  openTopic=function(n){
    original(n);
    if(state.subjectId!=='taa')return;
    const d=window.TAA_FICHAS?.[n],t=state.subject?.topics?.find(x=>x.n===n);
    if(!d || !t)return;
    const terms=cardsFor(n);
    const dates=d.dates||[];
    document.getElementById('topicArticle').innerHTML=
      '<div class="articleHero taa-hero"><span class="eyebrow">TÉCNICAS DE APRENDIZAJE AUTOMÁTICO · TEMA '+n+' / '+state.subject.topics.length+'</span>'+
      '<h1>'+esc(t.title.replace(/ esl-ES$/i,''))+'</h1><p>'+esc(d.lead)+'</p>'+
      '<div class="taa-hero-meta"><span>'+terms.length+' conceptos seleccionados</span><span>Ficha para estudiar y practicar</span></div></div>'+
      '<div class="study-layout taa-layout"><main>'+
      '<section class="studySection taa-section"><div class="section-kicker">PANORAMA DEL TEMA</div><h2>Cómo se conectan las ideas</h2>'+
      '<p class="taa-context">Aprende el orden lógico del proceso. Después relaciona cada etapa con los conceptos y ejemplos que aparecen abajo.</p>'+
      mapHtml(d)+'</section>'+
      '<section class="studySection taa-section"><div class="section-kicker">CONCEPTOS ESENCIALES</div><h2>Fichas para comprender y recordar</h2>'+
      '<p class="taa-context">Cada concepto aparece una sola vez: definición, aplicación y ejemplo concreto.</p>'+
      '<div class="taa-fichas">'+terms.map(cardHtml).join('')+'</div></section>'+
      '<section class="studySection taa-section taa-case"><div class="section-kicker">EJEMPLO RESUELTO</div><h2>Aplicación razonada</h2>'+
      '<ol>'+d.case.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>'+
      demoHtml(n)+codeHtml(n)+
      (dates.length?'<section class="studySection taa-section"><div class="section-kicker">FECHAS RELEVANTES</div>'+
        '<h2>Hitos que merece la pena situar</h2><ul class="taa-dates">'+dates.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section>':'')+
      navHtml(n,state.subject)+'</main>'+
      '<aside><section class="studySection taa-section sticky-study"><div class="section-kicker">EVITA ESTAS CONFUSIONES</div><h2>Errores frecuentes</h2>'+
      '<ul>'+d.traps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
      '<p class="taa-context">Repasa las fichas hasta poder explicar los términos sin consultar.</p>'+
      '<button class="checkbtn full" type="button" onclick="markTopic('+n+')">'+
      (state.progress?.['taa:'+n]?'✓ Tema repasado':'Marcar como repasado')+'</button></section></aside></div>';
    show('topicView');
  };
  document.addEventListener('click',event=>{
    const copy=event.target.closest('[data-taa-copy]');
    if(copy){
      const text=copy.closest('.taa-code')?.querySelector('code')?.textContent||'';
      navigator.clipboard?.writeText(text).then(()=>{copy.textContent='Copiado';}).catch(()=>{copy.textContent='Selecciona el código para copiar';});
      return;
    }
    const btn=event.target.closest('[data-taa-calc]');if(!btn)return;
    const n=Number(btn.dataset.taaCalc),o=document.getElementById('taaOutput');if(!o)return;
    const val=id=>Number(document.getElementById(id)?.value);
    const fix=x=>Number.isFinite(x)?x.toFixed(3):'indefinido';
    let result='';
    if(n===2){
      const nums=(document.getElementById('taaNumbers').value||'').split(/[,;\s]+/).filter(Boolean).map(Number).filter(Number.isFinite);
      if(!nums.length)result='Introduce al menos un valor numérico.';
      else{const a=[...nums].sort((x,y)=>x-y),mid=Math.floor(a.length/2),median=a.length%2?a[mid]:(a[mid-1]+a[mid])/2;
        result='Media = '+fix(nums.reduce((s,x)=>s+x,0)/nums.length)+'; mediana = '+fix(median)+'. La media se desplaza más con valores extremos.';}
    }else if(n===3){
      const den=val('taaMax')-val('taaMin');result=den>0?'(x−min)/(max−min) = '+fix((val('taaNew')-val('taaMin'))/den)+'. Se usan mínimo y máximo de train.':'El máximo train debe superar al mínimo.';
    }else if(n===4){
      const a=val('taaY1')-val('taaP1'),b=val('taaY2')-val('taaP2');result='MAE='+fix((Math.abs(a)+Math.abs(b))/2)+' · MSE='+fix((a*a+b*b)/2)+' · RMSE='+fix(Math.sqrt((a*a+b*b)/2))+'. MSE da más peso a desviaciones grandes.';
    }else if(n===5){
      const [tp,fp,fn,tn]=['taaTP','taaFP','taaFN','taaTN'].map(val);
      if([tp,fp,fn,tn].some(v=>v<0 || !Number.isFinite(v)))result='Introduce recuentos válidos, no negativos.';
      else{const div=(a,b)=>b?a/b:NaN,p=div(tp,tp+fp),r=div(tp,tp+fn);
        result='Precision='+fix(p)+' · Recall='+fix(r)+' · F1='+fix(div(2*p*r,p+r))+' · Accuracy='+fix(div(tp+tn,tp+fp+fn+tn))+'. La métrica adecuada depende del coste de FP y FN.';}
    }else if(n===11){
      const a=val('taaC'),b=val('taaGamma'),f=val('taaFolds');
      result=a>0&&b>0&&f>=2?'Grid: '+a*b+' combinaciones. Con '+f+' folds: '+(a*b*f)+' ajustes (sin contar refit final).':'Introduce números positivos y al menos 2 folds.';
    }
    o.textContent=result;
  });
})();
