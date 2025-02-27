'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item, Transaction } from '@/types';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalTransactions: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Fetch recent items
        const itemsQuery = query(
          collection(db, 'items'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        const itemsData = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Item[];
        setRecentItems(itemsData);
        
        // Fetch recent transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Transaction[];
        setRecentTransactions(transactionsData);
        
        // Calculate stats
        const allItemsSnapshot = await getDocs(collection(db, 'items'));
        const lowStockItemsQuery = query(
          collection(db, 'items'),
          where('quantity', '<', 10)
        );
        const lowStockSnapshot = await getDocs(lowStockItemsQuery);
        
        const allTransactionsSnapshot = await getDocs(
          query(collection(db, 'transactions'), where('status', '==', 'completed'))
        );
        
        let totalRevenue = 0;
        allTransactionsSnapshot.docs.forEach(doc => {
          totalRevenue += doc.data().total || 0;
        });
        
        setStats({
          totalItems: allItemsSnapshot.size,
          lowStockItems: lowStockSnapshot.size,
          totalTransactions: allTransactionsSnapshot.size,
          revenue: totalRevenue
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.displayName || user?.email}
          </span>
          <Button variant="outline" onClick={() => logout()}>Sign out</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalItems}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Low Stock Items</h3>
          <p className="mt-2 text-3xl font-bold">{stats.lowStockItems}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalTransactions}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/items/new">
            <Button>Add New Item</Button>
          </Link>
          <Link href="/dashboard/transactions/new">
            <Button variant="outline">New Transaction</Button>
          </Link>
          <Link href="/dashboard/items">
            <Button variant="outline">View All Items</Button>
          </Link>
          <Link href="/dashboard/transactions">
            <Button variant="outline">View All Transactions</Button>
          </Link>
        </div>
      </div>

      {/* Recent Items */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Items</h2>
          <Link href="/dashboard/items" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3 text-sm">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm">{item.category}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-sm text-muted-foreground">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link href="/dashboard/transactions" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 text-sm">{transaction.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{transaction.items.length}</td>
                    <td className="px-4 py-3 text-sm">${transaction.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-sm text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}