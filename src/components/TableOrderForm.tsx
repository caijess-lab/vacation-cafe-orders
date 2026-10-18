import { useState, type KeyboardEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { MenuItem, TableOrderItem } from '../types';

interface Props {
  table: string;
  categories: string[];
  items: MenuItem[];
  initialItems: TableOrderItem[];
  onSave: (items: TableOrderItem[]) => void;
  onCancel: () => void;
}

export default function TableOrderForm({
  table,
  categories,
  items,
  initialItems,
  onSave,
  onCancel,
}: Props) {
  const [orderItems, setOrderItems] = useState(initialItems);
  const total = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (menuItem: MenuItem, change: number) => {
    setOrderItems((current) => {
      const existing = current.find((item) => item.id === menuItem.id);
      if (!existing && change < 0) return current;
      if (!existing) {
        return [
          ...current,
          { id: menuItem.id, name: menuItem.name, quantity: 1, readyQuantity: 0 },
        ];
      }

      const quantity = Math.max(0, existing.quantity + change);
      return current.map((item) =>
        item.id === menuItem.id
          ? {
              ...item,
              name: menuItem.name,
              quantity,
              readyQuantity: Math.min(item.readyQuantity, quantity),
            }
          : item,
      );
    });
  };

  const clearOrder = () => {
    setOrderItems([]);
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
        className="category-modal table-order-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-order-title"
      >
        <h2 id="table-order-title">Commande · {table}</h2>
        <p className="category-modal-description">
          Choisissez les plats et les quantités. {total} {total === 1 ? 'article' : 'articles'}.
        </p>

        <div className="table-order-editor-categories">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <section className="table-order-editor-category" key={category}>
                <h3>{category}</h3>
                <ul>
                  {categoryItems.map((menuItem) => {
                    const quantity = orderItems.find((item) => item.id === menuItem.id)?.quantity ?? 0;

                    return (
                      <li className="table-order-editor-item" key={menuItem.id}>
                        <span>{menuItem.name}</span>
                        <div className="quantity-control" aria-label={`Quantité de ${menuItem.name} : ${quantity}`}>
                          <button
                            type="button"
                            aria-label={`Retirer une ${menuItem.name}`}
                            disabled={quantity === 0}
                            onClick={() => updateQuantity(menuItem, -1)}
                          >
                            <Minus size={15} aria-hidden="true" />
                          </button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            aria-label={`Ajouter une ${menuItem.name}`}
                            onClick={() => updateQuantity(menuItem, 1)}
                          >
                            <Plus size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {items.length === 0 && (
            <p className="table-card-empty">Ajoutez d’abord des plats dans l’onglet Plats.</p>
          )}
        </div>

        <div className="category-modal-actions">
          <button
            type="button"
            className="table-order-clear"
            disabled={total === 0}
            onClick={clearOrder}
          >
            Tout effacer
          </button>
          <button type="button" className="category-modal-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className="category-modal-save" onClick={() => onSave(orderItems)}>
            Enregistrer la commande
          </button>
        </div>
      </section>
    </div>
  );
}
