export const API_BASE_URL = 'https://api.shonaarts.com';

export const STORAGE_KEYS = {
  TOKEN: '@shona_arts_token',
  USER: '@shona_arts_user',
  THEME: '@shona_arts_theme',
};

export const CATEGORIES = [
  'Abstract',
  'Landscape',
  'Portrait',
  'Modern',
  'Traditional',
];

export const CANVAS_SIZES = [
  '12x16 inches',
  '16x20 inches',
  '18x24 inches',
  '24x36 inches',
  '30x40 inches',
];

export const PAYMENT_METHODS = [
  { label: 'Cash on Delivery', value: 'cod' },
  { label: 'Mock PayHere', value: 'payhere' },
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;
