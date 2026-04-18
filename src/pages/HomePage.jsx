import { AppLayout } from '../components/AppLayout';
import { AppButton } from '../components/AppButton';

export default function HomePage() {
  return (
    <AppLayout>
      <section className="app-shell app-hero" aria-labelledby="home-title">
        <div className="app-hero-visual">
          <img src="/img/map 1.29.jpg" alt="Carte du Monde des Douze" />
          <div className="app-hero-copy">
            <span className="app-eyebrow">Monde des Douze</span>
            <h1 className="app-hero-title" id="home-title">
              Cartographiez vos trajets sans perdre le nord.
            </h1>
            <p className="app-hero-text">
              Une base claire pour retrouver vos reperes, vos routes et vos annotations sans
              recharger toute l’interface a chaque clic.
            </p>
          </div>
        </div>

        <aside className="app-panel" aria-label="Actions principales">
          <div className="app-section-header">
            <div>
              <span className="app-eyebrow">Atelier</span>
              <h2 className="app-title">Tout ce qu'il faut pour preparer une session.</h2>
              <p className="app-subtitle">
                Gardez vos cartes, ouvrez la communaute et repartez vite sur l’editeur.
              </p>
            </div>
          </div>

          <div className="app-actions-grid">
            <AppButton className="app-action-row" to="/maps">
              <span className="app-action-icon">01</span>
              <span>
                <strong className="app-action-title">Mes cartes</strong>
                <span className="app-action-text">
                  Retrouvez vos annotations privees et vos cartes deja publiees.
                </span>
              </span>
              <span className="app-row-arrow" aria-hidden="true">
                →
              </span>
            </AppButton>

            <AppButton className="app-action-row" to="/community">
              <span className="app-action-icon">02</span>
              <span>
                <strong className="app-action-title">Communaute</strong>
                <span className="app-action-text">
                  Explorez les cartes publiques partagees par les autres aventuriers.
                </span>
              </span>
              <span className="app-row-arrow" aria-hidden="true">
                →
              </span>
            </AppButton>
          </div>

          <div className="app-button-row">
            <AppButton className="primary" to="/maps">
              Ouvrir mes cartes
            </AppButton>
            <AppButton className="secondary" to="/community">
              Voir les cartes publiques
            </AppButton>
          </div>
        </aside>
      </section>

      <section className="app-shell app-feature-grid" aria-label="Points forts">
        <article className="app-card app-feature-card">
          <span className="app-card-kicker">Navigation</span>
          <h3>Un shell unique</h3>
          <p>Le menu, le profil et le theme restent en place pendant toute la navigation.</p>
        </article>
        <article className="app-card app-feature-card">
          <span className="app-card-kicker">Bibliotheque</span>
          <h3>Vos cartes sans friction</h3>
          <p>Recherche rapide, creation en une action et retour direct vers l’editeur.</p>
        </article>
        <article className="app-card app-feature-card">
          <span className="app-card-kicker">Partage</span>
          <h3>Communaute utile</h3>
          <p>Reperez vite les cartes publiques pertinentes avant de partir en jeu.</p>
        </article>
      </section>
    </AppLayout>
  );
}
