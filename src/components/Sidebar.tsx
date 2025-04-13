'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { HomeIcon, PackageIcon, UsersIcon, SettingsIcon, LogOutIcon } from 'lucide-react';
import { logout } from '@/services/auth';

interface SidebarProps {
  role: 'donor' | 'organization' | 'admin';
}

const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const donorLinks = [
    { href: '/dashboard/donor', label: 'Dashboard', icon: HomeIcon },
    { href: '/dashboard/donor/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const organizationLinks = [
    {
      label: 'Dashboard',
      href: '/dashboard/organization',
      icon: HomeIcon,
    },
    {
      label: 'Donation Requests',
      href: '/dashboard/organization/requests',
      icon: PackageIcon,
    },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: HomeIcon },
    { href: '/dashboard/admin/organizations', label: 'Organizations', icon: UsersIcon },
    { href: '/dashboard/admin/requests', label: 'Requests', icon: PackageIcon },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const links = role === 'donor' ? donorLinks : role === 'organization' ? organizationLinks : adminLinks;

  return (
    <div className="h-screen w-64 bg-[#0A2540] text-white">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="text-[#E86C3A]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Box of Hope</h2>
        </div>
        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-3 rounded-md transition-colors',
                  isActive 
                    ? 'bg-[#E86C3A] text-white' 
                    : 'text-gray-300 hover:bg-[#E86C3A]/10 hover:text-white'
                )}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <button
            className="flex items-center space-x-2 px-4 py-3 rounded-md text-gray-300 hover:bg-[#E86C3A]/10 hover:text-white w-full mt-8"
            onClick={handleLogout}
          >
            <LogOutIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 