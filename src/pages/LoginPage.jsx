import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isReady, login, register } = useAuth();
  const { isNight, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [message, setMessage] = useState({ login: null, register: null });
  const [busy, setBusy] = useState({ login: false, register: false });

  useEffect(() => {
    document.body.classList.remove('app-page');
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  if (isReady && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function showMessage(scope, text, type) {
    setMessage(current => ({ ...current, [scope]: { text, type } }));
  }

  async function handleLogin() {
    const { identifier, password } = loginForm;

    if (!identifier.trim() || !password) {
      showMessage('login', 'Remplissez tous les champs.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      showMessage('login', "Connectez-vous avec votre adresse e-mail.", 'error');
      return;
    }

    setBusy(current => ({ ...current, login: true }));
    const result = await login(identifier, password);
    setBusy(current => ({ ...current, login: false }));

    if (!result.ok) {
      showMessage('login', result.error, 'error');
      return;
    }

    showMessage('login', `Bienvenue, ${result.username} !`, 'success');
    setTimeout(() => navigate('/'), 650);
  }

  async function handleRegister() {
    const { username, email, password, passwordConfirm } = registerForm;

    if (password !== passwordConfirm) {
      showMessage('register', 'Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    setBusy(current => ({ ...current, register: true }));
    const result = await register(username, email, password);
    setBusy(current => ({ ...current, register: false }));

    if (!result.ok) {
      showMessage('register', result.error, 'error');
      return;
    }

    if (result.needsEmailConfirmation) {
      showMessage(
        'register',
        result.message || 'Compte cree. Verifiez votre e-mail avant de vous connecter.',
        'success'
      );
      return;
    }

    showMessage('register', `Compte cree ! Bienvenue, ${result.username} !`, 'success');
    setTimeout(() => navigate('/'), 750);
  }

  return (
    <main className="login-page-shell">
      <section className="login-shell">
        <section className="login-visual" aria-label="Dofus Retro">
          <img src="/img/map 1.29.jpg" alt="Carte du Monde des Douze" />
          <div className="login-copy">
            <span className="app-eyebrow">Dofus Retro</span>
            <h1>Retrouvez vos cartes avant de repartir en chasse.</h1>
            <p>
              Connexion rapide, cartes sauvegardees et reperes prets pour votre prochaine session.
            </p>
          </div>
        </section>

        <section className="login-card" aria-label="Connexion">
          <button
            className="theme-toggle login-theme-toggle"
            type="button"
            aria-label={isNight ? 'Activer le mode jour' : 'Activer le mode nuit'}
            title={isNight ? 'Mode jour' : 'Mode nuit'}
            onClick={toggleTheme}
          >
            {isNight ? '☾' : '☀'}
          </button>

          <div className="login-header">
            <span className="app-eyebrow">Compte</span>
            <h2>Dofus Retro</h2>
            <p>Monde des Douze · Fan Site</p>
          </div>

          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab('login')}
            >
              Connexion
            </button>
            <button
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab('register')}
            >
              Creer un compte
            </button>
          </div>

          <div className={`tab-content ${activeTab === 'login' ? 'active' : ''}`}>
            <div className="form-group">
              <label htmlFor="login-id">Adresse e-mail</label>
              <input
                id="login-id"
                type="email"
                placeholder="votre@email.com"
                autoComplete="email"
                value={loginForm.identifier}
                onChange={event =>
                  setLoginForm(current => ({ ...current, identifier: event.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-pw">Mot de passe</label>
              <input
                id="login-pw"
                type="password"
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={event =>
                  setLoginForm(current => ({ ...current, password: event.target.value }))
                }
              />
            </div>
            <button className="btn-submit" type="button" onClick={handleLogin} disabled={busy.login}>
              {busy.login ? 'Connexion...' : 'Se connecter'}
            </button>
            {message.login ? <div className={`msg ${message.login.type}`}>{message.login.text}</div> : null}
          </div>

          <div className={`tab-content ${activeTab === 'register' ? 'active' : ''}`}>
            <div className="form-group">
              <label htmlFor="reg-username">Pseudo</label>
              <input
                id="reg-username"
                type="text"
                placeholder="Votre pseudo"
                autoComplete="username"
                value={registerForm.username}
                onChange={event =>
                  setRegisterForm(current => ({ ...current, username: event.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Adresse e-mail</label>
              <input
                id="reg-email"
                type="email"
                placeholder="votre@email.com"
                autoComplete="email"
                value={registerForm.email}
                onChange={event =>
                  setRegisterForm(current => ({ ...current, email: event.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-pw">Mot de passe</label>
              <input
                id="reg-pw"
                type="password"
                placeholder="Minimum 6 caracteres"
                autoComplete="new-password"
                value={registerForm.password}
                onChange={event =>
                  setRegisterForm(current => ({ ...current, password: event.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-pw2">Confirmer le mot de passe</label>
              <input
                id="reg-pw2"
                type="password"
                placeholder="Repetez votre mot de passe"
                autoComplete="new-password"
                value={registerForm.passwordConfirm}
                onChange={event =>
                  setRegisterForm(current => ({
                    ...current,
                    passwordConfirm: event.target.value
                  }))
                }
              />
            </div>
            <button
              className="btn-submit"
              type="button"
              onClick={handleRegister}
              disabled={busy.register}
            >
              {busy.register ? 'Creation...' : 'Creer mon compte'}
            </button>
            {message.register ? (
              <div className={`msg ${message.register.type}`}>{message.register.text}</div>
            ) : null}
          </div>

          <Link className="back-link" to="/">
            Retour a l'accueil
          </Link>
        </section>
      </section>
    </main>
  );
}
