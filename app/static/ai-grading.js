(function(){
  if (typeof checkAnswer !== 'function') return;

  const previousCheckAnswer = checkAnswer;
  const previousRenderQuestion = typeof renderQuestion === 'function' ? renderQuestion : null;
  const h = (v) => String(v ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  if (previousRenderQuestion) {
    renderQuestion = function(){
      previousRenderQuestion();
      const input = document.querySelector('#openAnswer');
      if (input && !document.querySelector('.ai-open-note')) {
        input.insertAdjacentHTML('afterend','<div class="ai-open-note"><span>✦</span><div><b>Corrección semántica con IA</b><small>Evalúa si entendiste el concepto aunque no uses exactamente las mismas palabras.</small></div></div>');
      }
    };
  }

  function localFallback(q, answer) {
    const normalized = answer.toLowerCase();
    const keys = q.keywords || [];
    const hits = keys.filter(k => normalized.includes(String(k).toLowerCase())).length;
    const score = Math.min(1, hits / Math.max(1, keys.length));
    return {
      score,
      verdict: score >= .75 ? 'correcta' : score >= .4 ? 'parcial' : 'incorrecta',
      feedback: 'No fue posible usar la corrección semántica por IA; se aplicó una comprobación local por conceptos clave.',
      strengths: hits ? [`Incluiste ${hits} de ${keys.length} conceptos clave detectables.`] : [],
      missing: keys.filter(k => !normalized.includes(String(k).toLowerCase())).slice(0, 5),
      improved_answer: q.answerText || '',
      explanation: q.explanation || '',
      ai: false
    };
  }

  function renderAiFeedback(result) {
    const scorePct = Math.round((Number(result.score) || 0) * 100);
    const strengths = (result.strengths || []).slice(0, 5);
    const missing = (result.missing || []).slice(0, 6);
    return `
      <div class="ai-grade-head">
        <div><span class="ai-badge">${result.ai === false ? 'Respaldo local' : 'Corrección IA'}</span><b>${h(result.verdict || 'evaluada')}</b></div>
        <strong>${scorePct}%</strong>
      </div>
      <p>${h(result.feedback || '')}</p>
      ${strengths.length ? `<div class="ai-feedback-block good-points"><b>Lo que está bien</b><ul>${strengths.map(x=>`<li>${h(x)}</li>`).join('')}</ul></div>` : ''}
      ${missing.length ? `<div class="ai-feedback-block missing-points"><b>Qué faltó o puedes mejorar</b><ul>${missing.map(x=>`<li>${h(x)}</li>`).join('')}</ul></div>` : ''}
      ${result.explanation ? `<div class="ai-feedback-block"><b>Por qué</b><p>${h(result.explanation)}</p></div>` : ''}
      ${result.improved_answer ? `<div class="ai-reference"><b>Una respuesta mejor podría ser:</b><p>${h(result.improved_answer)}</p></div>` : ''}
    `;
  }

  checkAnswer = async function(idx) {
    if (state.answered) {
      nextQuestion();
      return;
    }

    const q = EXAMS.questions[state.subjectId][idx];
    if (!q || q.type !== 'open') {
      return previousCheckAnswer(idx);
    }

    const input = document.querySelector('#openAnswer');
    const answer = (input?.value || '').trim();
    if (!answer) {
      input?.focus();
      return;
    }

    const button = document.querySelector('#checkButton');
    const feedback = document.querySelector('#feedback');
    if (button) {
      button.disabled = true;
      button.textContent = 'Corrigiendo con IA…';
      button.classList.add('loading');
    }
    if (feedback) {
      feedback.className = 'feedback ai-wait';
      feedback.innerHTML = '<div class="ai-thinking"><span></span><span></span><span></span> Analizando tu respuesta por significado, no solo por palabras exactas…</div>';
    }

    let result;
    try {
      const response = await fetch('/api/ai/grade-open', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          subject_id: state.subjectId,
          subject_title: state.subject?.title || '',
          question: q.q,
          user_answer: answer,
          reference_answer: q.answerText || '',
          explanation: q.explanation || '',
          keywords: q.keywords || []
        })
      });
      if (!response.ok) throw new Error('AI unavailable');
      result = await response.json();
    } catch (_) {
      result = localFallback(q, answer);
    }

    const score = Math.max(0, Math.min(1, Number(result.score) || 0));
    state.correct += score;
    state.answered = true;

    if (feedback) {
      feedback.className = 'feedback ' + (score >= .7 ? 'good' : 'bad') + ' ai-feedback';
      feedback.innerHTML = renderAiFeedback(result);
    }

    if (button) {
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = state.examPos === state.examOrder.length - 1 ? 'Ver resultado' : 'Siguiente';
    }

    try {
      await api('/api/attempt', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          profile_id: profile,
          subject_id: state.subjectId,
          question_index: idx,
          score,
          answer,
          feedback: result
        })
      });
    } catch (_) {}
  };
})();
