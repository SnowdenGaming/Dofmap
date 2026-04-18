import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { AppButton } from '../components/AppButton';
import { MapCard } from '../components/MapCard';
import { listPublicMaps } from '../lib/dofus-api';

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function CommunityPage() {
  const [maps, setMaps] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await listPublicMaps().catch(() => []);
      if (!active) return;
      setMaps(
        data.map(map => ({
          ...map,
          updatedLabel: formatDate(map.updatedAt)
        }))
      );
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredMaps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return maps;
    return maps.filter(map => {
      const name = String(map.name || '').toLowerCase();
      const username = String(map.username || '').toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [maps, search]);

  return (
    <AppLayout>
      <section className="app-shell app-page-heading">
        <div>
          <span className="app-eyebrow">Cartes publiques</span>
          <h1 className="app-title">Communaute</h1>
          <p className="app-subtitle">
            Explorez les cartes partagees par les aventuriers et ouvrez celles qui aident vraiment
            votre route.
          </p>
        </div>
        <div className="app-heading-actions">
          <AppButton className="primary" to="/maps">
            Mes cartes
          </AppButton>
        </div>
      </section>

      <section className="app-shell app-toolbar">
        <label className="app-search" htmlFor="community-search">
          <span aria-hidden="true">⌕</span>
          <input
            id="community-search"
            type="search"
            placeholder="Rechercher par carte ou aventurier"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </label>
        <span className="app-toolbar-note">
          {filteredMaps.length} carte{filteredMaps.length > 1 ? 's' : ''} publique
          {filteredMaps.length > 1 ? 's' : ''}
        </span>
      </section>

      <section className="app-shell app-grid">
        {filteredMaps.length === 0 ? (
          <div className="app-empty">
            <div>
              <strong>Aucune carte publique</strong>
              <p>Revenez plus tard ou publiez une carte depuis votre espace.</p>
            </div>
          </div>
        ) : (
          filteredMaps.map(map => (
            <MapCard
              key={map.id}
              map={map}
              mode="community"
              onOpen={() => {
                window.location.href = `/map-editor.html?id=${map.id}`;
              }}
            />
          ))
        )}
      </section>
    </AppLayout>
  );
}
