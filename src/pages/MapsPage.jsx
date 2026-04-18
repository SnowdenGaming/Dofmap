import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { AppButton } from '../components/AppButton';
import { MapCard } from '../components/MapCard';
import { Modal } from '../components/Modal';
import { createMap, deleteMap, listMaps, updateMap } from '../lib/dofus-api';
import { useAuth } from '../providers/AuthProvider';

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function toDisplayMap(map) {
  return {
    ...map,
    createdLabel: formatDate(map.createdAt),
    updatedLabel: formatDate(map.updatedAt)
  };
}

export default function MapsPage() {
  const { isAuthenticated, isReady, refreshUser } = useAuth();
  const [maps, setMaps] = useState([]);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newMapName, setNewMapName] = useState('');
  const [newMapPublic, setNewMapPublic] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    refreshUser();
  }, [isReady, refreshUser]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!isAuthenticated) {
        setMaps([]);
        return;
      }

      const data = await listMaps().catch(() => []);
      if (active) {
        setMaps(data.map(toDisplayMap));
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isReady]);

  const filteredMaps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return maps;
    return maps.filter(map => String(map.name || '').toLowerCase().includes(query));
  }, [maps, search]);

  async function reloadMaps() {
    const data = await listMaps().catch(() => []);
    setMaps(data.map(toDisplayMap));
  }

  async function handleCreate() {
    if (!newMapName.trim()) return;
    setIsBusy(true);
    const map = await createMap({ name: newMapName, isPublic: newMapPublic }).catch(() => null);
    setIsBusy(false);
    if (map?.id) {
      window.location.href = `/map-editor.html?id=${map.id}`;
    }
  }

  async function handleVisibility(map) {
    await updateMap(map.id, { isPublic: !map.isPublic }).catch(() => null);
    await reloadMaps();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsBusy(true);
    await deleteMap(deleteTarget.id).catch(() => null);
    setIsBusy(false);
    setDeleteTarget(null);
    await reloadMaps();
  }

  return (
    <AppLayout>
      <section className="app-shell app-page-heading">
        <div>
          <span className="app-eyebrow">Bibliotheque</span>
          <h1 className="app-title">Mes cartes</h1>
          <p className="app-subtitle">
            Creez, filtrez et ouvrez vos cartes annotees du Monde des Douze.
          </p>
        </div>
        {isAuthenticated ? (
          <div className="app-heading-actions">
            <AppButton
              className="primary"
              onClick={() => {
                setNewMapName('');
                setNewMapPublic(false);
                setCreateOpen(true);
              }}
            >
              Nouvelle carte
            </AppButton>
          </div>
        ) : null}
      </section>

      {!isAuthenticated ? (
        <section className="app-shell app-empty">
          <div>
            <strong>Connexion requise</strong>
            <p>Connectez-vous pour acceder a vos cartes sauvegardees.</p>
            <AppButton className="primary" to="/login">
              Se connecter
            </AppButton>
          </div>
        </section>
      ) : (
        <>
          <section className="app-shell app-toolbar">
            <label className="app-search" htmlFor="map-search">
              <span aria-hidden="true">⌕</span>
              <input
                id="map-search"
                type="search"
                placeholder="Rechercher une carte"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </label>
            <span className="app-toolbar-note">
              {filteredMaps.length} carte{filteredMaps.length > 1 ? 's' : ''}
            </span>
          </section>

          <section className="app-shell app-grid">
            {filteredMaps.length === 0 ? (
              <div className="app-empty">
                <div>
                  <strong>Aucune carte trouvee</strong>
                  <p>Creez une nouvelle carte ou ajustez votre recherche.</p>
                </div>
              </div>
            ) : (
              filteredMaps.map(map => (
                <MapCard
                  key={map.id}
                  map={map}
                  onOpen={() => {
                    window.location.href = `/map-editor.html?id=${map.id}`;
                  }}
                  onToggleVisibility={() => handleVisibility(map)}
                  onDelete={() => setDeleteTarget(map)}
                />
              ))
            )}
          </section>
        </>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle carte">
        <label htmlFor="map-name-input">Nom de la carte</label>
        <input
          id="map-name-input"
          type="text"
          placeholder="Ex : Route Bonta, Farm Astrub"
          maxLength="60"
          value={newMapName}
          onChange={event => setNewMapName(event.target.value)}
        />
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Carte publique</div>
            <div className="toggle-hint">Visible dans les cartes de la communaute.</div>
          </div>
          <label className="toggle-switch" title="Rendre la carte publique">
            <input
              type="checkbox"
              checked={newMapPublic}
              onChange={event => setNewMapPublic(event.target.checked)}
            />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="modal-buttons">
          <button className="btn-confirm" type="button" disabled={isBusy} onClick={handleCreate}>
            Creer
          </button>
          <button className="btn-cancel" type="button" onClick={() => setCreateOpen(false)}>
            Annuler
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la carte ?"
      >
        <p className="modal-copy">
          Cette action est irreversible. Toutes les annotations seront perdues.
        </p>
        <div className="modal-buttons">
          <button className="btn-confirm danger" type="button" disabled={isBusy} onClick={handleDelete}>
            Supprimer
          </button>
          <button className="btn-cancel" type="button" onClick={() => setDeleteTarget(null)}>
            Annuler
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
