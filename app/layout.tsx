import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './components/AuthProvider';

export const metadata: Metadata = {
  title: 'Zaytoonz NGO',
  description: 'Platform for NGOs and individuals to connect',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen relative">
        {/* Background pattern with color palette */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Top-left blob */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#556B2F] opacity-10 rounded-full blur-3xl"></div>
          
          {/* Top-right blob */}
          <div className="absolute top-20 right-10 w-80 h-80 bg-[#6B8E23] opacity-10 rounded-full blur-3xl"></div>
          
          {/* Center blob */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#8FBC8F] opacity-10 rounded-full blur-3xl"></div>
          
          {/* Bottom-left blob */}
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-[#BDB76B] opacity-10 rounded-full blur-3xl"></div>
          
          {/* Bottom-right blob */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#CD853F] opacity-10 rounded-full blur-3xl"></div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 background-pattern opacity-40"></div>
        </div>
        
        <div className="relative z-10">
          <AuthProvider skipLoadingOnRoot>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
} 