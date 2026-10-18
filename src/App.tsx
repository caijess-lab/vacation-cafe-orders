import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react';
import { Check, Clock3, Download, Pencil, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { DEFAULT_DATA, INITIAL_RESTAURANT_DATA, RESTAURANT_STORAGE_KEY, STORAGE_KEY } from './constants';
import type { AppData, MenuItem, RestaurantData, TableOrderItem } from './types';
import { useLocalStorage } from './hooks/useLocaleStorage';
import Header from './components/Header';
import AddCategoryForm from './components/AddCategoryForm';
import AddItemForm from './components/AddItemForm';
import Button from './components/common/Button';
import TableForm from './components/TableForm';
import TableOrderForm from './components/TableOrderForm';
import CategorySection from './components/CategorySection';
import CategoryManagement from './components/CategoryManagement';
import FooterNav from './components/FooterNav';

type PageKey = 'home' | 'categories' | 'dishes' | 'tables';

interface CatalogBackup {
  version: 1;
  categories: string[];
  items: MenuItem[];
}

function isCatalogBackup(value: unknown): value is CatalogBackup {
  if (typeof value !== 'object' || value === null) return false;
  const backup = value as Partial<CatalogBackup>;
  if (
    backup.version !== 1 ||
    !Array.isArray(backup.categories) ||
    !Array.isArray(backup.items) ||
    !backup.categories.every((category) => typeof category === 'string' && category.trim() !== '')
  ) {
    return false;
  }

  const categoryNames = new Set(backup.categories.map((category) => category.toLowerCase()));
  const itemIds = new Set<string>();
  return backup.items.every((item) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'string' ||
      item.id.trim() === '' ||
      typeof item.name !== 'string' ||
      item.name.trim() === '' ||
      typeof item.category !== 'string' ||
      !categoryNames.has(item.category.toLowerCase()) ||
      itemIds.has(item.id)
    ) {
      return false;
    }
    itemIds.add(item.id);
    return true;
  });
}

