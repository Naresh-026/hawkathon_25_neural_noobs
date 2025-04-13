'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'donor' | 'organization' | 'admin';
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-[#FDF8F4]">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 