(function () {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  if (!sidebar || !menuBtn) return;

  let overlay = document.getElementById('menuOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'menuOverlay';
    overlay.className = 'menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  let closeBtn = sidebar.querySelector('.sidebar-close');
  if (!closeBtn) {
    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'sidebar-close';
    closeBtn.setAttribute('aria-label', 'Cerrar menú');
    closeBtn.innerHTML = '×';
    sidebar.insertBefore(closeBtn, sidebar.firstChild);
  }

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  function setOpen(open) {
    if (!isMobile()) open = false;
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function closeMenu() {
    setOpen(false);
  }

  // Sobrescribe el toggle anterior para que el estado del menú y el fondo siempre coincidan.
  menuBtn.onclick = function (event) {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!sidebar.classList.contains('open'));
  };

  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  const subjectsButton = document.querySelector('[data-mobile="subjects"]');
  if (subjectsButton) {
    subjectsButton.addEventListener('click', function () {
      setTimeout(() => setOpen(true), 0);
    });
  }

  // Al entrar a una asignatura o a Inicio, el panel se cierra automáticamente.
  const subjectNav = document.getElementById('subjectNav');
  if (subjectNav) {
    subjectNav.addEventListener('click', function (event) {
      if (event.target.closest('button')) setTimeout(closeMenu, 0);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (!isMobile()) closeMenu();
  });

  // Cierre con gesto de deslizar hacia la izquierda sobre el menú.
  let touchStartX = null;
  sidebar.addEventListener('touchstart', function (event) {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  sidebar.addEventListener('touchend', function (event) {
    if (touchStartX == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    if (touchStartX - endX > 55) closeMenu();
    touchStartX = null;
  }, { passive: true });

  setOpen(false);
})();
