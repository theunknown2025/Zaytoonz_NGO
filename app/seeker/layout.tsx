'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './components/Sidebar';
import { useAuth } from '@/app/lib/auth';
import { User } from '@/app/types';
import { Toaster } from 'react-hot-toast';

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  
  // Map auth user to the User type expected by Sidebar
  const user: User = authUser ? {
    id: authUser.id,
    name: authUser.fullName,
    email: authUser.email,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date()
  } as User : {} as User;
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            style: {
              background: '#ECFDF5',
              border: '1px solid #D1FAE5',
              color: '#065F46',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#B91C1C',
            },
          },
        }}
      />
      
      {/* Sidebar */}
      {authUser && <Sidebar user={user} />}
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 