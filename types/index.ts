// Type definitions for the shop management system

// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'keeper';
  createdAt: Date;
  lastLogin?: Date;
}

// Item types
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

// Category type
export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  items: TransactionItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  handledBy: string; // User ID
}

export interface TransactionItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}