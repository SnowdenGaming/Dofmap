/* ── Dofus Rétro Auth — localStorage + Web Crypto SHA-256 ── */
const Auth = (() => {

  const USERS_KEY   = 'dofusretro_users';
  const SESSION_KEY = 'dofusretro_session';
  const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours

  /* Génère un sel aléatoire en hex */
  function genSalt() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* Hash SHA-256 d'une chaîne, retourne hex */
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* Hash mot de passe avec sel */
  async function hashPassword(password, salt) {
    return sha256(salt + password + salt);
  }

  /* Génère un token de session */
  async function genToken(username) {
    return sha256(username + Date.now() + genSalt());
  }

  /* ── Lecture / écriture des utilisateurs ── */
  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  /* ── Session ── */
  function getSession() {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!s || Date.now() > s.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  }
  function saveSession(username) {
    genToken(username).then(token => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        username,
        token,
        expiresAt: Date.now() + SESSION_TTL
      }));
    });
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /* ── API publique ── */
  return {

    /* Inscription → { ok, error } */
    async register(username, email, password) {
      username = username.trim();
      email    = email.trim().toLowerCase();

      if (!username || username.length < 3)
        return { ok: false, error: 'Le pseudo doit faire au moins 3 caractères.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { ok: false, error: 'Adresse e-mail invalide.' };
      if (!password || password.length < 6)
        return { ok: false, error: 'Le mot de passe doit faire au moins 6 caractères.' };

      const users = getUsers();
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
        return { ok: false, error: 'Ce pseudo est déjà utilisé.' };
      if (users.find(u => u.email === email))
        return { ok: false, error: 'Cette adresse e-mail est déjà utilisée.' };

      const salt         = genSalt();
      const passwordHash = await hashPassword(password, salt);
      users.push({ username, email, passwordHash, salt, createdAt: Date.now() });
      saveUsers(users);
      saveSession(username);
      return { ok: true };
    },

    /* Connexion → { ok, error } */
    async login(identifier, password) {
      identifier = identifier.trim().toLowerCase();
      const users = getUsers();
      const user  = users.find(u =>
        u.username.toLowerCase() === identifier || u.email === identifier
      );
      if (!user) return { ok: false, error: 'Pseudo ou e-mail introuvable.' };

      const hash = await hashPassword(password, user.salt);
      if (hash !== user.passwordHash)
        return { ok: false, error: 'Mot de passe incorrect.' };

      saveSession(user.username);
      return { ok: true, username: user.username };
    },

    logout() { clearSession(); },

    /* Retourne l'utilisateur connecté ou null */
    currentUser() {
      const s = getSession();
      return s ? s.username : null;
    },

    /* Redirige vers login si pas connecté */
    requireAuth(redirectTo = 'login.html') {
      if (!this.currentUser()) {
        window.location.href = redirectTo;
      }
    }
  };
})();
