'use client';

import DashboardLayout from '@/components/DashboardLayout';
import DonationRequests from '@/components/DonationRequests';

export default function DonationRequestsPage() {
  return (
    <DashboardLayout role="donor">
      <DonationRequests />
    </DashboardLayout>
  );
} 