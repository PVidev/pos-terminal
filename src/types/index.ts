export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
  discount?: number; // percentage discount
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  cashier?: string;
  operatorName?: string;
  customerInfo?: {
    name?: string;
    email?: string;
  };
}

export interface InventoryOrder {
  id: string;
  items: Array<{
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    currentStock: number;
  }>;
  totalItems: number;
  timestamp: Date;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  orderedBy?: string;
  cancellationReason?: string;
}

export interface InventoryRevision {
  id: string;
  timestamp: Date;
  performedBy: string;
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    category: string;
    expectedStock: number;
    actualStock: number;
    difference: number;
    orderQuantity: number;
  }>;
  summary: {
    totalProducts: number;
    productsWithDifferences: number;
    totalDifferences: number;
    totalOrdered: number;
    estimatedLoss?: number; // в лева
  };
}

export interface RevisionDifference {
  id: string;
  revisionId: string;
  productId: string;
  productName: string;
  category: string;
  expectedStock: number;
  actualStock: number;
  difference: number;
  percentageDifference: number;
  timestamp: Date;
  reason?: string;
  action?: 'investigation' | 'order' | 'adjustment' | 'none';
}

// Кухненски типове - временно скрити
/*
export interface Ingredient {
  id: string;
  name: string;
  type: 'main' | 'spice'; // основен ингредиент или подправка
  unit: string; // бр., гр., мл., щипка и т.н.
  stock?: number;
  category: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  type: 'main' | 'spice';
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  preparationTime: number; // в минути
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions?: string;
  price: number;
  image?: string;
  isActive: boolean;
}

export interface KitchenOrder {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number; // брой порции
  status: 'pending' | 'preparing' | 'ready' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  orderedBy?: string;
  tableNumber?: string;
  estimatedTime?: number; // в минути
  actualTime?: number; // в минути
}

export interface PendingDish {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  timestamp: Date;
  tableNumber?: string;
  notes?: string;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
}
*/

export type PaymentMethod = 'cash' | 'card' | 'digital';

export interface DashboardStats {
  totalTransactions: number;
  totalRevenue: number;
  todayTransactions: number;
  todayRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    transactions: number;
    revenue: number;
  }>;
  paymentMethodStats: Array<{
    method: PaymentMethod;
    count: number;
    revenue: number;
  }>;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  cashier?: string;
  paymentMethod?: PaymentMethod | 'all';
  minAmount?: number;
  maxAmount?: number;
}