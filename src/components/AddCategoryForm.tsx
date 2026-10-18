import { useState, type KeyboardEvent, type FormEvent } from 'react';

interface Props {
  onAdd: (name: string) => boolean;
  onCancel: () => void;
}

export default function AddCategoryForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) return;
    if (onAdd(value)) {
      setName('');
      return;
    }
    setError('Cette catégorie existe déjà.');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onCancel();
  };

  return (
    <div
      className="category-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <section
        className="category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-category-title"
      >
        <h2 id="add-category-title">Ajouter une catégorie</h2>
        <p className="category-modal-description">Donnez un nom à votre nouvelle catégorie.</p>
        <form onSubmit={submit}>
          <label className="category-modal-label" htmlFor="category-name">
            Nom de la catégorie
          </label>
          <input
            id="category-name"
            autoFocus
            required
            value={name}
            placeholder="Ex : Antipasti, Vins, Pizza…"
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
          />
          {error && <p className="category-modal-error" role="alert">{error}</p>}
          <div className="category-modal-actions">
            <button type="button" className="category-modal-cancel" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="category-modal-save">
              Enregistrer
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}