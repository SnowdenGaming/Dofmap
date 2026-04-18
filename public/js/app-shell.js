(function () {
  const USER_KEY = 'dofus-current-user';

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[ch]));
  }

  function getCachedUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function setCachedUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username
      }));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  function renderAuth(user) {
    const authArea = document.getElementById('auth-area');
    if (!authArea) return;

    if (user) {
      const username = escapeHtml(user.username || 'Aventurier');
      authArea.innerHTML = `
        <div class="user-chip">
          <span class="user-chip-label">Compte</span>
          <strong>${username}</strong>
        </div>
        <button class="btn-topbar btn-logout" type="button" data-shell-logout="true">Déconnexion</button>`;
      return;
    }

    authArea.innerHTML = '<a href="login.html" class="btn-topbar btn-login">Connexion</a>';
  }

  async function logout() {
    setCachedUser(null);
    renderAuth(null);
    if (window.DofusApi?.logout) await window.DofusApi.logout();
    window.location.href = 'login.html';
  }

  window.DofusShell = {
    getCachedUser,
    setCachedUser,
    renderAuth,
    setUser(user) {
      setCachedUser(user);
      renderAuth(user);
    },
    setGuest() {
      setCachedUser(null);
      renderAuth(null);
    },
    logout
  };

  document.addEventListener('click', event => {
    if (event.target.closest('[data-shell-logout="true"]')) logout();
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderAuth(getCachedUser());
  });
})();
