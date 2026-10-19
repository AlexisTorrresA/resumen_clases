(function () {
  'use strict';
  if (typeof COURSES === 'undefined' || typeof profile === 'undefined') return;

  const key = 'masterIAStudy:v1:' + profile;
  const $s = (sel) => document.querySelector(sel);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };
  const datePlus = (days) => {
    const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+days);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };
  const empty = () => ({version:1,updatedAt:0,visited:null,notes:{},bookmarks:{},reviews:{},mistakes:{},completed:{}});
  const sanitize = (s) => {
    const out=empty();
    if (!s || typeof s !== 'object' || Array.isArray(s)) return out;
    out.updatedAt = Number(s.updatedAt) || 0;
    out.visited = s.visited && typeof s.visited.sid==='string' && Number.isInteger(Number(s.visited.n))
      ? {sid:s.visited.sid,n:Number(s.visited.n)} : null;
    for (const field of ['notes','bookmarks','reviews','mistakes','completed']) {
      const value=s[field];
      if(value && typeof value==='object' && !Array.isArray(value)) out[field]=value;
    }
    return out;
  };
  let saved;
  try { saved = sanitize(JSON.parse(localStorage.getItem(key)||'{}')); } catch (_) { saved=empty(); }
  Object.entries(saved.completed).forEach(([k,v])=>{state.progress[k]=!!v;});
  let pending=null;
  function store() {
    saved.updatedAt=Date.now();
    try { localStorage.setItem(key,JSON.stringify(saved)); } catch (_) {}
    clearTimeout(pending);
    pending=setTimeout(() => {
      fetch('/api/study-state', {method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({profile_id:profile,data:saved})}).catch(()=>{});
    },1100);
  }
  async function loadRemote() {
    try {
      const res=await fetch('/api/study-state/'+encodeURIComponent(profile));
      if (!res.ok) return;
      const body=await res.json();
      if (body.data && Number(body.data.updatedAt)>saved.updatedAt) {
        saved=sanitize(body.data);
        Object.entries(saved.completed).forEach(([k,v])=>{state.progress[k]=!!v;});
        try{localStorage.setItem(key,JSON.stringify(saved));}catch(_){}
        refreshDashboard();
        if ($s('#subjectView.active')) enhanceSubject();
      }
    } catch (_) {}
  }
  function findCourse(sid) { return COURSES.find(c=>c.id===sid); }
  function findTopic(sid,n) {
    const c=findCourse(sid);
    return c && c.topics.find(t=>t.n===Number(n));
  }
  function reviewKey(sid,n) { return sid+':'+n; }
  function due() {
    return Object.entries(saved.reviews)
      .filter(([k,r])=>r && typeof r.due==='string' && r.due<=today() && k.indexOf(':')>0)
      .map(([k,r])=>{const i=k.lastIndexOf(':');return {sid:k.slice(0,i),n:Number(k.slice(i+1)),review:r};})
      .filter(x=>findTopic(x.sid,x.n))
      .sort((a,b)=>a.review.due.localeCompare(b.review.due));
  }
  function nextTopic(sid) {
    const c=findCourse(sid);
    return c?.topics.find(t=>!state.progress[reviewKey(sid,t.n)]) || c?.topics[0] || null;
  }
  function allCompleted() {
    return COURSES.reduce((total,c)=>total+c.topics.filter(t=>state.progress[reviewKey(c.id,t.n)]).length,0);
  }
  const totalTopics=COURSES.reduce((n,c)=>n+c.topics.length,0);
  function labelFor(sid) { return findCourse(sid)?.short || sid.toUpperCase(); }
  function goTopic(sid,n) {
    if(!findTopic(sid,n)) return;
    if(state.subjectId!==sid) openSubject(sid);
    openTopic(Number(n));
    const close=$s('#sidebar .sidebar-close');
    if($s('#sidebar.open')) close?.click();
  }
  function refreshDashboard() {
    const host=$s('#studyDesk');
    if(!host) return;
    const reviewed=Object.keys(saved.reviews).length;
    const completed=allCompleted(), percent=Math.round(completed/Math.max(1,totalTopics)*100);
    const pending=due().length;
    let last=saved.visited;
    if(!last || !findTopic(last.sid,last.n)) last={sid:COURSES[0].id,n:COURSES[0].topics[0].n};
    const t=findTopic(last.sid,last.n);
    host.innerHTML =
      '<div class="study-desk-head"><div><span class="study-kicker">TU ESPACIO DE ESTUDIO</span>'+
      '<h2>Continúa donde lo dejaste</h2>'+
      '<p><b>'+escape(labelFor(last.sid))+' · Tema '+last.n+'</b> — '+escape(t.title)+'</p></div>'+
      '<span class="study-flag">'+today()+'</span></div>'+
      '<div class="study-actions"><button class="study-action primary-action" id="studyContinue">Continuar estudiando →</button>'+
      '<button class="study-action" id="studyPending">Repasar ahora'+(pending?' · '+pending:'')+'</button></div>'+
      '<div class="study-stats" aria-label="Estadísticas de estudio">'+
      '<div class="study-stat"><b>'+completed+'/'+totalTopics+'</b><span>Temas vistos</span></div>'+
      '<div class="study-stat"><b>'+reviewed+'</b><span>En repaso</span></div>'+
      '<div class="study-stat"><b>'+pending+'</b><span>Repasos para hoy</span></div></div>'+
      '<div class="study-progressline" role="progressbar" aria-label="Temas marcados como repasados" aria-valuenow="'+percent+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+percent+'%"></span></div>'+
      '<small class="study-subhead">'+percent+' % del material marcado como repasado (no equivale a dominarlo).</small>'+
      '<div class="study-actions"><input id="studyQuickSearch" type="search" aria-label="Buscar temas" placeholder="Buscar un concepto o tema…" class="search" style="margin:6px 0 0;flex:1 1 220px">'+
      '<button id="studyExport" class="study-action" type="button">Guardar copia</button>'+
      '<button id="studyImport" class="study-action" type="button">Restaurar copia</button></div>';
    $s('#studyContinue').onclick=()=>goTopic(last.sid,last.n);
    $s('#studyPending').onclick=showReview;
    $s('#studyExport').onclick=exportStudy;
    $s('#studyImport').onclick=()=>fileInput.click();
    $s('#studyQuickSearch').addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      const search=$s('#globalSearch');
      if(search){search.value=e.target.value;search.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));}
    });
    const entry=$s('#studyReviewEntry span');
    if(entry)entry.textContent=pending;
  }
  function ensureDashboard() {
    const home=$s('#homeView');
    if(!home)return;
    if(!$s('#studyDesk')) {
      const el=document.createElement('section');
      el.id='studyDesk';el.className='study-desk';el.setAttribute('aria-label','Panel de estudio');
      home.insertBefore(el,home.firstChild);
    }
    refreshDashboard();
  }

  function enhanceSubject() {
    const subject=state.subject;if(!subject)return;
    const hero=$s('#subjectView .subjectHero'),tabs=$s('#subjectView .tabs');
    if(!hero||!tabs)return;
    let panel=$s('#subjectStudyToolbar');
    if(!panel){panel=document.createElement('div');panel.id='subjectStudyToolbar';panel.className='subject-study-toolbar';hero.parentNode.insertBefore(panel,tabs);}
    const done=subject.topics.filter(t=>state.progress[reviewKey(subject.id,t.n)]).length;
    const pending=due().filter(x=>x.sid===subject.id).length;
    panel.innerHTML='<div><strong>'+done+' de '+subject.topics.length+' temas marcados como vistos</strong>'+
      '<small>'+pending+' repaso(s) pendiente(s). Recuerda intentar responder antes de consultar las soluciones.</small></div>'+
      '<div class="study-actions" style="margin:0"><button class="study-action" id="subjectReviewNow">Repasar</button>'+
      '<button class="study-action primary-action" id="subjectNextTopic">Seguir temario →</button></div>';
    $s('#subjectReviewNow').onclick=showReview;
    $s('#subjectNextTopic').onclick=()=>{const t=nextTopic(subject.id);if(t)goTopic(subject.id,t.n);};
    document.querySelectorAll('#topicList .topic-card').forEach((card,i)=>{
      card.querySelector('.study-flag')?.remove();
      const t=subject.topics[i],r=saved.reviews[reviewKey(subject.id,t.n)];
      const node=card.children[1];
      if(!node)return;
      const tag=document.createElement('span');
      tag.className='study-flag'+(r?.due && r.due<=today()?' due':'');
      tag.textContent=r?(r.due<=today()?'Pendiente de repaso':'Próximo repaso: '+r.due):'Sin repaso activo';
      node.appendChild(tag);
    });
  }

  function saveNote(sid,n,value) {
    saved.notes[reviewKey(sid,n)] = String(value).slice(0,12000);
    store();
    const status=$s('#studyNoteStatus');if(status)status.textContent='Guardado en este dispositivo';
  }
  function rate(sid,n,grade) {
    const k=reviewKey(sid,n);
    const prev=saved.reviews[k]||{repetitions:0,interval:0};
    const attempts=(Number(prev.repetitions)||0)+1;
    let interval=1;
    if(grade===1) interval=Math.max(3,Math.round((Number(prev.interval)||0)*1.3));
    if(grade===2) interval=Math.max(7,Math.min(60,(Number(prev.interval)||0)*2 || 7));
    saved.reviews[k]={repetitions:attempts,interval:interval,due:datePlus(interval),lastReviewed:today(),grade:grade};
    state.progress[k]=true;
    saved.completed[k]=true;
    store();
    fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({profile_id:profile,subject_id:sid,topic_number:n,done:true})}).catch(()=>{});
    const msg=$s('#studyRated');
    if(msg) msg.textContent='Repaso registrado. Próxima revisión: '+datePlus(interval)+'.';
    const flag=$s('#studyDueStatus');
    if(flag)flag.textContent='Próximo repaso: '+datePlus(interval);
    refreshDashboard();
  }
  function topicPanel(sid,t) {
    const article=$s('#topicArticle');if(!article)return;
    article.querySelector('.study-topic-tools')?.remove();
    article.querySelector('.study-recall')?.remove();
    article.querySelector('.study-notes-panel')?.remove();
    const topicKey=reviewKey(sid,t.n);
    const r=saved.reviews[topicKey];
    const tools=document.createElement('div');
    tools.className='study-topic-tools';
    tools.innerHTML='<div><span class="study-kicker">ESTUDIO GUIADO</span><p id="studyDueStatus">'+
      escape(r?'Próximo repaso: '+r.due:'Todavía sin fecha de repaso')+'</p></div>'+
      '<div class="study-tool-buttons"><button class="study-action" id="topicFavorite" aria-pressed="'+(!!saved.bookmarks[topicKey])+'">'+
      (saved.bookmarks[topicKey]?'★ Guardado':'☆ Guardar tema')+'</button>'+
      '<button class="study-action" id="topicFocus">'+(document.body.classList.contains('study-quiet')?'Salir de enfoque':'Modo enfoque')+'</button></div>';
    const layout=article.querySelector('.study-layout');
    if(!layout)return;
    article.insertBefore(tools,layout);
    $s('#topicFavorite').onclick=()=>{
      saved.bookmarks[topicKey]=!saved.bookmarks[topicKey];
      if(!saved.bookmarks[topicKey])delete saved.bookmarks[topicKey];
      store();
      const button=$s('#topicFavorite');
      button.textContent=saved.bookmarks[topicKey]?'★ Guardado':'☆ Guardar tema';
      button.setAttribute('aria-pressed',String(!!saved.bookmarks[topicKey]));
    };
    $s('#topicFocus').onclick=()=>{
      document.body.classList.toggle('study-quiet');
      $s('#topicFocus').textContent=document.body.classList.contains('study-quiet')?'Salir de enfoque':'Modo enfoque';
    };
    const content=layout.querySelector('main');if(!content)return;
    const answer=(t.mustKnow||[]).slice(0,3).join(' ') || t.summary || '';
    const recall=document.createElement('section');
    recall.className='studySection study-recall';
    recall.setAttribute('aria-label','Práctica de recuperación activa');
    recall.innerHTML='<span class="study-kicker">PRIMERO RECORDAR, DESPUÉS RELEER</span>'+
      '<h2>¿Puedes explicar este tema sin mirar?</h2>'+
      '<p>Piensa en <strong>'+escape(t.title)+'</strong>. ¿Qué significa, cómo funciona y cuándo se utiliza? Escribe tu explicación sin consultar el resumen.</p>'+
      '<textarea id="studyRecallInput" placeholder="Escribe con tus palabras lo que recuerdas antes de mirar la explicación…" aria-label="Tu explicación de memoria"></textarea>'+
      '<details id="studyRecallAnswer"><summary>Mostrar respuesta orientativa</summary><p class="recall-answer">'+escape(answer)+'</p></details>'+
      '<div class="review-grades"><button data-grade="0">No lo recuerdo</button><button data-grade="1">Tengo dudas</button><button data-grade="2">Lo recuerdo bien</button></div>'+
      '<p id="studyRated" class="study-save-status" role="status"></p>'+
      '<button id="recallToNote" class="study-action" type="button">Añadir mi respuesta a las notas</button>';
    content.insertBefore(recall,content.firstChild);
    recall.querySelectorAll('[data-grade]').forEach(b=>{
      b.onclick=()=>{
        if(!$s('#studyRecallAnswer').open) $s('#studyRecallAnswer').open=true;
        rate(sid,t.n,Number(b.dataset.grade));
      };
    });
    const nav=content.querySelector('.topic-pagination');
    const notes=document.createElement('section');
    notes.className='study-notes-panel';
    notes.innerHTML='<h2>Mis apuntes de este tema</h2>'+
      '<p>Registra dudas, ejemplos propios, fórmulas o lo que quieras volver a estudiar. Se guardan automáticamente.</p>'+
      '<textarea id="studyTopicNotes" class="study-notearea" maxlength="12000" placeholder="Ejemplo propio, duda o explicación…"></textarea>'+
      '<small id="studyNoteStatus" class="study-save-status" role="status">Guardado en este dispositivo</small>';
    content.insertBefore(notes,nav||null);
    const input=$s('#studyTopicNotes'); input.value=String(saved.notes[topicKey]||'');
    input.addEventListener('input',()=>saveNote(sid,t.n,input.value));
    $s('#recallToNote').onclick=()=>{
      const attempt=$s('#studyRecallInput').value.trim();if(!attempt)return;
      input.value=(input.value.trim()?input.value.trim()+'\n\n':'')+'Mi explicación: '+attempt;
      input.value=input.value.slice(0,12000);saveNote(sid,t.n,input.value);
      $s('#studyNoteStatus').textContent='Explicación añadida a tus notas';
    };
  }

  function showReview() {
    const main=$s('.main');if(!main)return;
    let view=$s('#reviewView');
    if(!view){view=document.createElement('section');view.id='reviewView';view.className='view';main.appendChild(view);}
    const list=due();
    const favorites=Object.keys(saved.bookmarks).filter(k=>saved.bookmarks[k]&&findTopic(k.split(':')[0],Number(k.split(':')[1])));
    const misses=Object.entries(saved.mistakes).slice(-8).reverse();
    view.innerHTML='<button class="back" id="reviewBackHome">← Inicio</button>'+
      '<div class="study-desk"><span class="study-kicker">PLAN DE REPASO</span><h1 style="margin:8px 0 10px;font-size:clamp(25px,4vw,38px)">Lo que conviene recordar hoy</h1>'+
      '<p>Estudia primero lo que te cuesta. El sistema propone intervalos orientativos según cómo valoras tu recuerdo.</p>'+
      '<div class="study-stats"><div class="study-stat"><b>'+list.length+'</b><span>Pendientes</span></div>'+
      '<div class="study-stat"><b>'+favorites.length+'</b><span>Guardados</span></div>'+
      '<div class="study-stat"><b>'+misses.length+'</b><span>Fallos para practicar</span></div></div></div>'+
      '<div class="review-toolbar"><h2>Repasos programados</h2></div>'+
      (list.length?'<div class="review-grid">'+list.map(item=>{
        const t=findTopic(item.sid,item.n);
        return '<article class="review-card"><small>'+escape(labelFor(item.sid))+' · Tema '+item.n+' · '+escape(item.review.due)+'</small>'+
        '<h3>'+escape(t.title)+'</h3><p>Intenta explicarlo sin consultar antes de revisar tu resumen.</p>'+
        '<button type="button" class="study-action primary-action" data-open-sid="'+escape(item.sid)+'" data-open-n="'+item.n+'">Repasar tema →</button></article>';
      }).join('')+'</div>':'<div class="review-empty"><strong>Sin repasos vencidos por ahora.</strong><p>Cuando termines un tema, usa «No lo recuerdo», «Tengo dudas» o «Lo recuerdo bien» para programar su siguiente revisión.</p></div>')+
      '<div class="review-toolbar"><h2>Temas que guardaste</h2></div>'+
      (favorites.length?'<div class="review-grid">'+favorites.map(k=>{
        const [sid,n]=k.split(':'),t=findTopic(sid,n);
        return '<article class="review-card"><small>'+escape(labelFor(sid))+' · Tema '+Number(n)+'</small><h3>'+escape(t.title)+'</h3>'+
        '<button class="study-action" data-open-sid="'+escape(sid)+'" data-open-n="'+Number(n)+'">Abrir tema</button></article>';
      }).join('')+'</div>':'<p class="study-hint">Pulsa «☆ Guardar tema» para reunir aquí los contenidos más difíciles o importantes.</p>')+
      '<div class="review-toolbar"><h2>Preguntas para volver a intentar</h2>'+
      (misses.length?'<button id="retryMistakes" class="study-action primary-action">Practicar fallos →</button>':'')+'</div>'+
      (misses.length?'<div class="review-grid">'+misses.map(([k,item])=>'<article class="review-card">'+
      '<small>'+escape(labelFor(item.sid))+'</small><h3>'+escape(item.title)+'</h3>'+
      '<p>Este ejercicio necesita una nueva práctica.</p></article>').join('')+'</div>':
      '<p class="study-hint">Los errores de los simulacros aparecerán aquí para volver a intentarlos.</p>');
    const oldShow=show;oldShow('reviewView');
    $s('#reviewBackHome').onclick=goHome;
    view.querySelectorAll('[data-open-sid]').forEach(b=>b.addEventListener('click',()=>goTopic(b.dataset.openSid,Number(b.dataset.openN))));
    if($s('#retryMistakes'))$s('#retryMistakes').onclick=retryMistakes;
    const close=$s('#sidebar .sidebar-close');if($s('#sidebar.open'))close?.click();
    document.body.classList.remove('study-quiet');
  }
  function retryMistakes() {
    const failures=Object.entries(saved.mistakes).filter(([_,m])=>findCourse(m.sid));
    if(!failures.length)return;
    const first=failures[failures.length-1][1].sid;
    const indices=failures.filter(([_,m])=>m.sid===first)
      .map(([_,m])=>Number(m.idx)).filter(i=>EXAMS.questions[first]?.[i]);
    if(!indices.length)return;
    openSubject(first);
    state.examOrder=[...new Set(indices)].reverse();
    state.examPos=0;state.correct=0;state.answered=false;
    $s('#examTitle').textContent=findCourse(first).title+' · Reforzar errores';
    renderQuestion();show('examView');
  }
  function exportStudy() {
    const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),data:saved},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='master-ia-apuntes-'+today()+'.json';document.body.appendChild(a);a.click();
    a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  const fileInput=document.createElement('input');
  fileInput.type='file';fileInput.accept='.json,application/json';fileInput.style.display='none';fileInput.setAttribute('aria-label','Importar apuntes');
  document.body.appendChild(fileInput);
  fileInput.addEventListener('change',async()=>{
    const file=fileInput.files?.[0];if(!file)return;
    if(file.size>500000){alert('El archivo supera el tamaño permitido.');return;}
    try{
      const obj=JSON.parse(await file.text());
      if(!obj || obj.version!==1 || !obj.data || typeof obj.data!=='object')throw new Error('Formato no reconocido');
      if(!confirm('¿Restaurar esta copia? Reemplazará las notas y los repasos guardados en este dispositivo.'))return;
      saved=sanitize(obj.data);store();refreshDashboard();
      alert('Copia de estudio restaurada.');if($s('#reviewView.active'))showReview();
    }catch(_){alert('No se pudo leer la copia de estudio.');}
    finally{fileInput.value='';}
  });

  const previousRenderHome=renderHome;
  renderHome=function(){previousRenderHome();ensureDashboard();};
  const previousSubject=openSubject;
  openSubject=function(id){previousSubject(id);enhanceSubject();};
  const previousTopic=openTopic;
  openTopic=function(n){
    previousTopic(n);
    if(!state.subject || !state.topic)return;
    saved.visited={sid:state.subjectId,n:Number(n)};
    store();
    topicPanel(state.subjectId,state.topic);
    refreshDashboard();
  };
  const previousMarkTopic=markTopic;
  markTopic=async function(n){
    const sid=state.subjectId;
    const result=await previousMarkTopic(n);
    if(sid){saved.completed[reviewKey(sid,n)]=true;store();refreshDashboard();}
    return result;
  };
  const previousToggleDone=toggleDone;
  toggleDone=async function(event,n){
    const sid=state.subjectId;
    const result=await previousToggleDone(event,n);
    if(sid){saved.completed[reviewKey(sid,n)]=!!state.progress[reviewKey(sid,n)];store();refreshDashboard();enhanceSubject();}
    return result;
  };
  const previousCheck=checkAnswer;
  checkAnswer=async function(idx) {
    if(state.answered)return previousCheck(idx);
    const sid=state.subjectId,q=EXAMS.questions?.[sid]?.[idx],start=state.correct;
    const value=await previousCheck(idx);
    if(q && state.answered){
      const k=sid+':'+idx;
      if(state.correct-start<.7){
        saved.mistakes[k]={sid:sid,idx:idx,title:String(q.q||'Pregunta pendiente').slice(0,200)};
      }else delete saved.mistakes[k];
      store();
    }
    return value;
  };
  const previousFinish=finishExam;
  finishExam=function(){previousFinish();refreshDashboard();};
  const previousGoHome=goHome;
  goHome=function(){document.body.classList.remove('study-quiet');previousGoHome();ensureDashboard();};
  const previousShow=show;
  show=function(id){
    if(id!=='topicView')document.body.classList.remove('study-quiet');
    previousShow(id);
    const reviewBtn=$s('#reviewBottom');
    if(reviewBtn)reviewBtn.setAttribute('aria-current',id==='reviewView'?'page':'false');
  };
  const nav=$s('#subjectNav'),sidebar=$s('#sidebar');
  if(nav && sidebar){
    const b=document.createElement('button');
    b.id='studyReviewEntry';b.innerHTML='↻ Repasar hoy <span>0</span>';
    b.type='button';b.onclick=showReview;
    sidebar.insertBefore(b,nav);
  }
  const bottom=$s('.mobileNav');
  if(bottom && !$s('#reviewBottom')){
    const b=document.createElement('button');
    b.id='reviewBottom';b.type='button';b.dataset.mobile='review';
    b.innerHTML='↻<span>Repasar</span>';b.onclick=showReview;
    bottom.appendChild(b);
  }
  window.showStudyReview=showReview;
  ensureDashboard();loadRemote();
})();