"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  ChevronDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  user: User;
}

interface NGOApprovalStatus {
  approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [showResourcesSubmenu, setShowResourcesSubmenu] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<NGOApprovalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch NGO approval status
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      try {
        console.log('Fetching approval status for user:', user.id);
        // Pass the user ID as a query parameter since we're using custom auth
        const response = await fetch(`/api/ngo/approval-status?userId=${user.id}`);
        console.log('Approval status response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Approval status data:', data);
          setApprovalStatus(data);
        } else {
          console.error('Failed to fetch approval status:', response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
        }
      } catch (error) {
        console.error('Error fetching approval status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchApprovalStatus();
    } else {
      setLoading(false);
    }
  }, [user.id]);
  
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

  // Get approval status display
  const getApprovalStatusDisplay = () => {
    if (loading) {
      return (
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse mr-2"></div>
          Checking status...
        </div>
      );
    }

    if (!approvalStatus) {
      return (
        <div className="flex items-center text-xs text-gray-500">
          <ClockIcon className="w-3 h-3 mr-2" />
          Status unknown
        </div>
      );
    }

    switch (approvalStatus.approval_status) {
      case 'pending':
        return (
          <div className="flex items-center text-xs text-yellow-600">
            <ClockIcon className="w-3 h-3 mr-2" />
            Pending Approval
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center text-xs text-green-600">
            <CheckCircleIcon className="w-3 h-3 mr-2" />
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-xs text-red-600">
            <XCircleIcon className="w-3 h-3 mr-2" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  // Check if NGO is approved
  const isApproved = approvalStatus?.approval_status === 'approved';
  const isPending = approvalStatus?.approval_status === 'pending';
  const isRejected = approvalStatus?.approval_status === 'rejected';
  
  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/ngo/dashboard", 
      icon: HomeIcon,
      requiresApproval: true
    },
    { 
      name: "Profile", 
      href: "/ngo/profile", 
      icon: UserCircleIcon,
      requiresApproval: false
    },
    { 
      name: "New Opportunity", 
      href: "/ngo/opportunities/new", 
      icon: DocumentPlusIcon,
      requiresApproval: true
    },
    { 
      name: "Manage Opportunities", 
      href: "/ngo/opportunities", 
      icon: ClipboardDocumentListIcon,
      requiresApproval: true
    },
    { 
      name: "Manage Applications", 
      href: "/ngo/applications", 
      icon: ClipboardDocumentCheckIcon,
      requiresApproval: true
    },
    { 
      name: "Tools & Resources", 
      href: "#", 
      icon: DocumentTextIcon,
      hasSubmenu: true,
      requiresApproval: true,
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
          <div className="text-xs font-medium text-[#556B2F] uppercase tracking-wider mb-2">NGO Account</div>
          {getApprovalStatusDisplay()}
          
          {/* Simple status indicator */}
          {!loading && (
            <div className="mt-2 text-xs">
              {isApproved && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Approved
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  Pending
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircleIcon className="w-3 h-3 mr-1" />
                  Rejected
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isSubmenuActive = item.hasSubmenu && item.submenuItems?.some(subItem => pathname === subItem.href);
            const Icon = item.icon;
            
            // Skip items that require approval but NGO is not approved
            if (item.requiresApproval && !isApproved) {
              return null;
            }
            
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
        
        {/* Debug section - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Debug Tools:</div>
            <div className="flex space-x-1">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/ngo/debug-profile?userId=${user.id}`);
                    const data = await response.json();
                    console.log('Debug profile data:', data);
                    alert('Check console for debug info');
                  } catch (error) {
                    console.error('Debug error:', error);
                  }
                }}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Debug
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/ngo/fix-profile?userId=${user.id}`, {
                      method: 'POST'
                    });
                    const data = await response.json();
                    console.log('Fix profile result:', data);
                    if (data.success) {
                      alert('Profile fixed! Please refresh the page.');
                      window.location.reload();
                    } else {
                      alert('Failed to fix profile: ' + data.error);
                    }
                  } catch (error) {
                    console.error('Fix profile error:', error);
                    alert('Error fixing profile');
                  }
                }}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                Fix
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(`success_shown_${user.id}`);
                  alert('Success message reset. Refresh the page to see it again.');
                }}
                className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                title="Reset success message state"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 