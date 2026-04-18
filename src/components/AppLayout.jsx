import { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

function ThemeButton() {
  const { isNight, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={isNight ? 'Activer le mode jour' : 'Activer le mode nuit'}
      title={isNight ? 'Mode jour' : 'Mode nuit'}
    >
      {isNight ? '☾' : '☀'}
    </button>
  );
}

function AuthArea() {
  const navigate = useNavigate();
  const { user, isReady, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (!isReady && !user) {
    return <div className="app-topbar-placeholder" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link className="btn-topbar btn-login" to="/login">
        Connexion
      </Link>
    );
  }

  return (
    <>
      <div className="user-chip">
        <span className="user-chip-label">Compte</span>
        <strong>{user.username || 'Aventurier'}</strong>
      </div>
      <button className="btn-topbar btn-logout" type="button" onClick={handleLogout}>
        Deconnexion
      </button>
    </>
  );
}

export function AppLayout({ children }) {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('app-page');
    document.body.classList.remove('login-page');

    return () => {
      document.body.classList.remove('app-page');
    };
  }, []);

  return (
    <div className="app-page">
      <header className="topbar">
        <div className="app-shell app-topbar-inner">
          <Link className="app-brand" to="/" aria-label="Accueil Dofus Retro">
            <span>Dofus Retro</span>
          </Link>

          <nav className="app-nav" aria-label="Navigation principale">
            <NavLink className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`} to="/" end>
              Accueil
            </NavLink>
            <NavLink className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`} to="/maps">
              Mes cartes
            </NavLink>
            <NavLink className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`} to="/community">
              Communaute
            </NavLink>
          </nav>

          <div className="app-topbar-actions">
            <ThemeButton />
            <AuthArea />
          </div>
        </div>
      </header>

      <main className={`app-main ${location.pathname === '/' ? '' : 'app-main-inner'}`}>{children}</main>
      <footer>Dofus Retro 1.29 · Monde des Douze · Fan Site</footer>
    </div>
  );
}
