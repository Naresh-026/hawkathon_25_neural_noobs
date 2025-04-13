'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ref, get, push, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { getCurrentUser } from '@/services/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { UserData, OrganizationData } from '@/services/auth';
import { createRequest } from '@/services/donations';

const DONATION_CATEGORIES = [
  'Food',
  'Clothing',
  'Personal Care',
  'School Supplies',
  'Household Items',
  'Baby Items',
  'Medical Supplies',
  'Other'
] as const;

type DonationCategory = string;

interface DonationRequest {
  id: string;
  title: string;
  description: string;
  category: DonationCategory;
  quantity: number;
  currentQuantity: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'fulfilled' | 'cancelled';
  organizationId: string;
  organizationName: string;
  createdAt: string;
  acceptedAt?: string;
}

interface NewRequest {
  title: string;
  description: string;
  category: DonationCategory;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
}

export default function DonationRequests() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<DonationRequest | null>(null);
  const [newRequest, setNewRequest] = useState<NewRequest>({
    title: '',
    description: '',
    category: DONATION_CATEGORIES[0],
    quantity: 1,
    priority: 'medium',
  });

  const fetchRequests = async () => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'organization') {
        toast.error('Please log in as an organization to view requests');
        return;
      }

      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      const requestsData = snapshot.val() || {};

      const orgRequests = Object.entries(requestsData)
        .filter(([_, req]: [string, any]) => req.organizationId === user.uid)
        .map(([id, req]: [string, any]) => ({
          id,
          ...req,
        })) as DonationRequest[];

      setRequests(orgRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch donation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (requestId: string) => {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      await remove(requestRef);
      toast.success('Request deleted successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const handleEdit = (request: DonationRequest) => {
    setEditingRequest(request);
    setNewRequest({
      title: request.title,
      description: request.description,
      category: request.category,
      quantity: request.quantity,
      priority: request.priority,
    });
    setShowNewRequestDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'organization') {
        toast.error('Please log in as an organization to create a request');
        return;
      }

      const orgUser = user as OrganizationData;

      if (editingRequest) {
        // Update existing request
        const requestRef = ref(database, `requests/${editingRequest.id}`);
        await set(requestRef, {
          ...newRequest,
          organizationId: orgUser.uid,
          organizationName: orgUser.organizationName,
          status: 'pending',
          currentQuantity: 0,
          createdAt: new Date().toISOString(),
        });
        toast.success('Request updated successfully');
      } else {
        // Create new request using the createRequest function
        await createRequest(orgUser.uid, {
          title: newRequest.title,
          description: newRequest.description,
          category: newRequest.category,
          quantity: newRequest.quantity,
          priority: newRequest.priority,
          targetAmount: 0,
        });
        toast.success('Donation request created successfully');
      }

      setNewRequest({
        title: '',
        description: '',
        category: 'Food',
        quantity: 1,
        priority: 'medium',
      });
      setEditingRequest(null);
      setShowNewRequestDialog(false);
      fetchRequests();
    } catch (error) {
      console.error('Error creating/updating request:', error);
      toast.error('Failed to create/update donation request');
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      await update(requestRef, {
        status: 'fulfilled',
        fulfilledAt: new Date().toISOString(),
      });
      toast.success('Request approved successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      await update(requestRef, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      });
      toast.success('Request rejected successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="organization">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E86C3A]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="organization">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0A2540]">Donation Requests</h1>
          <Button
            onClick={() => {
              setEditingRequest(null);
              setNewRequest({
                title: '',
                description: '',
                category: DONATION_CATEGORIES[0],
                quantity: 1,
                priority: 'medium',
              });
              setShowNewRequestDialog(true);
            }}
            className="bg-[#E86C3A] hover:bg-[#D65B29]"
          >
            New Request
          </Button>
        </div>

        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-[#0A2540]">{request.title}</h3>
                  <p className="text-gray-600 mt-2">{request.description}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">Category: {request.category}</p>
                    <p className="text-sm text-gray-500">Quantity: {request.quantity}</p>
                    <p className="text-sm text-gray-500">Priority: {request.priority}</p>
                    <p className="text-sm text-gray-500">Status: {request.status}</p>
                    {request.acceptedAt && (
                      <p className="text-sm text-gray-500">
                        Accepted: {format(new Date(request.acceptedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'fulfilled' 
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : request.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(request)}
                        className="text-[#0A2540] hover:bg-gray-100"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(request.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  {request.status === 'accepted' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleApprove(request.id)}
                        className="text-green-600 hover:bg-green-50"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingRequest ? 'Edit Request' : 'Create New Donation Request'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Enter request title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe what items you need and their intended use"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select
                  value={newRequest.category}
                  onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DONATION_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
                <Input
                  type="number"
                  value={newRequest.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                      setNewRequest({ ...newRequest, quantity: value });
                    }
                  }}
                  min="1"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the total number of items needed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select
                  value={newRequest.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewRequest({ ...newRequest, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  High priority for urgent needs, medium for regular needs, low for future needs
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewRequestDialog(false);
                    setEditingRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#E86C3A] hover:bg-[#D65B29]">
                  {editingRequest ? 'Update Request' : 'Create Request'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 