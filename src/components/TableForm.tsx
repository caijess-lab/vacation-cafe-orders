import { useState, type FormEvent, type KeyboardEvent } from 'react';
import Button from './common/Button';

interface Props {
  initialName?: string;
  onSave: (name: string) => boolean;
  onCancel: () => void;
}

export default function TableForm({ initialName = '', onSave, onCancel }: Props) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const isEditing = Boolean(initialName);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) {
      setError('Le nom de la table est obligatoire.');
      return;
    }
    if (!onSave(value)) {
      setError('Une table porte déjà ce nom.');
    }
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
        aria-labelledby="table-form-title"
      >
        <h2 id="table-form-title">{isEditing ? 'Modifier une table' : 'Ajouter une table'}</h2>
        <p className="category-modal-description">
          {isEditing ? 'Modifiez le nom de cette table.' : 'Donnez un nom à la nouvelle table.'}
        </p>
        <form onSubmit={submit}>
          <label className="category-modal-label" htmlFor="table-name">
            Nom de la table
          </label>
          <input
            id="table-name"
            autoFocus
            required
            value={name}
            placeholder="Ex : Table 4"
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
          />
          {error && <p className="category-modal-error" role="alert">{error}</p>}
          <div className="category-modal-actions">
            <Button
              className="category-modal-cancel"
              label="Annuler"
              onClick={onCancel}
            />
            <Button
              type="submit"
              className="category-modal-save"
              label="Enregistrer"
            />
          </div>
        </form>
      </section>
    </div>
  );
}
