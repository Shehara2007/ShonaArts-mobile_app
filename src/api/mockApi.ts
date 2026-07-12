// Simple mock API that works in Expo Go (without MSW)
import { mockUsers, mockPasswords } from '../mock/data/users';
import { mockPaintings } from '../mock/data/paintings';
import { mockOrders } from '../mock/data/orders';
import { mockReviews } from '../mock/data/reviews';
import { mockNotifications } from '../mock/data/notifications';
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
  Review,
  AppNotification,
  ApiResponse,
} from '../types';

// In-memory storage
let users = [...mockUsers];
let paintings = [...mockPaintings];
let orders = [...mockOrders];
let cart: CartItem[] = [];
let wishlist: WishlistItem[] = [];
let customOrders: CustomOrder[] = [];
let reviews: Review[] = [...mockReviews];
let notifications: AppNotification[] = [...mockNotifications];
let currentUser: User | null = null;
let currentToken: string | null = null;

// Recalculate a painting's aggregate rating from its reviews
const recalculatePaintingRating = (paintingId: string) => {
  const paintingReviews = reviews.filter(r => r.paintingId === paintingId);
  const painting = paintings.find(p => p.id === paintingId);
  if (!painting || paintingReviews.length === 0) return;

  const avg = paintingReviews.reduce((sum, r) => sum + r.rating, 0) / paintingReviews.length;
  painting.rating = Math.round(avg * 10) / 10;
};

