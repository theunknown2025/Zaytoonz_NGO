'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar as SeekerSidebar } from './components/Sidebar';
import { useAuth } from '@/app/lib/auth';
import { User } from '@/app/types';
import { Toaster } from 'react-hot-toast';

function isNgoAccount(userType?: string | null) {
  return userType === 'NGO' || userType === 'admin_ngo' || userType === 'assistant_ngo';
}

/** /seeker/opportunities/:id (not form/email/subroutes) → /ngo/opportunities/:id */
function ngoOpportunityRedirectPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/seeker\/opportunities\/([^/]+)\/?$/);
  if (!match) return null;
  const id = match[1];
  if (!id || id === 'navigate' || id === 'applications' || id === 'alerts' || id === 'external') {
    return null;
  }
  return `/ngo/opportunities/${id}`;
}

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const ngoLoggedIn = isNgoAccount(authUser?.userType);

  useEffect(() => {
    if (!ngoLoggedIn) return;
    const target = ngoOpportunityRedirectPath(pathname);
    if (target) {
      router.replace(target);
    }
  }, [ngoLoggedIn, pathname, router]);

  const user: User = authUser
    ? ({
        id: authUser.id,
        name: authUser.fullName,
        email: authUser.email,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User)
    : ({} as User);

  // While redirecting NGO users off opportunity detail, avoid flashing seeker chrome
  if (ngoLoggedIn && ngoOpportunityRedirectPath(pathname)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#556B2F]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
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

      {authUser && <SeekerSidebar user={user} />}

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
