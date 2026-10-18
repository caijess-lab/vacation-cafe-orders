import { useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, GripVertical, Pencil, Trash2, X } from 'lucide-react';

interface Props {
  categories: string[];
  onRename: (oldName: string, newName: string) => boolean;
  onDelete: (name: string) => void;
  onDragStart: (event: ReactPointerEvent<HTMLButtonElement>, name: string) => void;
  draggedCategory: { name: string; offset: number } | null;
}

export default function CategoryManagement({
  categories,
  onRename,
  onDelete,
  onDragStart,
  draggedCategory,
}: Props) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [error, setError] = useState('');

  const beginEdit = (name: string) => {
    setEditingCategory(name);
    setEditedName(name);
    setError('');
  };

  const saveEdit = (event: FormEvent<HTMLFormElement>, oldName: string) => {
    event.preventDefault();
    const newName = editedName.trim();
    if (!newName) {
      setError('Le nom de la catégorie est obligatoire.');
      return;
    }
    if (!onRename(oldName, newName)) {
      setError('Cette catégorie existe déjà.');
      return;
    }
    setEditingCategory(null);
    setError('');
  };

  if (categories.length === 0) {
    return <p className="category-management-empty">Aucune catégorie pour le moment.</p>;
  }

  return (
    <section className="category-management-list" aria-label="Gestion des catégories">
      {categories.map((category) => {
        const isEditing = editingCategory === category;
        const offset = draggedCategory?.name === category ? draggedCategory.offset : 0;

        return (
          <div
            key={category}
            className={`category-management-row${offset !== 0 ? ' is-dragging' : ''}`}
            data-category-management-row
            data-category-name={category}
            style={offset !== 0 ? { transform: `translateY(${offset}px)` } : undefined}
          >
            <button
              type="button"
              className="category-management-drag"
              aria-label={`Déplacer la catégorie ${category}`}
              title="Glisser pour réorganiser"
              onPointerDown={(event) => onDragStart(event, category)}
            >
              <GripVertical size={19} aria-hidden="true" />
            </button>

            {isEditing ? (
              <form className="category-management-edit" onSubmit={(event) => saveEdit(event, category)}>
                <div className="category-management-input-wrap">
                  <input
                    autoFocus
                    aria-label={`Nom de la catégorie ${category}`}
                    value={editedName}
                    onChange={(event) => {
                      setEditedName(event.target.value);
                      setError('');
                    }}
                  />
                  {error && <span className="category-management-error" role="alert">{error}</span>}
                </div>
                <button
                  type="submit"
                  className="category-management-action category-management-save"
                  aria-label={`Enregistrer ${category}`}
                  title="Enregistrer"
                >
                  <Check size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="category-management-action"
                  aria-label="Annuler la modification"
                  title="Annuler"
                  onClick={() => setEditingCategory(null)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </form>
            ) : (
              <>
                <span className="category-management-name">{category}</span>
                <button
                  type="button"
                  className="category-management-action"
                  aria-label={`Modifier ${category}`}
                  title="Modifier la catégorie"
                  onClick={() => beginEdit(category)}
                >
                  <Pencil size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="category-management-action category-management-delete"
                  aria-label={`Supprimer ${category}`}
                  title="Supprimer la catégorie"
                  onClick={() => {
                    if (confirm(`Supprimer « ${category} » et ses articles ?`)) onDelete(category);
                  }}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
