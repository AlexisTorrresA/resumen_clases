
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const pln={id:'pln',title:window.MASTER_DATA.course.title,short:'PLN',topics:window.MASTER_DATA.topics,examSummary:window.MASTER_DATA.course.examSummary||[],studyRoute:window.MASTER_DATA.course.studyRoute||[]};
const COURSES=[pln,window.SUBJECT_VA,window.SUBJECT_TAA,window.SUBJECT_IGPIA,window.SUBJECT_RPA].filter(Boolean);
const EXAMS=window.EXAM_DATA||{questions:{},examSources:{}};
const state={subject:null,subjectId:null,topic:null,examOrder:[],examPos:0,correct:0,answered:false,progress:{}};
const profile=localStorage.studyProfile || (localStorage.studyProfile=crypto.randomUUID());
const api=async(url,opt)=>{const r=await fetch(url,opt);if(!r.ok)throw new Error(await r.text());return r.json()};
function show(id){$$('.view').forEach(v=>v.classList.remove('active'));$('#'+id).classList.add('active');window.scrollTo(0,0)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function boot(){
 try{const st=await api('/api/stats/'+profile);(st.progress||[]).forEach(p=>state.progress[`${p.subject_id}:${p.topic_number}`]=p.done)}catch{}
 renderNav();renderHome();
}
function renderNav(){
 $('#subjectNav').innerHTML='<button onclick="goHome()"><b>Inicio</b><small>Panel general</small></button>'+COURSES.map(s=>`<button onclick="openSubject('${s.id}')"><b>${esc(s.title)}</b><small>${s.topics.length} temas</small></button>`).join('');
}
function renderHome(){
 $('#totalTopics').textContent=COURSES.reduce((a,s)=>a+s.topics.length,0);
 $('#subjectCards').innerHTML=COURSES.map(s=>{
   const done=Object.entries(state.progress).filter(([k,v])=>v&&k.startsWith(s.id+':')).length;
   const pct=Math.round(done/s.topics.length*100);
   return `<div class="subject-card" onclick="openSubject('${s.id}')"><span class="pill">${esc(s.short)}</span><h3>${esc(s.title)}</h3><p>${s.topics.length} temas · ${pct}% repasado</p><div class="progressmini"><span style="width:${pct}%"></span></div></div>`;
 }).join('');
 renderChart();show('homeView');
}
let chart;
function renderChart(){
 if(chart)chart.destroy();
 chart=new Chart($('#progressChart'),{type:'bar',data:{labels:COURSES.map(s=>s.short),datasets:[{label:'Temas repasados',data:COURSES.map(s=>Object.entries(state.progress).filter(([k,v])=>v&&k.startsWith(s.id+':')).length),borderWidth:1}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
}
function openSubject(id){
 state.subjectId=id;state.subject=COURSES.find(s=>s.id===id);
 $('#subjectTitle').textContent=state.subject.title;
 $('#subjectMeta').textContent=`${state.subject.topics.length} temas · resumen orientado a examen`;
 $('#topicList').innerHTML=state.subject.topics.map(t=>{
   const done=!!state.progress[`${id}:${t.n}`];
   const summary=t.summary||t.short||'Resumen del tema';
   return `<div class="topic-card"><div class="topicnum">${t.n}</div><div><h3>${esc(t.title)}</h3><p>${esc(summary.slice(0,150))}${summary.length>150?'…':''}</p></div><div class="topic-actions"><button class="donebtn ${done?'done':''}" onclick="toggleDone(event,${t.n})">${done?'✓ Repasado':'Marcar'}</button><button class="studybtn" onclick="openTopic(${t.n})">Estudiar →</button></div></div>`;
 }).join('');
 const summaries=(state.subject.examSummary&&state.subject.examSummary.length)?state.subject.examSummary:state.subject.topics.slice(0,8).map(t=>(t.mustKnow||[])[0]||t.summary);
 const route=(state.subject.studyRoute&&state.subject.studyRoute.length)?state.subject.studyRoute:state.subject.topics.map(t=>`Tema ${t.n}: ${t.title}`);
 $('#summaryTab').innerHTML=`<div class="panel"><h2>Resumen de los resúmenes</h2><ul>${summaries.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="panel"><h2>Ruta de estudio</h2><ol>${route.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
 $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='topics'));$$('.tabpane').forEach(x=>x.classList.remove('active'));$('#topicsTab').classList.add('active');
 show('subjectView');
}
async function toggleDone(ev,n){
 ev.stopPropagation();const key=`${state.subjectId}:${n}`,done=!state.progress[key];state.progress[key]=done;
 ev.currentTarget.classList.toggle('done',done);ev.currentTarget.textContent=done?'✓ Repasado':'Marcar';
 try{await api('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile_id:profile,subject_id:state.subjectId,topic_number:n,done})})}catch{}
}
function openTopic(n){
 const t=state.subject.topics.find(x=>x.n===n);state.topic=t;
 const must=t.mustKnow||t.concepts?.slice(0,5).map(c=>`${c.term}: ${c.def}`)||[];
 const example=t.example||t.examples?.[0]||'Relaciona este tema con un caso práctico y explica cada paso.';
 const examTip=t.examTip||t.traps?.[0]||'Prioriza definiciones, comparaciones y aplicación práctica.';
 const sections=t.sections||t.concepts?.map(c=>c.term)||[];
 $('#topicArticle').innerHTML=`<div class="articleHero"><span class="eyebrow">TEMA ${t.n}</span><h1>${esc(t.title)}</h1><p>${esc(t.summary||t.short||'')}</p></div>
 <div class="articleGrid"><div><section class="studySection"><h2>Lo imprescindible para el examen</h2><ul>${must.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>
 <section class="studySection"><h2>Ejemplo para fijarlo</h2><div class="callout">${esc(example)}</div></section>
 <section class="studySection"><h2>Mapa del tema</h2><div>${sections.map(s=>`<span class="pill" style="display:inline-block;margin:4px">${esc(typeof s==='string'?s:s.term||'')}</span>`).join('')}</div></section></div>
 <aside><section class="studySection"><h2>🎯 Pista de examen</h2><div class="callout warning">${esc(examTip)}</div></section>
 <section class="studySection"><h2>Acción rápida</h2><button class="checkbtn" onclick="markTopic(${t.n})">${state.progress[`${state.subjectId}:${t.n}`]?'✓ Ya repasado':'Marcar como repasado'}</button></section></aside></div>`;
 show('topicView');
}
async function markTopic(n){const key=`${state.subjectId}:${n}`,done=true;state.progress[key]=done;try{await api('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile_id:profile,subject_id:state.subjectId,topic_number:n,done})})}catch{};openTopic(n)}
function startExam(){
 const qs=EXAMS.questions[state.subjectId]||[];if(!qs.length){alert('Aún no hay preguntas cargadas para esta asignatura.');return}
 state.examOrder=[...Array(qs.length).keys()].sort(()=>Math.random()-.5);state.examPos=0;state.correct=0;state.answered=false;
 $('#examTitle').textContent=state.subject.title;renderQuestion();show('examView');
}
function renderQuestion(){
 const qs=EXAMS.questions[state.subjectId],idx=state.examOrder[state.examPos],q=qs[idx];state.answered=false;
 $('#examScore').textContent=`${state.correct.toFixed(1)} / ${state.examPos}`;$('#examBar').style.width=`${state.examPos/state.examOrder.length*100}%`;
 let body=`<span class="pill">Pregunta ${state.examPos+1} de ${state.examOrder.length}</span><h2>${esc(q.q)}</h2>`;
 if(q.type==='single'||q.type==='multi') body+=q.options.map((o,i)=>`<label class="option"><input type="${q.type==='single'?'radio':'checkbox'}" name="answer" value="${i}"> <span>${esc(o)}</span></label>`).join('');
 else body+=`<textarea id="openAnswer" class="answerbox" placeholder="Escribe tu respuesta antes de corregir..."></textarea>`;
 body+=`<div id="feedback"></div><div class="examActions"><button class="secondary" onclick="finishExam()">Terminar</button><button id="checkButton" class="checkbtn" onclick="checkAnswer(${idx})">Corregir</button></div>`;
 $('#questionCard').innerHTML=body;
}
async function checkAnswer(idx){
 if(state.answered){nextQuestion();return}
 const q=EXAMS.questions[state.subjectId][idx];let score=0,ans;
 if(q.type==='single'){const el=$('input[name=answer]:checked');if(!el)return;ans=Number(el.value);score=ans===q.answer?1:0;highlightChoice(q,ans)}
 else if(q.type==='multi'){ans=$$('input[name=answer]:checked').map(x=>Number(x.value)).sort((a,b)=>a-b);const right=[...q.answer].sort((a,b)=>a-b);score=JSON.stringify(ans)===JSON.stringify(right)?1:0;highlightChoice(q,ans)}
 else {ans=$('#openAnswer').value.trim();if(!ans)return;const normalized=ans.toLowerCase();const hits=(q.keywords||[]).filter(k=>normalized.includes(k.toLowerCase())).length;score=Math.min(1,hits/Math.max(1,(q.keywords||[]).length))}
 state.correct+=score;state.answered=true;
 const fb=$('#feedback');fb.className='feedback '+(score>=.7?'good':'bad');
 fb.innerHTML=`<b>${score===1?'Correcto':score>=.7?'Bien encaminado':'Revisa este punto'}</b><br>${esc(q.explanation)}${q.answerText?`<hr><b>Respuesta de referencia:</b><br>${esc(q.answerText)}`:''}<br><small class="muted">Fuente: ${esc(q.source||'material de la asignatura')}</small>`;
 $('#checkButton').textContent=state.examPos===state.examOrder.length-1?'Ver resultado':'Siguiente';
 try{await api('/api/attempt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile_id:profile,subject_id:state.subjectId,question_index:idx,score,answer:ans})})}catch{}
}
function highlightChoice(q,ans){$$('.option').forEach((el,i)=>{const ok=q.type==='single'?i===q.answer:q.answer.includes(i);const chosen=q.type==='single'?i===ans:ans.includes(i);if(ok)el.classList.add('correct');else if(chosen)el.classList.add('wrong');el.querySelector('input').disabled=true})}
function nextQuestion(){if(state.examPos>=state.examOrder.length-1){finishExam();return}state.examPos++;renderQuestion()}
function finishExam(){
 const total=state.examOrder.length,pct=Math.round(state.correct/Math.max(1,total)*100);
 $('#questionCard').innerHTML=`<div style="text-align:center;padding:20px"><span class="eyebrow">RESULTADO</span><h2 style="font-size:42px;margin:10px">${pct}%</h2><p>${state.correct.toFixed(1)} de ${total} puntos.</p><p class="muted">${pct>=80?'Muy buen nivel. Repasa los fallos y vuelve a intentar otro orden.':pct>=60?'Base sólida, pero conviene revisar los temas fallados.':'Vuelve a los resúmenes imprescindibles antes de repetir.'}</p><button class="checkbtn" onclick="startExam()">Nuevo simulacro</button></div>`;
 $('#examBar').style.width='100%';$('#examScore').textContent=`${state.correct.toFixed(1)} / ${total}`;
}
function showExams(){
 const qs=EXAMS.questions[state.subjectId]||[],src=EXAMS.examSources[state.subjectId]||[];
 $('#examsTab').innerHTML=`<div class="panel"><h2>Banco de práctica</h2><p>${qs.length} preguntas corregibles con explicación. Incluye test y respuestas abiertas con pauta por conceptos.</p><button class="checkbtn" onclick="startExam()">Comenzar simulacro</button></div><div class="panel"><h2>Exámenes históricos usados como referencia</h2><p class="muted">Los originales no se publican en GitHub; el sitio usa ejercicios derivados y explicaciones propias.</p><ul class="sourceList">${src.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>`;
}
function renderMap(){
 const nodes=[{id:'root',label:state.subject.short,shape:'box'}],edges=[];
 state.subject.topics.forEach(t=>{const id='t'+t.n;nodes.push({id,label:`${t.n}. ${t.title}`});edges.push({from:'root',to:id});const tags=(t.sections||t.concepts?.map(c=>c.term)||[]).slice(0,3);tags.forEach((s,j)=>{const k=`${id}-${j}`;nodes.push({id:k,label:typeof s==='string'?s:s.term||'',shape:'dot',size:12});edges.push({from:id,to:k})})});
 new vis.Network($('#conceptMap'),{nodes:new vis.DataSet(nodes),edges:new vis.DataSet(edges)},{interaction:{hover:true,navigationButtons:true},physics:{stabilization:true},nodes:{font:{size:14}},edges:{arrows:'to'}});
}
$$('.tab').forEach(b=>b.addEventListener('click',()=>{const tab=b.dataset.tab;$$('.tab').forEach(x=>x.classList.toggle('active',x===b));$$('.tabpane').forEach(x=>x.classList.remove('active'));$('#'+tab+'Tab').classList.add('active');if(tab==='map')setTimeout(renderMap,50);if(tab==='exams')showExams()}));
function goHome(){renderHome();$('#sidebar').classList.remove('open')}
$('#backHome').onclick=goHome;$('#backSubject').onclick=()=>show('subjectView');$('#backFromExam').onclick=()=>show('subjectView');$('#startExam').onclick=startExam;$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
$('#themeBtn').onclick=()=>{const d=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=d?'':'dark';localStorage.studyTheme=d?'light':'dark'};if(localStorage.studyTheme==='dark')document.documentElement.dataset.theme='dark';
$('#globalSearch').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const q=e.target.value.trim().toLowerCase();if(!q)return;let res=[];COURSES.forEach(s=>s.topics.forEach(t=>{const blob=[t.title,t.summary||t.short||'',...(t.mustKnow||[]),...(t.sections||[]).map(x=>typeof x==='string'?x:x.term||'')].join(' ').toLowerCase();if(blob.includes(q))res.push({sid:s.id,subject:s.title,n:t.n,title:t.title,summary:t.summary||t.short||''})}));$('#searchResults').innerHTML=res.length?res.map(r=>`<div class="result-card" onclick="openSearchResult('${r.sid}',${r.n})"><small>${esc(r.subject)} · Tema ${r.n}</small><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p></div>`).join(''):'<p>No encontré coincidencias.</p>';show('searchView')});
function openSearchResult(sid,n){openSubject(sid);openTopic(n)}$('#backFromSearch').onclick=goHome;
$$('.mobileNav button').forEach(b=>b.onclick=()=>{if(b.dataset.mobile==='home')goHome();if(b.dataset.mobile==='subjects')$('#sidebar').classList.add('open');if(b.dataset.mobile==='practice'){if(state.subjectId)startExam();else alert('Abre una asignatura primero.')}});
boot();
