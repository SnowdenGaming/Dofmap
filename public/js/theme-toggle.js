(function () {
  const STORAGE_KEY = 'dofmap-theme';

  function applyTheme(theme) {
    const isNight = theme === 'night';
    document.body.classList.toggle('night', isNight);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.textContent = isNight ? '☾' : '☀';
      button.setAttribute('aria-label', isNight ? 'Activer le mode jour' : 'Activer le mode nuit');
      button.setAttribute('title', isNight ? 'Mode jour' : 'Mode nuit');
    });
  }

  function currentTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'day';
  }

  function toggleTheme() {
    const nextTheme = document.body.classList.contains('night') ? 'day' : 'night';
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  function createButton() {
    const existing = document.getElementById('theme-toggle');
    if (existing) {
      existing.dataset.themeToggle = 'true';
      existing.type = 'button';
      return existing;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'theme-toggle';
    button.className = 'global-theme-toggle';
    button.dataset.themeToggle = 'true';

    const target =
      document.querySelector('.topbar-right') ||
      document.querySelector('#auth-area') ||
      document.querySelector('.topbar-inner') ||
      document.querySelector('#topbar') ||
      document.querySelector('.topbar');

    if (target) {
      if (target.id === 'auth-area' && target.parentElement) {
        target.parentElement.appendChild(button);
      } else {
        target.appendChild(button);
      }
    } else {
      button.classList.add('is-floating');
      document.body.appendChild(button);
    }

    return button;
  }

  function initThemeToggle() {
    const button = createButton();
    button.addEventListener('click', toggleTheme);
    applyTheme(currentTheme());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
