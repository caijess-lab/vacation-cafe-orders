import type { MenuItem } from '../types';
import { CakeSlice, Coffee, Pencil, Pizza, Soup, Trash2, Utensils, Wine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from './common/Button';

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
              <Button
                className="icon-button"
                ariaLabel={`Modifier ${item.name}`}
                title="Modifier"
                icon={Pencil}
                iconSize={17}
                onClick={() => {
                  const newName = prompt('Modifier le nom', item.name);
                  if (newName?.trim()) onUpdate(item.id, { name: newName.trim() });
                }}
              />
              <Button
                className="icon-button icon-button-danger"
                ariaLabel={`Supprimer ${item.name}`}
                title="Supprimer"
                icon={Trash2}
                iconSize={17}
                onClick={() => {
                  if (confirm(`Supprimer « ${item.name} » ?`)) onDelete(item.id);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {!managementOnly && orderSummary && (
        <div className="readiness-actions">
          <Button
            className={`done-button${orderSummary.quantity > 0 && orderSummary.readyQuantity === orderSummary.quantity ? ' is-done' : ''}`}
            disabled={orderSummary.quantity === orderSummary.readyQuantity}
            ariaLabel={`Marquer une portion de ${item.name} comme prête`}
            label={orderSummary.quantity === 0
              ? 'Aucune commande'
              : orderSummary.readyQuantity === orderSummary.quantity
                ? 'Tout prêt ✓'
                : 'Marquer 1 prêt'}
            onClick={() => onMarkReady?.(item.id)}
          />
          {orderSummary.readyQuantity > 0 && (
            <Button
              className="undo-ready-button"
              ariaLabel={`Annuler une portion prête de ${item.name}`}
              label="Annuler 1 prêt"
              onClick={() => onUndoReady?.(item.id)}
            />
          )}
        </div>
      )}

    </article>
  );
}