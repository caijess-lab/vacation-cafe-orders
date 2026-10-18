import type { AppData, RestaurantData } from './types';

export const STORAGE_KEY = 'vacation-cafe-data-v1';
export const RESTAURANT_STORAGE_KEY = 'vacation-cafe-restaurant-v1';

export const INITIAL_RESTAURANT_DATA: RestaurantData = {
  tables: ['Table 1', 'Table 2', 'Table 3'],
  orders: [],
};

export const DEFAULT_DATA: AppData = {
  categories: [
    'Antipasti',
    'Vins',
    'Pizza',
    'Pâtes',
    'Plats chauds',
    'Desserts',
    'Café',
  ],
  items: [],
};