// Push a notification for a specific user
const pushNotification = (
  userId: string,
  title: string,
  message: string,
  type: AppNotification['type'],
  relatedId?: string
) => {
  notifications.unshift({
    id: `NTF${Date.now()}`,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
    relatedId,
  });
};

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
    await delay();
    const { email, password } = credentials;
    const user = users.find(u => u.email === email);

    if (!user || mockPasswords[email] !== password) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);
    currentUser = user;
    currentToken = token;

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
    await delay(300);
    let filteredPaintings = [...paintings];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredPaintings = filteredPaintings.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.artist.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    if (filters?.category && filters.category !== 'All') {
      filteredPaintings = filteredPaintings.filter(p => p.category === filters.category);
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

    pushNotification(
      currentUser.id,
      'Order Placed',
      `Your order ${newOrder.id} has been placed and is being processed.`,
      'order',
      newOrder.id
    );

    return {
      success: true,
      data: newOrder,
      message: 'Order placed successfully',
    };
  },

  async cancelOrder(id: string, reason?: string): Promise<ApiResponse<Order>> {
    await delay(300);
    if (!currentUser) throw new Error('Unauthorized');

    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];

    if (currentUser.role !== 'admin' && order.userId !== currentUser.id) {
      throw new Error('Unauthorized');
    }

    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be cancelled');
    }

    orders[index] = { ...order, status: 'cancelled', cancelReason: reason };

    pushNotification(
      order.userId,
      'Order Cancelled',
      `Order ${order.id} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      'order',
      order.id
    );

    return {
      success: true,
      data: orders[index],
      message: 'Order cancelled successfully',
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

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    await delay(300);
    if (!currentUser) throw new Error('Unauthorized');

    if (mockPasswords[currentUser.email] !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    mockPasswords[currentUser.email] = newPassword;

    return {
      success: true,
      data: null,
      message: 'Password changed successfully',
    };
  },

  async deleteAccount(): Promise<ApiResponse<null>> {
    await delay(300);
    if (!currentUser) throw new Error('Unauthorized');

    const userId = currentUser.id;
    const userEmail = currentUser.email;

    users = users.filter(u => u.id !== userId);
    delete mockPasswords[userEmail];
    orders = orders.filter(o => o.userId !== userId);
    customOrders = customOrders.filter(c => c.customerId !== userId);
    reviews = reviews.filter(r => r.userId !== userId);
    notifications = notifications.filter(n => n.userId !== userId);
    cart = [];
    wishlist = [];

    currentUser = null;
    currentToken = null;

    return {
      success: true,
      data: null,
      message: 'Account deleted successfully',
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

  // Reviews
  async getReviews(paintingId: string): Promise<ApiResponse<Review[]>> {
    await delay(200);
    const paintingReviews = reviews
      .filter(r => r.paintingId === paintingId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: paintingReviews,
    };
  },

  async addReview(
    paintingId: string,
    rating: number,
    comment: string
  ): Promise<ApiResponse<Review>> {
    await delay(300);
    if (!currentUser) throw new Error('Unauthorized');

    const painting = paintings.find(p => p.id === paintingId);
    if (!painting) throw new Error('Painting not found');

    if (reviews.find(r => r.paintingId === paintingId && r.userId === currentUser!.id)) {
      throw new Error('You have already reviewed this painting');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const newReview: Review = {
      id: `REV${Date.now()}`,
      paintingId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    recalculatePaintingRating(paintingId);

    return {
      success: true,
      data: newReview,
      message: 'Review submitted successfully',
    };
  },

  async updateReview(
    id: string,
    data: { rating?: number; comment?: string }
  ): Promise<ApiResponse<Review>> {
    await delay(300);
    if (!currentUser) throw new Error('Unauthorized');

    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Review not found');

    if (reviews[index].userId !== currentUser.id) {
      throw new Error('You can only edit your own review');
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    reviews[index] = { ...reviews[index], ...data };
    recalculatePaintingRating(reviews[index].paintingId);

    return {
      success: true,
      data: reviews[index],
      message: 'Review updated successfully',
    };
  },

  async deleteReview(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const review = reviews.find(r => r.id === id);
    if (!review) throw new Error('Review not found');

    if (review.userId !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('You can only delete your own review');
    }

    reviews = reviews.filter(r => r.id !== id);
    recalculatePaintingRating(review.paintingId);

    return {
      success: true,
      data: null,
      message: 'Review deleted successfully',
    };
  },

  // Notifications
  async getNotifications(): Promise<ApiResponse<AppNotification[]>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const userNotifications = notifications
      .filter(n => n.userId === currentUser!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: userNotifications,
    };
  },

  async markNotificationRead(id: string): Promise<ApiResponse<AppNotification>> {
    await delay(150);
    if (!currentUser) throw new Error('Unauthorized');

    const index = notifications.findIndex(n => n.id === id && n.userId === currentUser!.id);
    if (index === -1) throw new Error('Notification not found');

    notifications[index] = { ...notifications[index], read: true };

    return {
      success: true,
      data: notifications[index],
    };
  },

  async markAllNotificationsRead(): Promise<ApiResponse<null>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    notifications = notifications.map(n =>
      n.userId === currentUser!.id ? { ...n, read: true } : n
    );

    return {
      success: true,
      data: null,
      message: 'All notifications marked as read',
    };
  },

  async deleteNotification(id: string): Promise<ApiResponse<null>> {
    await delay(150);
    if (!currentUser) throw new Error('Unauthorized');

    notifications = notifications.filter(
      n => !(n.id === id && n.userId === currentUser!.id)
    );

    return {
      success: true,
      data: null,
      message: 'Notification deleted',
    };
  },

  // Custom Orders (customer requests for bespoke artwork)
  async getMyCustomOrders(): Promise<ApiResponse<CustomOrder[]>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const mine = customOrders
      .filter(c => c.customerId === currentUser!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: mine,
    };
  },

  async createCustomOrder(
    data: Omit<CustomOrder, 'id' | 'customerId' | 'status' | 'createdAt'>
  ): Promise<ApiResponse<CustomOrder>> {
    await delay(300);
    if (!currentUser) throw new Error('Unauthorized');

    if (!data.description?.trim()) {
      throw new Error('Please describe the artwork you would like');
    }

    if (!data.budget || data.budget <= 0) {
      throw new Error('Please enter a valid budget');
    }

    const newRequest: CustomOrder = {
      ...data,
      id: `CO${Date.now()}`,
      customerId: currentUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    customOrders.unshift(newRequest);

    pushNotification(
      currentUser.id,
      'Custom Request Submitted',
      'Your custom artwork request has been sent to our team. We will review it shortly.',
      'system',
      newRequest.id
    );

    return {
      success: true,
      data: newRequest,
      message: 'Custom artwork request submitted',
    };
  },

  async cancelCustomOrder(id: string): Promise<ApiResponse<CustomOrder>> {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');

    const index = customOrders.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Request not found');

    if (customOrders[index].customerId !== currentUser.id) {
      throw new Error('Unauthorized');
    }

    if (customOrders[index].status !== 'pending') {
      throw new Error('Only pending requests can be cancelled');
    }

    customOrders[index] = { ...customOrders[index], status: 'cancelled' };

    return {
      success: true,
      data: customOrders[index],
      message: 'Request cancelled',
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
