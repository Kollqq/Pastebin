import React from "react";

export default function ConfirmModal({
  open,
  title,
  description,
  children,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmDisabled = false,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card glass-card">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {description && <p className="modal-description">{description}</p>}
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="btn danger"
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
