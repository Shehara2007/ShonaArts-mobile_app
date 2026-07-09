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
};

// Painting Services
export const paintingService = {
  getAll: async (filters?: PaintingFilters) => {
    console.log('🎨 paintingService.getAll called with filters:', filters);
    try {
      const result = await mockApi.getPaintings(filters);
      console.log('✅ paintingService.getAll success:', result.data?.length, 'paintings');
      return result;
    } catch (error) {
      console.error('❌ paintingService.getAll error:', error);
      throw error;
    }
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

  delete: async (id: string) => {
    return await mockApi.deleteOrder(id);
  },
};

// Custom Order Services
export const customOrderService = {
  create: async (data: Omit<CustomOrder, 'id' | 'customerId' | 'status' | 'createdAt'>) => {
    return {
      success: true,
      data: {
        ...data,
        id: `CO${Date.now()}`,
        customerId: '1',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      } as CustomOrder,
    };
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
