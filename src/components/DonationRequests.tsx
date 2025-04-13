'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase';
import { format } from 'date-fns';
import DonationForm from './DonationForm';

interface Request {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  currentQuantity: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

interface OrganizationContact {
  person: string;
  phone: string;
  email: string;
  address: string;
}

export default function DonationRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [organizationContact, setOrganizationContact] = useState<OrganizationContact | null>(null);

  const fetchRequests = async () => {
    try {
      console.log('Fetching requests...');
      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requestsData = snapshot.val();
        console.log('Raw requests data:', requestsData);
        
        const requestsList = Object.entries(requestsData)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data,
            currentQuantity: data.currentQuantity || 0
          }))
          .filter((request) => request.status === 'pending');
        
        console.log('Final filtered requests:', requestsList);
        setRequests(requestsList);
      } else {
        console.log('No requests found in database');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationContact = async (organizationId: string) => {
    try {
      const orgRef = ref(database, `organizations/${organizationId}`);
      const snapshot = await get(orgRef);
      
      if (snapshot.exists()) {
        const orgData = snapshot.val();
        setOrganizationContact({
          person: orgData.contactPerson,
          phone: orgData.contactPhone,
          email: orgData.email,
          address: orgData.address
        });
      }
    } catch (error) {
      console.error('Error fetching organization contact:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDonate = async (request: Request) => {
    await fetchOrganizationContact(request.organizationId);
    setSelectedRequest(request.id);
    setShowDonationForm(true);
  };

  const handleDonationSuccess = () => {
    setShowDonationForm(false);
    setSelectedRequest(null);
    setOrganizationContact(null);
    fetchRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E86C3A]"></div>
      </div>
    );
  }

  const selectedRequestData = selectedRequest 
    ? requests.find(r => r.id === selectedRequest)
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0A2540]">Donation Requests</h2>
      {requests.length === 0 ? (
        <div className="text-center text-gray-500">
          No pending requests found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="bg-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#0A2540]">{request.title}</CardTitle>
                <p className="text-sm text-gray-500">{request.organizationName}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{request.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm">{request.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Items Needed:</span>
                    <span className="text-sm">{request.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Items Received:</span>
                    <span className="text-sm">{request.currentQuantity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#E86C3A] h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((request.currentQuantity / request.quantity) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
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
                <Button 
                  onClick={() => handleDonate(request)}
                  className="w-full bg-[#E86C3A] hover:bg-[#D65A28] text-white"
                  disabled={request.currentQuantity >= request.quantity}
                >
                  {request.currentQuantity >= request.quantity 
                    ? 'Request Fulfilled' 
                    : 'Accept Request'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedRequest && selectedRequestData && organizationContact && (
        <DonationForm
          requestId={selectedRequest}
          organizationName={selectedRequestData.organizationName}
          organizationContact={organizationContact}
          requestDetails={{
            category: selectedRequestData.category,
            quantity: selectedRequestData.quantity,
            description: selectedRequestData.description
          }}
          isOpen={showDonationForm}
          onClose={() => {
            setShowDonationForm(false);
            setSelectedRequest(null);
            setOrganizationContact(null);
          }}
          onSuccess={handleDonationSuccess}
        />
      )}
    </div>
  );
} 