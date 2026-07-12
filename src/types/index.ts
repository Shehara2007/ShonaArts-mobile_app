// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
  avatar?: string;
  notificationPrefs?: {
    orderUpdates: boolean;
    promotions: boolean;
    wishlistRestock: boolean;
  };
}

// Painting Types
export interface Painting {
  id: string;
  title: string;
  artist: string;
  price: number;
  description: string;
  category: string;
  rating: number;
  image: string;
  stock: number;
  featured: boolean;
}

// Cart Types
export interface CartItem {
  id: string;
  painting: Painting;
  quantity: number;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  painting: Painting;
}

// Order Types
export interface OrderItem {
  paintingId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'delivered' | 'cancelled';
  total: number;
  date: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
  cancelReason?: string;
}

// Custom Order Types
export interface CustomOrder {
  id: string;
  customerId: string;
  description: string;
  budget: number;
  canvasSize: string;
  image?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'cancelled';
  createdAt: string;
  adminNote?: string;
}

// Review Types
export interface Review {
  id: string;
  paintingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Notification Types
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'wishlist' | 'system';
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Filter Types
export interface PaintingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  search?: string;
}

// Stats Types (Admin Dashboard)
export interface DashboardStats {
  totalPaintings: number;
  totalOrders: number;
  totalUsers: number;
  revenue: number;
}
