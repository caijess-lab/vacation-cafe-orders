import type { MenuItem } from '../types';
import { Pencil, Plus, X } from 'lucide-react';
import MenuItemRow from './MenuItem';
import Button from './common/Button';

interface Props {
  name: string;
  items: MenuItem[];
  layout?: 'grid' | 'row';
  managementOnly?: boolean;
  hideItemUtilities?: boolean;
  hideCategoryUtilities?: boolean;
  categorySummary?: { quantity: number; readyQuantity: number };
  itemOrderSummaries?: Record<string, { quantity: number; readyQuantity: number }>;
  onMarkReady?: (id: string) => void;
  onUndoReady?: (id: string) => void;
  onAddItem?: (category: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onUpdateItem: (id: string, changes: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
}

export default function CategorySection({
  name,
  items,
  layout = 'grid',
  managementOnly = false,
  hideItemUtilities = false,
  hideCategoryUtilities = false,
  categorySummary,
  itemOrderSummaries,
  onMarkReady,
  onUndoReady,
  onAddItem,
  onRename,
  onDelete,
  onUpdateItem,
  onDeleteItem,
}: Props) {
  return (
    <section className={`category-section${managementOnly ? ' category-section-management' : ''}`}>
      <div className="category-heading">
        <div className="category-heading-info">
          <h2>{name}</h2>
          <span
            className={managementOnly || hideCategoryUtilities ? 'category-count-badge' : undefined}
            aria-label={
              managementOnly
                ? `${items.length} plats`
                : categorySummary
                  ? categorySummary.quantity === 0
                    ? 'Aucune commande'
                    : `${categorySummary.readyQuantity} sur ${categorySummary.quantity} articles prêts`
                  : undefined
            }
          >
            {managementOnly
              ? items.length
              : categorySummary
                ? categorySummary.quantity === 0
                  ? '0 commandé'
                  : `${categorySummary.readyQuantity}/${categorySummary.quantity}`
                : `${items.length} ${items.length === 1 ? 'plat' : 'plats'}`}
          </span>
        </div>
        {onAddItem ? (
          <div className="category-heading-actions">
            <Button
              className="icon-button category-add-item-button"
              ariaLabel={`Ajouter un plat à ${name}`}
              title={`Ajouter un plat à ${name}`}
              icon={Plus}
              iconSize={17}
              onClick={() => onAddItem(name)}
            />
          </div>
        ) : !managementOnly && !hideCategoryUtilities ? (
          <div className="category-heading-actions">
            <Button
              className="icon-button"
              ariaLabel={`Renommer ${name}`}
              title="Renommer la catégorie"
              icon={Pencil}
              iconSize={17}
              onClick={() => {
                const newName = prompt('Renommer la catégorie', name);
                if (newName?.trim()) onRename(name, newName.trim());
              }}
            />
            <Button
              className="icon-button icon-button-danger"
              ariaLabel={`Supprimer ${name}`}
              title="Supprimer la catégorie"
              icon={X}
              iconSize={17}
              onClick={() => {
                if (confirm(`Supprimer « ${name} » et ses articles ?`)) onDelete(name);
              }}
            />
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="category-empty">Aucun article pour le moment.</p>
      ) : (
        <div
          className={[
            layout === 'row' ? 'menu-item-row' : 'menu-item-grid',
            managementOnly && layout === 'row' ? 'is-management-list' : '',
          ].filter(Boolean).join(' ')}
          aria-label={layout === 'row' ? `Plats de ${name}` : undefined}
        >
          {items.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              managementOnly={managementOnly}
              hideUtilities={hideItemUtilities}
              orderSummary={
                managementOnly
                  ? undefined
                  : itemOrderSummaries?.[item.id] ?? { quantity: 0, readyQuantity: 0 }
              }
              onMarkReady={onMarkReady}
              onUndoReady={onUndoReady}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      )}
    </section>
  );
}