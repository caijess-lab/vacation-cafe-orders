import { useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ChevronRight, Minus, Plus, Tags } from 'lucide-react';
import type { MenuItem, TableOrderItem } from '../types';
import Button from './common/Button';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const total = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const availableCategories = categories
    .map((category) => ({
      name: category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((category) => category.items.length > 0);
  const selectedCategoryItems = items.filter((item) => item.category === selectedCategory);

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
        <div className="table-order-editor-heading">
          <h2 id="table-order-title">Commande · {table}</h2>
          {selectedCategory && (
            <button
              type="button"
              className="table-order-back"
              onClick={() => setSelectedCategory(null)}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Catégories
            </button>
          )}
        </div>
        <p className="category-modal-description">
          {selectedCategory
            ? `${selectedCategory} · choisissez les plats et les quantités.`
            : 'Choisissez une catégorie.'}{' '}
          {total} {total === 1 ? 'article' : 'articles'}.
        </p>

        <div className="table-order-editor-categories">
          {selectedCategory ? (
            selectedCategoryItems.length > 0 ? (
              <ul className="table-order-dish-list">
                {selectedCategoryItems.map((menuItem) => {
                  const quantity = orderItems.find((item) => item.id === menuItem.id)?.quantity ?? 0;

                  return (
                    <li className="table-order-editor-item" key={menuItem.id}>
                      <span className="table-order-dish-name">{menuItem.name}</span>
                      <div
                        className="quantity-control"
                        aria-label={`Quantité de ${menuItem.name} : ${quantity}`}
                      >
                        <Button
                          className="quantity-control-button"
                          icon={Minus}
                          iconSize={15}
                          ariaLabel={`Retirer une ${menuItem.name}`}
                          disabled={quantity === 0}
                          onClick={() => updateQuantity(menuItem, -1)}
                        />
                        <span>{quantity}</span>
                        <Button
                          className="quantity-control-button"
                          icon={Plus}
                          iconSize={15}
                          ariaLabel={`Ajouter une ${menuItem.name}`}
                          onClick={() => updateQuantity(menuItem, 1)}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="table-card-empty">Aucun plat dans cette catégorie.</p>
            )
          ) : availableCategories.length > 0 ? (
            <div className="table-order-category-grid">
              {availableCategories.map(({ name, items: categoryItems }) => {
                const orderedQuantity = categoryItems.reduce(
                  (sum, menuItem) => (
                    sum + (orderItems.find((item) => item.id === menuItem.id)?.quantity ?? 0)
                  ),
                  0,
                );

                return (
                  <button
                    type="button"
                    className="table-order-category-card"
                    key={name}
                    onClick={() => setSelectedCategory(name)}
                    aria-label={`${name}, ${categoryItems.length} plats`}
                  >
                    <span className="table-order-category-icon" aria-hidden="true">
                      <Tags size={25} strokeWidth={1.8} />
                    </span>
                    <strong>{name}</strong>
                    <span className="table-order-category-count">
                      {orderedQuantity > 0
                        ? `${orderedQuantity} commandé${orderedQuantity > 1 ? 's' : ''}`
                        : `${categoryItems.length} ${categoryItems.length === 1 ? 'plat' : 'plats'}`}
                    </span>
                    <ChevronRight className="table-order-category-arrow" size={16} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="table-card-empty">Ajoutez d’abord des plats dans l’onglet Plats.</p>
          )}
        </div>

        <div className="category-modal-actions">
          <Button
            className="table-order-clear"
            label="Tout effacer"
            disabled={total === 0}
            onClick={clearOrder}
          />
          <Button
            className="category-modal-cancel"
            label="Annuler"
            onClick={onCancel}
          />
          <Button
            className="category-modal-save"
            label="Enregistrer la commande"
            onClick={() => onSave(orderItems)}
          />
        </div>
      </section>
    </div>
  );
}
