(async function syncStudyCatalog(){
  try {
    if (typeof COURSES === 'undefined' || typeof EXAMS === 'undefined') return;
    const payload = {
      courses: COURSES,
      questions: EXAMS.questions || {}
    };
    await fetch('/api/catalog/sync', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
  } catch (_) {
    // El sitio sigue funcionando offline/estático aunque PostgreSQL no esté disponible.
  }
})();
