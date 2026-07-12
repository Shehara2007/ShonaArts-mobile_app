import { mockApi } from './mockApi';
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Painting,
  Order,
  CartItem,
  WishlistItem,
  CustomOrder,
  DashboardStats,
  PaintingFilters,
} from '../types';

// Auth Services
export const authService = {
  login: async (credentials: LoginCredentials) => {
    return await mockApi.login(credentials);
  },

  register: async (data: RegisterData) => {
    return await mockApi.register(data);
  },

  getProfile: async () => {
    return await mockApi.getProfile();
  },

  updateProfile: async (data: Partial<User>) => {
    return await mockApi.updateProfile(data);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return await mockApi.changePassword(currentPassword, newPassword);
  },

  deleteAccount: async () => {
    return await mockApi.deleteAccount();
  },
};

// Painting Services
export const paintingService = {
  getAll: async (filters?: PaintingFilters) => {
    return await mockApi.getPaintings(filters);
  },

  getById: async (id: string) => {
    return await mockApi.getPaintingById(id);
  },

  create: async (data: Omit<Painting, 'id'>) => {
    return await mockApi.createPainting(data);
  },

  update: async (id: string, data: Partial<Painting>) => {
    return await mockApi.updatePainting(id, data);
  },

  delete: async (id: string) => {
    return await mockApi.deletePainting(id);
  },
};

// Wishlist Services
export const wishlistService = {
  getAll: async () => {
    return await mockApi.getWishlist();
  },

  add: async (paintingId: string) => {
    return await mockApi.addToWishlist(paintingId);
  },

  remove: async (id: string) => {
    return await mockApi.removeFromWishlist(id);
  },
};

// Cart Services
export const cartService = {
  getAll: async () => {
    return await mockApi.getCart();
  },

  add: async (paintingId: string, quantity: number) => {
    return await mockApi.addToCart(paintingId, quantity);
  },

  updateQuantity: async (id: string, quantity: number) => {
    return await mockApi.updateCartQuantity(id, quantity);
  },

  remove: async (id: string) => {
    return await mockApi.removeFromCart(id);
  },
};

// Order Services
export const orderService = {
  getAll: async () => {
    return await mockApi.getOrders();
  },

  getAllForAdmin: async () => {
    return await mockApi.getAllOrders();
  },

  create: async (orderData: Omit<Order, 'id' | 'userId' | 'date' | 'status'>) => {
    return await mockApi.createOrder(orderData);
  },

  updateStatus: async (id: string, status: Order['status']) => {
    return await mockApi.updateOrderStatus(id, status);
  },

  cancel: async (id: string, reason?: string) => {
    return await mockApi.cancelOrder(id, reason);
  },

  delete: async (id: string) => {
    return await mockApi.deleteOrder(id);
  },
};

// Custom Order Services
export const customOrderService = {
  getMine: async () => {
    return await mockApi.getMyCustomOrders();
  },

  create: async (data: Omit<CustomOrder, 'id' | 'customerId' | 'status' | 'createdAt'>) => {
    return await mockApi.createCustomOrder(data);
  },

  cancel: async (id: string) => {
    return await mockApi.cancelCustomOrder(id);
  },
};

// Review Services
export const reviewService = {
  getForPainting: async (paintingId: string) => {
    return await mockApi.getReviews(paintingId);
  },

  add: async (paintingId: string, rating: number, comment: string) => {
    return await mockApi.addReview(paintingId, rating, comment);
  },

  update: async (id: string, data: { rating?: number; comment?: string }) => {
    return await mockApi.updateReview(id, data);
  },

  delete: async (id: string) => {
    return await mockApi.deleteReview(id);
  },
};

// Notification Services
export const notificationService = {
  getAll: async () => {
    return await mockApi.getNotifications();
  },

  markAsRead: async (id: string) => {
    return await mockApi.markNotificationRead(id);
  },

  markAllAsRead: async () => {
    return await mockApi.markAllNotificationsRead();
  },

  delete: async (id: string) => {
    return await mockApi.deleteNotification(id);
  },
};

// User Management Services (Admin)
export const userService = {
  getAll: async () => {
    return await mockApi.getUsers();
  },

  update: async (id: string, data: Partial<User>) => {
    return await mockApi.updateUser(id, data);
  },

  delete: async (id: string) => {
    return await mockApi.deleteUser(id);
  },
};

// Dashboard Services (Admin)
export const dashboardService = {
  getStats: async () => {
    return await mockApi.getDashboardStats();
  },
};
