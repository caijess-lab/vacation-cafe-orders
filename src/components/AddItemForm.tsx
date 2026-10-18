import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface Props {
  categories: string[];
  initialCategory?: string;
  onAdd: (name: string, category: string) => void;
  onCancel: () => void;
}

export default function AddItemForm({
  categories,
  initialCategory,
  onAdd,
  onCancel,
}: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(initialCategory ?? categories[0] ?? '');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) {
      setError('Le nom du plat est obligatoire.');
      return;
    }
    if (!category) return;
    onAdd(value, category);
    onCancel();
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
        aria-labelledby="add-item-title"
      >
        <h2 id="add-item-title">Ajouter un plat</h2>
        <p className="category-modal-description">
          Ajoutez un plat ou une boisson à une catégorie.
        </p>
        <form onSubmit={submit}>
          <label className="category-modal-label" htmlFor="item-name">
            Nom du plat ou de la boisson
          </label>
          <input
            id="item-name"
            autoFocus
            required
            value={name}
            placeholder="Ex : Pizza Margherita"
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
          />
          {error && <p className="category-modal-error" role="alert">{error}</p>}
          <label className="category-modal-label category-modal-select-label" htmlFor="item-category">
            Catégorie
          </label>
          <select
            id="item-category"
            className="category-modal-select"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.length === 0 ? (
              <option value="">Aucune catégorie disponible</option>
            ) : (
              categories.map((itemCategory) => (
                <option key={itemCategory} value={itemCategory}>
                  {itemCategory}
                </option>
              ))
            )}
          </select>
          {categories.length === 0 && (
            <p className="category-modal-error" role="alert">
              Créez d’abord une catégorie pour pouvoir ajouter un plat.
            </p>
          )}
          <div className="category-modal-actions">
            <button type="button" className="category-modal-cancel" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="category-modal-save" disabled={categories.length === 0}>
              Enregistrer
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}