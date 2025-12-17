"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import toast from "react-hot-toast";
import {
  UserCircleIcon,
  UsersIcon,
  BriefcaseIcon,
  BanknotesIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  PresentationChartBarIcon,
  StarIcon,
  HomeIcon,
  MagnifyingGlassCircleIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [showExternal, setShowExternal] = useState(false);
  const [showInternal, setShowInternal] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw new Error(error);
      toast.success("Logged out successfully");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Error logging out");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 shadow-lg">
      {/* User Info */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/10">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full flex items-center justify-center text-white mr-3">
            {user.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1 text-gray-800">{user.name || 'Admin'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="text-xs font-medium text-[#556B2F] uppercase tracking-wider">Admin Account</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10 bg-gradient-to-r from-[#556B2F]/5 to-transparent border border-[#556B2F]/20">
              <HomeIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              <span className="font-medium text-[#556B2F]">Zaytoonz</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
              <UserCircleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              Profile
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
              <UsersIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              Users Management
            </Link>
          </li>
          <li>
            <Link href="/admin/Talents" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
              <StarIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              Talents Management
            </Link>
          </li>
          <li>
            <Link href="/admin/NGOManagement" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
              <UserGroupIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              NGOs Management
            </Link>
          </li>
          <li>
            <button
              onClick={() => setShowExternal(!showExternal)}
              className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10`}
            >
              <span className="flex items-center">
                <RectangleGroupIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
                External Opportunities
              </span>
              <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${showExternal ? 'rotate-180' : ''}`} />
            </button>
            {showExternal && (
              <ul className="pl-10 mt-1 space-y-1">
                <li>
                  <Link href="/admin/ExternalOpportunities" className="flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
                    <RectangleGroupIcon className="mr-3 h-4 w-4 flex-shrink-0 text-[#556B2F]" /> Overview
                  </Link>
                </li>
                <li>
                  <Link href="/admin/ExternalOpportunities/Jobs" className="flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
                    <BriefcaseIcon className="mr-3 h-4 w-4 flex-shrink-0 text-[#556B2F]" /> Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/admin/ExternalOpportunities/Funding" className="flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
                    <BanknotesIcon className="mr-3 h-4 w-4 flex-shrink-0 text-[#556B2F]" /> Funding
                  </Link>
                </li>
                <li>
                  <Link href="/admin/ExternalOpportunities/Training" className="flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
                    <AcademicCapIcon className="mr-3 h-4 w-4 flex-shrink-0 text-[#556B2F]" /> Training
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button
              onClick={() => setShowInternal(!showInternal)}
              className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10`}
            >
              <span className="flex items-center">
                <UserGroupIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
                Internal Opportunities
              </span>
              <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${showInternal ? 'rotate-180' : ''}`} />
            </button>
            {showInternal && (
              <ul className="pl-10 mt-1 space-y-1">
                <li>
                  <Link href="/admin/InternalOpportunities/Jobs" className="flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
                    <BriefcaseIcon className="mr-3 h-4 w-4 flex-shrink-0 text-[#556B2F]" /> Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/admin/InternalOpportunities/Fundings" className="flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
                    <BanknotesIcon className="mr-3 h-4 w-4 flex-shrink-0 text-[#556B2F]" /> Fundings
                  </Link>
                </li>
                <li>
                  <Link href="/admin/InternalOpportunities/Trainings" className="flex items-center px-4 py-2 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
                    <AcademicCapIcon className="mr-3 h-4 w-4 flex-shrink-0 text-[#556B2F]" /> Training
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link href="/admin/Workshop" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
              <PresentationChartBarIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              Workshop
            </Link>
          </li>

          <li>
            <Link href="/admin/Scraper" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
              <MagnifyingGlassCircleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              Opportunities Scraper
            </Link>
          </li>

          <li>
            <Link href="#" className="flex items-center px-4 py-3 text-sm rounded-xl group transition-all duration-200 text-gray-700 hover:bg-[#556B2F]/10">
              <WrenchScrewdriverIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[#556B2F]" />
              Morchid
            </Link>
          </li>
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
} 