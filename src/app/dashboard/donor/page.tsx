'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageIcon, DollarSignIcon, HeartIcon, SearchIcon, FilterIcon, SortAscIcon } from 'lucide-react';
import { getDonorDashboardData } from '@/services/dashboard';
import { getCurrentUser } from '@/services/auth';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ref, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import DonationForm from '@/components/DonationForm';
import { getDonorDonations } from '@/services/donations';
import { Toaster } from '@/components/ui/toaster';
import { findMatchesForDonor } from '@/services/matching';
import { DonationRequest, Donation } from '@/services/donations';
import { MatchScore as MatchingServiceMatchScore } from '@/services/matching';
import { generateRequestImage } from '@/services/images';

interface MatchScore {
  organizationId: string;
  organization: {
    name: string;
    description: string;
  };
  score: number;
  distance: number;
  matchingCategories: string[];
  requests: DonationRequest[];
}

export default function DonorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [organizationContact, setOrganizationContact] = useState<{
    person: string;
    phone: string;
    email: string;
    address: string;
  } | null>(null);
  const [requestImages, setRequestImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        const user = await getCurrentUser();
        console.log('Current user:', user);
        
        if (!user) {
          console.log('No user found, redirecting to login...');
          // You might want to redirect to login here
          return;
        }

        if (user) {
          console.log('Fetching donor dashboard data...');
          const data = await getDonorDashboardData(user.uid);
          setStats(data);

          // Fetch donations
          console.log('Fetching donations...');
          const donorDonations = await getDonorDonations(user.uid);
          setDonations(donorDonations);

          // Fetch requests
          console.log('Fetching requests...');
          const requestsRef = ref(database, 'requests');
          const snapshot = await get(requestsRef);
          console.log('Got snapshot, exists:', snapshot.exists());
          
          if (snapshot.exists()) {
            const requestsData = snapshot.val();
            console.log('Raw requests data:', requestsData);
            const requestsList = Object.entries(requestsData)
              .map(([id, data]: [string, any]) => {
                console.log(`Processing request ${id}:`, data);
                return {
                  id,
                  ...data
                };
              })
              .filter(request => {
                console.log(`Checking request ${request.id} status:`, request.status);
                return request.status === 'pending';
              });
            console.log('Final filtered requests:', requestsList);
            setRequests(requestsList);
          } else {
            console.log('No requests found in database');
            setRequests([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const newImages: Record<string, string> = {};
      for (const request of requests) {
        // Convert base64 to data URL for display
        const imageData = request.imageUrl ? `data:image/png;base64,${request.imageUrl}` : '';
        newImages[request.id] = imageData;
      }
      setRequestImages(newImages);
    };

    if (requests.length > 0) {
      loadImages();
    }
  }, [requests]);

  const filteredRequests = requests
    .filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
      const isNotCompleted = request.status !== 'completed';
      return matchesSearch && matchesCategory && matchesPriority && isNotCompleted;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'amount':
          return (b.targetAmount || 0) - (a.targetAmount || 0);
        default:
          return 0;
      }
    });

  const handleDonate = async (request: DonationRequest) => {
    setSelectedRequest(request);
    setShowDonationForm(true);
    
    // Fetch organization contact info
    try {
      const orgRef = ref(database, `organizations/${request.organizationId}`);
      const snapshot = await get(orgRef);
      if (snapshot.exists()) {
        const orgData = snapshot.val();
        setOrganizationContact({
          person: orgData.contactPerson || '',
          phone: orgData.contactPhone || '',
          email: orgData.email || '',
          address: orgData.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching organization contact:', error);
    }
  };

  const handleDonationSuccess = () => {
    setShowDonationForm(false);
    if (selectedRequest) {
      // Remove the completed request from the local state
      setRequests(prevRequests => prevRequests.filter(request => request.id !== selectedRequest.id));
    }
    setSelectedRequest(null);
  };

  const getStatusColor = (status: DonationRequest['status'] | Donation['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'fulfilled':
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: DonationRequest['status'] | Donation['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'fulfilled':
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="donor">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E86C3A]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="donor">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-[#0A2540]">Welcome back!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0A2540]">Total Donations</CardTitle>
              <PackageIcon className="h-4 w-4 text-[#E86C3A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A2540]">{stats?.totalDonations || 0}</div>
              <p className="text-xs text-gray-500">All time donations</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0A2540]">Total Value</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-[#E86C3A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A2540]">${stats?.totalValue?.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500">Total value of donations</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0A2540]">Organizations Supported</CardTitle>
              <HeartIcon className="h-4 w-4 text-[#E86C3A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A2540]">{stats?.organizationsSupported || 0}</div>
              <p className="text-xs text-gray-500">Unique organizations</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0A2540]">Available Requests</h2>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SortAscIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {requests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending requests available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="bg-white border-none shadow-lg">
                  <CardHeader>
                    <div className="w-full h-48 relative mb-4 rounded-lg overflow-hidden">
                      <img
                        src={requestImages[request.id]}
                        alt={request.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-[#0A2540]">{request.title}</CardTitle>
                    <p className="text-sm text-gray-500">{request.organizationName}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{request.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.priority === 'high' ? 'bg-red-100 text-red-800' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.priority} priority
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(request.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Category: {request.category}</p>
                      <p className="text-sm text-gray-500">Quantity: {request.quantity}</p>
                    </div>
                    <Button 
                      onClick={() => handleDonate(request)}
                      className="w-full mt-4 bg-[#E86C3A] hover:bg-[#D65A28] text-white"
                    >
                      Accept Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">My Donations</h2>
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{donation.requestTitle}</h3>
                    <p className="text-sm text-gray-500">{donation.organizationName}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      ${donation.amount?.toLocaleString() || '0'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(donation.status)}`}>
                      {getStatusText(donation.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDonationForm && selectedRequest && organizationContact && (
        <DonationForm
          requestId={selectedRequest.id}
          organizationName={selectedRequest.organizationName}
          organizationContact={organizationContact}
          requestDetails={{
            category: selectedRequest.category,
            quantity: selectedRequest.quantity,
            description: selectedRequest.description
          }}
          isOpen={showDonationForm}
          onClose={() => setShowDonationForm(false)}
          onSuccess={handleDonationSuccess}
        />
      )}

      <Toaster />
    </DashboardLayout>
  );
} 