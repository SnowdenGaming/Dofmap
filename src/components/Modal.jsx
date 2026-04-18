export function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
