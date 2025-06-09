"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "@/app/types";
import { useAuth } from "@/app/lib/auth";
import toast from "react-hot-toast";
import { 
  HomeIcon, 
  ClipboardDocumentListIcon,
  DocumentPlusIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [showResourcesSubmenu, setShowResourcesSubmenu] = useState(false);
  
  // Handle logout function
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw new Error(error);
      
      toast.success('Logged out successfully');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Error logging out');
    }
  };
  
  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/ngo/dashboard", 
      icon: HomeIcon 
    },
    { 
      name: "Profile", 
      href: "/ngo/profile", 
      icon: UserCircleIcon 
    },
    { 
      name: "New Opportunity", 
      href: "/ngo/opportunities/new", 
      icon: DocumentPlusIcon 
    },
    { 
      name: "Manage Opportunities", 
      href: "/ngo/opportunities", 
      icon: ClipboardDocumentListIcon 
    },
    { 
      name: "Manage Applications", 
      href: "/ngo/applications", 
      icon: ClipboardDocumentCheckIcon 
    },
    { 
      name: "Tools & Resources", 
      href: "#", 
      icon: DocumentTextIcon,
      hasSubmenu: true,
      submenuItems: [
        {
          name: "Tools",
          href: "/ngo/resources/tools",
          icon: WrenchScrewdriverIcon
        },
        {
          name: "Resources",
          href: "/ngo/resources",
          icon: BookOpenIcon
        }
      ]
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 shadow-lg">
      {/* User Info */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/10">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full flex items-center justify-center text-white mr-3">
            {user.name?.charAt(0) || 'N'}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1 text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="text-xs font-medium text-[#556B2F] uppercase tracking-wider">NGO Account</div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isSubmenuActive = item.hasSubmenu && item.submenuItems?.some(subItem => pathname === subItem.href);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                {item.hasSubmenu ? (
                  <div>
                    <button 
                      onClick={() => setShowResourcesSubmenu(!showResourcesSubmenu)}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-xl group transition-all duration-200 ${
                        isSubmenuActive 
                          ? "bg-gradient-to-r from-[#556B2F]/20 to-[#6B8E23]/20 text-[#556B2F] font-medium" 
                          : "text-gray-700 hover:bg-[#556B2F]/10"
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isSubmenuActive ? 'text-[#556B2F]' : 'text-[#556B2F]'}`} />
                        {item.name}
                      </div>
                      <ChevronDownIcon 
                        className={`h-4 w-4 transform transition-transform duration-200 ${showResourcesSubmenu ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    {/* Submenu */}
                    {showResourcesSubmenu && (
                      <ul className="pl-10 mt-1 space-y-1">
                        {item.submenuItems?.map(subItem => {
                          const SubIcon = subItem.icon;
                          const isSubItemActive = pathname === subItem.href;
                          
                          return (
                            <li key={subItem.name}>
                              <Link 
                                href={subItem.href}
                                className={`flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 ${
                                  isSubItemActive 
                                    ? "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white font-medium shadow-sm" 
                                    : "text-gray-700 hover:bg-[#556B2F]/10"
                                }`}
                              >
                                <SubIcon className={`mr-3 h-4 w-4 flex-shrink-0 ${isSubItemActive ? 'text-white' : 'text-[#556B2F]'}`} />
                                {subItem.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 ${
                      isActive 
                        ? "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white font-medium shadow-sm" 
                        : "text-gray-700 hover:bg-[#556B2F]/10"
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#556B2F]'}`} />
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}; 