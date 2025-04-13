'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { updateOrganizationStatus } from '@/services/auth';
import type { OrganizationData, OrganizationStatus } from '@/services/auth';

export default function AdminDashboard() {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);
  const [note, setNote] = useState('');
  const [credentials, setCredentials] = useState<{ orgNumber: string; password: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrganizationStatus>('pending');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const orgsRef = ref(database, 'organizations');
      const snapshot = await get(orgsRef);
      const orgsData = snapshot.val() || {};
      
      const orgsList = Object.values(orgsData).map((org: any) => ({
        ...org,
        id: org.uid
      })) as OrganizationData[];
      
      setOrganizations(orgsList);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (org: OrganizationData, newStatus: OrganizationStatus) => {
    try {
      setError(null);
      await updateOrganizationStatus(org.uid, newStatus, note);
      setNote('');
      setSelectedOrg(null);
      await fetchOrganizations();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update organization status');
    }
  };

  const getStatusColor = (status: OrganizationStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'decision_pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E86C3A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0A2540]">Organization Applications</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {organizations.map((org) => (
            <motion.div
              key={org.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#0A2540] mb-2">{org.organizationName}</h3>
                  <p className="text-gray-600 mb-4">{org.email}</p>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Contact Person: {org.contactPerson}</p>
                    <p className="text-sm text-gray-500">Phone: {org.contactPhone}</p>
                    <p className="text-sm text-gray-500">Address: {org.address}</p>
                    {org.website && (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#E86C3A] hover:underline"
                      >
                        Website: {org.website}
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-gray-700">{org.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(org.status)}`}>
                        {org.status?.replace('_', ' ').charAt(0).toUpperCase() + org.status?.replace('_', ' ').slice(1)}
                      </span>

                      {org.status !== 'approved' && org.status !== 'rejected' && (
                        <button
                          onClick={() => setSelectedOrg(org)}
                          className="text-sm text-[#E86C3A] hover:underline"
                        >
                          Update Status
                        </button>
                      )}
                    </div>

                    {org.adminNote && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Admin Note: {org.adminNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No organization applications found</p>
            </div>
          )}
        </div>

        {selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Update Status for {selectedOrg.organizationName}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrganizationStatus)}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about this status change..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setSelectedOrg(null);
                      setNote('');
                      setSelectedStatus('pending');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrg, selectedStatus)}
                    className="px-4 py-2 bg-[#E86C3A] text-white rounded-md hover:bg-[#D65B29]"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {credentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Organization Credentials</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-2">Organization Number</p>
                  <p className="text-lg font-mono bg-white p-2 rounded border">{credentials.orgNumber}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-2">Temporary Password</p>
                  <p className="text-lg font-mono bg-white p-2 rounded border">{credentials.password}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Please provide these credentials to the organization. They will need to use these to log in.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setCredentials(null);
                      setSelectedStatus('pending');
                    }}
                    className="px-4 py-2 bg-[#E86C3A] text-white rounded-md hover:bg-[#D65B29]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 