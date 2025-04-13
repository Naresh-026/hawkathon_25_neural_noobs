'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageIcon, UsersIcon, AlertCircleIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getOrganizationDashboardData } from '@/services/dashboard';
import { format } from 'date-fns';

interface DonationItem {
  name: string;
  quantity: number;
}

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  items: DonationItem[];
  amount: number;
  timestamp: number;
}

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptedDonations, setAcceptedDonations] = useState<Donation[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.uid) return;
      
      try {
        const data = await getOrganizationDashboardData(user.uid);
        setStats(data);
        
        // Transform the data to match our interface
        const transformedDonations = data.acceptedDonations?.map((donation: any) => ({
          id: donation.id,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          amount: donation.amount,
          timestamp: donation.timestamp,
          items: Array.isArray(donation.items) ? donation.items.map((item: string) => {
            const [name, quantity] = item.split(" x ");
            return {
              name,
              quantity: parseInt(quantity) || 1
            };
          }) : []
        })) || [];
        
        setAcceptedDonations(transformedDonations);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="organization">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E86C3A]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="organization">
        <div className="text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="organization">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#0A2540]">Organization Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0A2540]">Active Requests</CardTitle>
              <PackageIcon className="h-4 w-4 text-[#E86C3A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A2540]">{stats?.activeRequests || 0}</div>
              <p className="text-xs text-gray-500">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0A2540]">Total Donors</CardTitle>
              <UsersIcon className="h-4 w-4 text-[#E86C3A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A2540]">{stats?.totalDonors || 0}</div>
              <p className="text-xs text-gray-500">Unique donors</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0A2540]">Urgent Needs</CardTitle>
              <AlertCircleIcon className="h-4 w-4 text-[#E86C3A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A2540]">{stats?.urgentNeeds || 0}</div>
              <p className="text-xs text-gray-500">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Accepted Donations</h2>
          {acceptedDonations.length === 0 ? (
            <p className="text-gray-500">No accepted donations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acceptedDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{donation.donorName}</div>
                        <div className="text-sm text-gray-500">{donation.donorEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="text-sm text-gray-900">
                          {donation.items.map((item, index) => (
                            <li key={index}>
                              {item.name} x {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(donation.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(donation.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 