export interface MenuItem {
  id: string;
  name: string;
  category: string;
}

export interface AppData {
  categories: string[];
  items: MenuItem[];
}

export interface TableOrderItem {
  id: string;
  name: string;
  quantity: number;
  readyQuantity: number;
}

export interface TableOrder {
  table: string;
  items: TableOrderItem[];
}

export interface RestaurantData {
  tables: string[];
  orders: TableOrder[];
}
