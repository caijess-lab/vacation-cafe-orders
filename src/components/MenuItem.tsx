import type { MenuItem } from '../types';
import { CakeSlice, Coffee, Pizza, Soup, Utensils, Wine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  item: MenuItem;
  managementOnly?: boolean;
  hideUtilities?: boolean;
  orderSummary?: { quantity: number; readyQuantity: number };
  onMarkReady?: (id: string) => void;
  onUndoReady?: (id: string) => void;
  onUpdate: (id: string, changes: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
}

export default function MenuItemRow({
  item,
  managementOnly = false,
  hideUtilities = false,
  orderSummary,
  onMarkReady,
  onUndoReady,
  onUpdate,
  onDelete,
}: Props) {
  const label = `${item.name} ${item.category}`.toLocaleLowerCase();
  const Icon: LucideIcon = /pizza/.test(label)
    ? Pizza
    : /café|cafe|espresso|latte/.test(label)
      ? Coffee
      : /vin|wine/.test(label)
        ? Wine
        : /dessert|gâteau|gateau|cake|tiramisu/.test(label)
          ? CakeSlice
          : /soupe|pâte|pates|pasta|plat chaud/.test(label)
            ? Soup
            : Utensils;

  return (
    <article
      className={[
        'menu-item-card',
        orderSummary && orderSummary.quantity > 0 && orderSummary.readyQuantity === orderSummary.quantity
          ? 'is-done'
          : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="menu-item-art" aria-hidden="true">
        <Icon size={30} strokeWidth={1.7} />
      </div>

      <div className="menu-item-details">
        <strong className="menu-item-name" title={item.name}>{item.name}</strong>
        {orderSummary && (
          <span className="menu-item-order-summary">
            {orderSummary.quantity === 0
              ? '0 commandé'
              : `${orderSummary.readyQuantity} / ${orderSummary.quantity} prêts`}
          </span>
        )}
        <div className="menu-item-actions">
          {!hideUtilities && (
            <div className="menu-item-utilities">
              <button
                type="button"
                className="icon-button"
                aria-label={`Modifier ${item.name}`}
                title="Modifier"
                onClick={() => {
                  const newName = prompt('Modifier le nom', item.name);
                  if (newName?.trim()) onUpdate(item.id, { name: newName.trim() });
                }}
              >
                ✎
              </button>
              <button
                type="button"
                className="icon-button icon-button-danger"
                aria-label={`Supprimer ${item.name}`}
                title="Supprimer"
                onClick={() => {
                  if (confirm(`Supprimer « ${item.name} » ?`)) onDelete(item.id);
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {!managementOnly && orderSummary && (
        <div className="readiness-actions">
          <button
            type="button"
            className={`done-button${orderSummary.quantity > 0 && orderSummary.readyQuantity === orderSummary.quantity ? ' is-done' : ''}`}
            disabled={orderSummary.quantity === orderSummary.readyQuantity}
            aria-label={`Marquer une portion de ${item.name} comme prête`}
            onClick={() => onMarkReady?.(item.id)}
          >
            {orderSummary.quantity === 0
              ? 'Aucune commande'
              : orderSummary.readyQuantity === orderSummary.quantity
                ? 'Tout prêt ✓'
                : 'Marquer 1 prêt'}
          </button>
          {orderSummary.readyQuantity > 0 && (
            <button
              type="button"
              className="undo-ready-button"
              aria-label={`Annuler une portion prête de ${item.name}`}
              onClick={() => onUndoReady?.(item.id)}
            >
              Annuler 1 prêt
            </button>
          )}
        </div>
      )}

    </article>
  );
}