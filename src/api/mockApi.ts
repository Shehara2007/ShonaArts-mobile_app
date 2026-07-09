// Simple mock API that works in Expo Go (without MSW)
import { mockUsers, mockPasswords } from '../mock/data/users';
import { mockPaintings } from '../mock/data/paintings';
import { mockOrders } from '../mock/data/orders';
import type {
  LoginCredentials,
  RegisterData,
  User,
  Painting,
  Order,
  CartItem,
  WishlistItem,
  CustomOrder,
  DashboardStats,
  ApiResponse,
} from '../types';

// In-memory storage
let users = [...mockUsers];
let paintings = [...mockPaintings];
let orders = [...mockOrders];
let cart: CartItem[] = [];
let wishlist: WishlistItem[] = [];
let customOrders: CustomOrder[] = [];
let currentUser: User | null = null;
let currentToken: string | null = null;

// Helper to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate token
const generateToken = (userId: string) => {
  return `mock_jwt_token_${userId}_${Date.now()}`;
};

// Helper to verify token
const verifyToken = (token: string | null): User | null => {
  if (!token) return null;
  return currentUser;
};

export const mockApi = {
  // Auth
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log('🔐 mockApi.login called with:', credentials.email);
    await delay();
    const { email, password } = credentials;
    const user = users.find(u => u.email === email);

    console.log('👤 User found:', user ? user.name : 'NOT FOUND');
    console.log('🔑 Password check:', mockPasswords[email] === password);

    if (!user || mockPasswords[email] !== password) {
      console.error('❌ Login failed: Invalid credentials');
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);
    currentUser = user;
    currentToken = token;

    console.log('✅ Login successful for:', user.email, 'Role:', user.role);

    return {
      success: true,
      data: { user, token },
      message: 'Login successful',
    };
  },

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay();
    const { name, email, password, phone, address } = data;

    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      phone,
      address,
      role: 'customer',
    };

    users.push(newUser);
    mockPasswords[email] = password;
    
    const token = generateToken(newUser.id);
    currentUser = newUser;
    currentToken = token;

    return {
      success: true,
      data: { user: newUser, token },
      message: 'Registration successful',
    };
  },

  // Paintings
  async getPaintings(filters?: any): Promise<ApiResponse<Painting[]>> {
    console.log('🖼️ mockApi.getPaintings called with filters:', filters);
    await delay(300);
    let filteredPaintings = [...paintings];
    console.log('📊 Total paintings available:', paintings.length);

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredPaintings = filteredPaintings.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.artist.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
      console.log('🔍 After search filter:', filteredPaintings.length);
    }

    if (filters?.category && filters.category !== 'All') {
      filteredPaintings = filteredPaintings.filter(p => p.category === filters.category);
      console.log('📁 After category filter:', filteredPaintings.length);
    }

    if (filters?.minPrice) {
      filteredPaintings = filteredPaintings.filter(p => p.price >= Number(filters.minPrice));
    }

    if (filters?.maxPrice) {
      filteredPaintings = filteredPaintings.filter(p => p.price <= Number(filters.maxPrice));
    }

    if (filters?.sortBy === 'price-asc') {
      filteredPaintings.sort((a, b) => a.price - b.price);
    } else if (filters?.sortBy === 'price-desc') {
      filteredPaintings.sort((a, b) => b.price - a.price);
    } else if (filters?.sortBy === 'rating') {
      filteredPaintings.sort((a, b) => b.rating - a.rating);
    } else if (filters?.sortBy === 'newest') {
      filteredPaintings.reverse();
    }

    console.log('✅ mockApi.getPaintings returning:', filteredPaintings.length, 'paintings');

    return {
      success: true,
      data: filteredPaintings,
    };
  },

  async getPaintingById(id: string): Promise<ApiResponse<Painting>> {
    await delay(200);
    const painting = paintings.find(p => p.id === id);

    if (!painting) {
      throw new Error('Painting not found');
    }

    return {
      success: true,
      data: painting,
    };
  },

  // Wishlist
  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');
    
    return {
      success: true,
      data: wishlist,
    };
  },

  async addToWishlist(paintingId: string): Promise<ApiResponse<WishlistItem>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const painting = paintings.find(p => p.id === paintingId);
    if (!painting) throw new Error('Painting not found');

    if (wishlist.find(w => w.painting.id === paintingId)) {
      throw new Error('Already in wishlist');
    }

    const wishlistItem: WishlistItem = {
      id: String(wishlist.length + 1),
      painting,
    };

    wishlist.push(wishlistItem);

    return {
      success: true,
      data: wishlistItem,
      message: 'Added to wishlist',
    };
  },

  async removeFromWishlist(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const index = wishlist.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Item not found');

    wishlist.splice(index, 1);

    return {
      success: true,
      data: null,
      message: 'Removed from wishlist',
    };
  },

  // Cart
  async getCart(): Promise<ApiResponse<CartItem[]>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');
    
    return {
      success: true,
      data: cart,
    };
  },

  async addToCart(paintingId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const painting = paintings.find(p => p.id === paintingId);
    if (!painting) throw new Error('Painting not found');

    const existingItem = cart.find(c => c.painting.id === paintingId);

    if (existingItem) {
      existingItem.quantity += quantity;
      return {
        success: true,
        data: existingItem,
        message: 'Cart updated',
      };
    }

    const cartItem: CartItem = {
      id: String(cart.length + 1),
      painting,
      quantity,
    };

    cart.push(cartItem);

    return {
      success: true,
      data: cartItem,
      message: 'Added to cart',
    };
  },

  async updateCartQuantity(id: string, quantity: number): Promise<ApiResponse<CartItem>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const item = cart.find(c => c.id === id);
    if (!item) throw new Error('Item not found');

    item.quantity = quantity;

    return {
      success: true,
      data: item,
      message: 'Cart updated',
    };
  },

  async removeFromCart(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const index = cart.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Item not found');

    cart.splice(index, 1);

    return {
      success: true,
      data: null,
      message: 'Removed from cart',
    };
  },

  // Orders
  async getOrders(): Promise<ApiResponse<Order[]>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    let userOrders = orders;
    if (currentUser.role === 'customer') {
      userOrders = orders.filter(o => o.userId === currentUser!.id);
    }

    return {
      success: true,
      data: userOrders,
    };
  },

  async createOrder(orderData: Omit<Order, 'id' | 'userId' | 'date' | 'status'>): Promise<ApiResponse<Order>> {
    await delay(300);
    if (!currentUser) throw new Error('Unauthorized');

    const newOrder: Order = {
      ...orderData,
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      userId: currentUser.id,
      date: new Date().toISOString(),
      status: 'pending',
    };

    orders.push(newOrder);
    cart = []; // Clear cart

    return {
      success: true,
      data: newOrder,
      message: 'Order placed successfully',
    };
  },

  // Profile
  async getProfile(): Promise<ApiResponse<User>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    return {
      success: true,
      data: currentUser,
    };
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const index = users.findIndex(u => u.id === currentUser!.id);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...data };
    currentUser = users[index];

    return {
      success: true,
      data: currentUser,
      message: 'Profile updated successfully',
    };
  },

  // Admin - Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    await delay(200);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const stats: DashboardStats = {
      totalPaintings: paintings.length,
      totalOrders: orders.length,
      totalUsers: users.filter(u => u.role === 'customer').length,
      revenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0),
    };

    return {
      success: true,
      data: stats,
    };
  },

  // Admin - Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    await delay(200);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    return {
      success: true,
      data: users,
    };
  },

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    await delay(200);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    // Prevent an admin from demoting themselves and locking themselves out
    if (id === currentUser.id && data.role && data.role !== 'admin') {
      throw new Error('You cannot change your own role');
    }

    users[index] = { ...users[index], ...data };
    if (currentUser.id === id) {
      currentUser = users[index];
    }

    return {
      success: true,
      data: users[index],
      message: 'User updated successfully',
    };
  },

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    if (id === currentUser.id) {
      throw new Error('You cannot delete your own account');
    }

    const target = users.find(u => u.id === id);
    if (!target) throw new Error('User not found');

    if (target.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      throw new Error('Cannot delete the last remaining admin');
    }

    users = users.filter(u => u.id !== id);

    return {
      success: true,
      data: null,
      message: 'User deleted successfully',
    };
  },

  // Admin - Paintings CRUD
  async createPainting(data: Omit<Painting, 'id'>): Promise<ApiResponse<Painting>> {
    await delay(300);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const newPainting: Painting = {
      ...data,
      id: String(Date.now()),
    };

    paintings.unshift(newPainting);

    return {
      success: true,
      data: newPainting,
      message: 'Painting created successfully',
    };
  },

  async updatePainting(id: string, data: Partial<Painting>): Promise<ApiResponse<Painting>> {
    await delay(300);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const index = paintings.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Painting not found');

    paintings[index] = { ...paintings[index], ...data, id };

    return {
      success: true,
      data: paintings[index],
      message: 'Painting updated successfully',
    };
  },

  async deletePainting(id: string): Promise<ApiResponse<null>> {
    await delay(300);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const exists = paintings.some(p => p.id === id);
    if (!exists) throw new Error('Painting not found');

    paintings = paintings.filter(p => p.id !== id);

    return {
      success: true,
      data: null,
      message: 'Painting deleted successfully',
    };
  },

  // Admin - Orders
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    await delay(200);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    return {
      success: true,
      data: orders,
    };
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<ApiResponse<Order>> {
    await delay(300);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    orders[index] = { ...orders[index], status };

    return {
      success: true,
      data: orders[index],
      message: 'Order status updated successfully',
    };
  },

  async deleteOrder(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const exists = orders.some(o => o.id === id);
    if (!exists) throw new Error('Order not found');

    orders = orders.filter(o => o.id !== id);

    return {
      success: true,
      data: null,
      message: 'Order deleted successfully',
    };
  },

  // Helper to set current user (for persistence)
  setCurrentUser(user: User | null, token: string | null) {
    currentUser = user;
    currentToken = token;
  },

  getCurrentUser() {
    return currentUser;
  },
};
