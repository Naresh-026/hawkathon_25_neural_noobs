'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageIcon, PhoneIcon, MailIcon, MapPinIcon, CheckCircle2Icon } from 'lucide-react';
import { update, ref } from 'firebase/database';
import { database } from '@/lib/firebase';

interface OrganizationContact {
  person: string;
  phone: string;
  email: string;
  address: string;
}

interface RequestDetails {
  category: string;
  quantity: number;
  description: string;
}

interface DonationFormProps {
  requestId: string;
  organizationName: string;
  organizationContact: OrganizationContact;
  requestDetails: RequestDetails;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DonationForm({
  requestId,
  organizationName,
  organizationContact,
  requestDetails,
  isOpen,
  onClose,
  onSuccess
}: DonationFormProps) {
  const handleComplete = async () => {
    try {
      // Update the request status to completed
      const requestRef = ref(database, `requests/${requestId}`);
      await update(requestRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error completing donation:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0A2540]">
            Complete Your Donation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Organization Contact Information */}
          <Card className="bg-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0A2540]">
                Organization Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <PackageIcon className="h-5 w-5 text-[#E86C3A]" />
                <span className="font-medium">{organizationName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-[#E86C3A]" />
                <span>{organizationContact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MailIcon className="h-5 w-5 text-[#E86C3A]" />
                <span>{organizationContact.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-[#E86C3A]" />
                <span>{organizationContact.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Donation Steps */}
          <Card className="bg-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0A2540]">
                Donation Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2Icon className="h-5 w-5 text-[#E86C3A] mt-1" />
                <div>
                  <h4 className="font-medium">Step 1: Prepare Your Donation</h4>
                  <p className="text-sm text-gray-600">
                    Gather {requestDetails.quantity} items of {requestDetails.category.toLowerCase()}.
                    Ensure items are in good condition and meet the organization's requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2Icon className="h-5 w-5 text-[#E86C3A] mt-1" />
                <div>
                  <h4 className="font-medium">Step 2: Contact the Organization</h4>
                  <p className="text-sm text-gray-600">
                    Call or email the organization using the contact information above
                    to arrange a drop-off time and location.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2Icon className="h-5 w-5 text-[#E86C3A] mt-1" />
                <div>
                  <h4 className="font-medium">Step 3: Deliver Your Donation</h4>
                  <p className="text-sm text-gray-600">
                    Bring your donation to the organization at the agreed time.
                    Make sure to get a receipt or confirmation of your donation.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2Icon className="h-5 w-5 text-[#E86C3A] mt-1" />
                <div>
                  <h4 className="font-medium">Step 4: Mark as Completed</h4>
                  <p className="text-sm text-gray-600">
                    Once you've delivered your donation, click the button below
                    to mark this request as completed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-[#0A2540] hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              className="bg-[#E86C3A] hover:bg-[#D65A28] text-white"
            >
              Mark as Completed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 