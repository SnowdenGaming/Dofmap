export function MapCard({
  map,
  onOpen,
  onToggleVisibility,
  onDelete,
  mode = 'owner'
}) {
  const annotationLabel = `${map.annotationCount ?? 0} annotation${
    (map.annotationCount ?? 0) > 1 ? 's' : ''
  }`;

  return (
    <article className="app-map-card">
      <div className="app-map-thumb" />
      <div className="app-map-body">
        <div className="app-map-title" title={map.name}>
          {map.name}
        </div>
        <div className="app-map-meta">
          {mode === 'community'
            ? `Par ${map.username || 'Aventurier'} · Modifiee le ${map.updatedLabel}`
            : `Creee le ${map.createdLabel} · Modifiee le ${map.updatedLabel}`}
        </div>
        <div className="app-tags">
          <span className="app-tag">{annotationLabel}</span>
          <span className={`app-tag ${map.isPublic ? 'public' : ''}`}>
            {map.isPublic ? 'Public' : 'Privee'}
          </span>
        </div>
      </div>
      <div className={`app-card-actions ${mode === 'community' ? 'one' : ''}`}>
        <button className="btn-card" type="button" onClick={onOpen}>
          {mode === 'community' ? 'Voir la carte' : 'Ouvrir'}
        </button>
        {mode === 'owner' ? (
          <>
            <button className="btn-card" type="button" onClick={onToggleVisibility}>
              {map.isPublic ? 'Privee' : 'Public'}
            </button>
            <button className="btn-card danger" type="button" onClick={onDelete}>
              Supprimer
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