export default function App() {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, DEFAULT_DATA);
  const [restaurant, setRestaurant] = useLocalStorage<RestaurantData>(
    RESTAURANT_STORAGE_KEY,
    INITIAL_RESTAURANT_DATA,
  );
  const { categories, items } = data;
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [itemFormCategory, setItemFormCategory] = useState<string | undefined>();
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<{
    name: string;
    offset: number;
  } | null>(null);
  const [isTableFormOpen, setIsTableFormOpen] = useState(false);
  const [tableBeingEdited, setTableBeingEdited] = useState<string | null>(null);
  const [orderTableEditor, setOrderTableEditor] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState('');
  const backupInputRef = useRef<HTMLInputElement>(null);

  const itemOrderSummaries = useMemo(() => {
    const summaries: Record<string, { quantity: number; readyQuantity: number }> = {};
    restaurant.orders.forEach((order) => {
      order.items.forEach((orderItem) => {
        const summary = summaries[orderItem.id] ?? { quantity: 0, readyQuantity: 0 };
        summary.quantity += orderItem.quantity;
        summary.readyQuantity += orderItem.readyQuantity;
        summaries[orderItem.id] = summary;
      });
    });
    return summaries;
  }, [restaurant.orders]);

  const total = useMemo(
    () => restaurant.orders.reduce(
      (sum, order) => sum + order.items.reduce(
        (orderSum, item) => orderSum + item.quantity - item.readyQuantity,
        0,
      ),
      0,
    ),
    [restaurant.orders],
  );

  const exportCatalog = () => {
    const backup: CatalogBackup = { version: 1, categories, items };
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vacation-cafe-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage('Sauvegarde téléchargée.');
  };

  const importCatalog = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    void file.text().then((contents) => {
      const parsed: unknown = JSON.parse(contents);
      if (!isCatalogBackup(parsed)) {
        setBackupMessage('Fichier invalide : aucune donnée n’a été modifiée.');
        return;
      }
      if (!confirm('Remplacer les catégories et les plats actuels par ceux de cette sauvegarde ?')) {
        return;
      }
      setData({ categories: parsed.categories, items: parsed.items });
      setBackupMessage('Catégories et plats restaurés.');
    }).catch(() => {
      setBackupMessage('Impossible de lire ce fichier JSON. Aucune donnée n’a été modifiée.');
    });
  };

  const addCategory = (name: string) => {
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) return false;
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, name],
    }));
    setIsCategoryFormOpen(false);
    return true;
  };

  const renameCategory = (oldName: string, newName: string) => {
    if (
      oldName !== newName &&
      categories.some((category) => category.toLowerCase() === newName.toLowerCase())
    ) {
      return false;
    }

    setData((prev) => ({
      categories: prev.categories.map((c) => (c === oldName ? newName : c)),
      items: prev.items.map((item) =>
        item.category === oldName ? { ...item, category: newName } : item,
      ),
    }));
    return true;
  };

  const deleteCategory = (name: string) => {
    const deletedItemIds = new Set(
      items.filter((item) => item.category === name).map((item) => item.id),
    );
    setData((prev) => ({
      categories: prev.categories.filter((c) => c !== name),
      items: prev.items.filter((item) => item.category !== name),
    }));
    setRestaurant((prev) => ({
      ...prev,
      orders: prev.orders
        .map((order) => ({
          ...order,
          items: order.items.filter((item) => !deletedItemIds.has(item.id)),
        }))
        .filter((order) => order.items.length > 0),
    }));
  };

  const startCategoryDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    name: string,
  ) => {
    event.preventDefault();
    const startY = event.clientY;
    let currentY = startY;

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      currentY = pointerEvent.clientY;
      setDraggedCategory({ name, offset: currentY - startY });

      if (currentY < 56) window.scrollBy(0, -12);
      else if (currentY > window.innerHeight - 56) window.scrollBy(0, 12);
    };

    const finishDrag = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
      setDraggedCategory(null);

      if (Math.abs(currentY - startY) < 8) return;

      const categoryElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-category-management-row]'),
      ).filter((element) => element.dataset.categoryName !== name);
      const destination = categoryElements.filter((element) => {
        const bounds = element.getBoundingClientRect();
        return currentY > bounds.top + bounds.height / 2;
      }).length;

      setData((prev) => {
        const reordered = [...prev.categories];
        const source = reordered.indexOf(name);
        if (source === -1) return prev;
        const [category] = reordered.splice(source, 1);
        reordered.splice(destination, 0, category);
        return { ...prev, categories: reordered };
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
  };

  const addItem = (name: string, category: string) => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      name,
      category,
    };

    setData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const openAddItemForm = (category?: string) => {
    setItemFormCategory(category);
    setIsItemFormOpen(true);
  };

  const updateItem = (id: string, changes: Partial<MenuItem>) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    }));
  };

  const deleteItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    setRestaurant((prev) => ({
      ...prev,
      orders: prev.orders
        .map((order) => ({
          ...order,
          items: order.items.filter((item) => item.id !== id),
        }))
        .filter((order) => order.items.length > 0),
    }));
  };

  const resetOrder = () => {
    if (restaurant.orders.length > 0 && confirm('Effacer toutes les commandes des tables ?')) {
      setRestaurant((prev) => ({ ...prev, orders: [] }));
    }
  };

  const resetTableOrder = (table: string) => {
    if (
      restaurant.orders.some((order) => order.table === table) &&
      confirm(`Effacer la commande de ${table} ?`)
    ) {
      setRestaurant((prev) => ({
        ...prev,
        orders: prev.orders.filter((order) => order.table !== table),
      }));
    }
  };

  const markNextReady = (menuItemId: string) => {
    setRestaurant((prev) => {
      let marked = false;
      const orders = prev.orders.map((order) => ({
        ...order,
        items: order.items.map((item) => {
          if (!marked && item.id === menuItemId && item.readyQuantity < item.quantity) {
            marked = true;
            return { ...item, readyQuantity: item.readyQuantity + 1 };
          }
          return item;
        }),
      }));
      return marked ? { ...prev, orders } : prev;
    });
  };

  const undoNextReady = (menuItemId: string) => {
    setRestaurant((prev) => {
      let undone = false;
      const orders = prev.orders.map((order) => ({
        ...order,
        items: order.items.map((item) => {
          if (!undone && item.id === menuItemId && item.readyQuantity > 0) {
            undone = true;
            return { ...item, readyQuantity: item.readyQuantity - 1 };
          }
          return item;
        }),
      }));
      return undone ? { ...prev, orders } : prev;
    });
  };

  const saveTableOrder = (table: string, orderItems: TableOrderItem[]) => {
    const itemsToSave = orderItems.filter((item) => item.quantity > 0);
    setRestaurant((prev) => ({
      ...prev,
      orders: [
        ...prev.orders.filter((order) => order.table !== table),
        ...(itemsToSave.length > 0 ? [{ table, items: itemsToSave }] : []),
      ],
    }));
    setOrderTableEditor(null);
  };

  const addTable = (name: string) => {
    const cleanedName = name.trim();
    if (!cleanedName || restaurant.tables.some((table) => table.toLowerCase() === cleanedName.toLowerCase())) return false;
    setRestaurant((prev) => ({ ...prev, tables: [...prev.tables, cleanedName] }));
    setIsTableFormOpen(false);
    return true;
  };

  const renameTable = (oldName: string, newName: string) => {
    const cleanedName = newName.trim();
    if (
      !cleanedName ||
      (oldName !== cleanedName &&
        restaurant.tables.some((table) => (
          table !== oldName && table.toLowerCase() === cleanedName.toLowerCase()
        )))
    ) {
      return false;
    }
    setRestaurant((prev) => ({
      tables: prev.tables.map((table) => table === oldName ? cleanedName : table),
      orders: prev.orders.map((order) => (
        order.table === oldName ? { ...order, table: cleanedName } : order
      )),
    }));
    setTableBeingEdited(null);
    setIsTableFormOpen(false);
    return true;
  };

  const removeTable = (name: string) => {
    setRestaurant((prev) => ({
      tables: prev.tables.filter((table) => table !== name),
      orders: prev.orders.filter((order) => order.table !== name),
    }));
  };

  const renderHomePage = () => (
    <>
      <div className="page-heading kitchen-heading">
        <div>
          <h2>À préparer</h2>
        </div>
        <div className="kitchen-heading-actions">
          <span className="kitchen-pending-total">{total} à préparer</span>
          <button
            type="button"
            className="kitchen-reset-button"
            aria-label="Réinitialiser toutes les commandes"
            title="Réinitialiser toutes les commandes"
            disabled={restaurant.orders.length === 0}
            onClick={resetOrder}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        const categorySummary = categoryItems.reduce(
          (summary, item) => {
            const itemSummary = itemOrderSummaries[item.id];
            return {
              quantity: summary.quantity + (itemSummary?.quantity ?? 0),
              readyQuantity: summary.readyQuantity + (itemSummary?.readyQuantity ?? 0),
            };
          },
          { quantity: 0, readyQuantity: 0 },
        );

        return (
          <CategorySection
            key={category}
            name={category}
            items={categoryItems}
            hideCategoryUtilities
            hideItemUtilities
            categorySummary={categorySummary}
            itemOrderSummaries={itemOrderSummaries}
            onMarkReady={markNextReady}
            onUndoReady={undoNextReady}
            onRename={renameCategory}
            onDelete={deleteCategory}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
          />
        );
      })}
    </>
  );

  const renderCategoriesPage = () => (
    <>
      <div className="page-heading">
        <h2>Catégories</h2>
        <button
          type="button"
          className="page-add-button"
          onClick={() => setIsCategoryFormOpen(true)}
        >
          <Plus size={18} aria-hidden="true" />
          Ajouter une catégorie
        </button>
      </div>
      <div className="catalog-backup">
        <button type="button" className="catalog-backup-button" onClick={exportCatalog}>
          <Download size={16} aria-hidden="true" />
          Sauvegarder catégories et plats
        </button>
        <button
          type="button"
          className="catalog-backup-button"
          onClick={() => backupInputRef.current?.click()}
        >
          <Upload size={16} aria-hidden="true" />
          Restaurer depuis un fichier
        </button>
        <input
          ref={backupInputRef}
          type="file"
          accept="application/json,.json"
          className="catalog-backup-input"
          aria-label="Choisir un fichier de sauvegarde JSON"
          onChange={importCatalog}
        />
        {backupMessage && <p className="catalog-backup-message" role="status">{backupMessage}</p>}
      </div>
      <CategoryManagement
        categories={categories}
        onRename={renameCategory}
        onDelete={deleteCategory}
        onDragStart={startCategoryDrag}
        draggedCategory={draggedCategory}
      />
      {isCategoryFormOpen && (
        <AddCategoryForm
          onAdd={addCategory}
          onCancel={() => setIsCategoryFormOpen(false)}
        />
      )}
    </>
  );

  const renderDishesPage = () => (
    <div className="space-y-4">
      <div className="page-heading">
        <h2>Plats</h2>
        <button
          type="button"
          className="page-add-button"
          onClick={() => openAddItemForm()}
        >
          <Plus size={18} aria-hidden="true" />
          Ajouter un plat
        </button>
      </div>
      {isItemFormOpen && (
        <AddItemForm
          categories={categories}
          initialCategory={itemFormCategory}
          onAdd={addItem}
          onCancel={() => setIsItemFormOpen(false)}
        />
      )}

      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);

        return (
          <CategorySection
            key={category}
            name={category}
            items={categoryItems}
            layout="row"
            managementOnly
            onAddItem={openAddItemForm}
            onRename={renameCategory}
            onDelete={deleteCategory}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
          />
        );
      })}
    </div>
  );

  const renderTablesPage = () => (
    <section aria-label="Tables">
      <div className="page-heading">
        <h2>Tables</h2>
        <button
          type="button"
          className="page-add-button"
          onClick={() => {
            setTableBeingEdited(null);
            setIsTableFormOpen(true);
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Ajouter une table
        </button>
      </div>

      <p className="table-status-hint">Touchez une carte pour ajouter ou modifier sa commande.</p>

      <div className="table-card-list">
        {restaurant.tables.length === 0 ? (
          <p className="table-card-empty">Aucune table pour le moment.</p>
        ) : restaurant.tables.map((table) => {
          const order = restaurant.orders.find((tableOrder) => tableOrder.table === table);
          const orderItems = order?.items ?? [];
          const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
          const readyItems = orderItems.reduce((sum, item) => sum + item.readyQuantity, 0);
          const status = totalItems === 0
            ? 'Aucune commande'
            : readyItems === 0
              ? 'En attente'
              : readyItems === totalItems
                ? 'Prête'
                : 'En préparation';
          const statusClass = totalItems === 0
            ? ''
            : readyItems === 0
              ? 'is-pending'
              : readyItems === totalItems
                ? 'is-ready'
                : 'is-preparing';

          return (
            <article className="table-card" key={table}>
              <header className="table-card-header">
                <h3>{table}</h3>
                <div className="table-card-actions">
                  <button
                    type="button"
                    className="category-management-action"
                    aria-label={`Modifier ${table}`}
                    title="Modifier la table"
                    onClick={() => {
                      setTableBeingEdited(table);
                      setIsTableFormOpen(true);
                    }}
                  >
                    <Pencil size={17} aria-hidden="true" />
                  </button>
                  <Button
                    className="category-management-action"
                    ariaLabel={`Réinitialiser la commande de ${table}`}
                    title="Réinitialiser la commande"
                    disabled={!order}
                    icon={RotateCcw}
                    iconSize={17}
                    onClick={() => resetTableOrder(table)}
                  />
                  <button
                    type="button"
                    className="category-management-action category-management-delete"
                    aria-label={`Supprimer ${table}`}
                    title="Supprimer la table"
                    onClick={() => {
                      if (confirm(`Supprimer ${table} et ses commandes ?`)) removeTable(table);
                    }}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </header>
              <button
                type="button"
                className="table-order-open"
                aria-label={`${order ? 'Modifier la commande' : 'Ajouter une commande'} pour ${table}`}
                onClick={() => setOrderTableEditor(table)}
              >
                <span className="table-order-open-heading">
                  <strong className={`table-order-status ${statusClass}`}>{status}</strong>
                  {totalItems > 0 && (
                    <span className="table-order-progress">{readyItems} / {totalItems} prêts</span>
                  )}
                </span>
                {orderItems.length > 0 ? (
                  <span className="table-order-products">
                    {orderItems.map((orderItem) => {
                      const menuItem = items.find((item) => item.id === orderItem.id);
                      const name = menuItem?.name ?? orderItem.name;
                      const isPrepared = orderItem.readyQuantity === orderItem.quantity;
                      const isInProgress = orderItem.readyQuantity > 0 && !isPrepared;

                      return (
                        <span className="table-order-product" key={orderItem.id}>
                          {isPrepared ? (
                            <Check
                              className="table-order-product-status is-prepared"
                              size={16}
                              aria-label="Tous les articles préparés"
                            />
                          ) : isInProgress ? (
                            <Clock3
                              className="table-order-product-status is-progress"
                              size={16}
                              aria-label="Partiellement préparé"
                            />
                          ) : (
                            <X
                              className="table-order-product-status is-pending"
                              size={16}
                              aria-label="Pas encore préparé"
                            />
                          )}
                          <span>{orderItem.quantity} × {name}</span>
                          <span className="table-order-product-progress">
                            {orderItem.readyQuantity}/{orderItem.quantity} prêts
                          </span>
                        </span>
                      );
                    })}
                  </span>
                ) : (
                  <span className="table-card-empty">Touchez pour ajouter des plats à cette table.</span>
                )}
              </button>
            </article>
          );
        })}
      </div>

      {isTableFormOpen && (
        <TableForm
          initialName={tableBeingEdited ?? ''}
          onSave={(name) => tableBeingEdited ? renameTable(tableBeingEdited, name) : addTable(name)}
          onCancel={() => {
            setIsTableFormOpen(false);
            setTableBeingEdited(null);
          }}
        />
      )}

      {orderTableEditor && (
        <TableOrderForm
          table={orderTableEditor}
          categories={categories}
          items={items}
          initialItems={restaurant.orders.find((order) => order.table === orderTableEditor)?.items ?? []}
          onSave={(orderItems) => saveTableOrder(orderTableEditor, orderItems)}
          onCancel={() => setOrderTableEditor(null)}
        />
      )}
    </section>
  );

  const changePage = (page: PageKey) => {
    setIsItemFormOpen(false);
    setIsCategoryFormOpen(false);
    setIsTableFormOpen(false);
    setTableBeingEdited(null);
    setOrderTableEditor(null);
    setActivePage(page);
  };

  return (
    <>
      <Header />

      <main className="app-main">
        {activePage === 'home' && renderHomePage()}
        {activePage === 'categories' && renderCategoriesPage()}
        {activePage === 'dishes' && renderDishesPage()}
        {activePage === 'tables' && renderTablesPage()}
      </main>

      <FooterNav activePage={activePage} onChangePage={changePage} />
    </>
  );
}