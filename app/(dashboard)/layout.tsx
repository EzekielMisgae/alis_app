'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        redirect('/login');
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Show nothing while checking authentication
  if (!authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Sidebar and main content will be added here */}
        {children}
      </div>
    </AuthProvider>
  );
}