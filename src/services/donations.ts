import { ref, get, set, update, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { getCurrentUser } from './auth';
import { generateRequestImage } from './images';

export interface DonationRequest {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'fulfilled' | 'cancelled' | 'completed';
  createdAt: string;
  completedAt?: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  requestId: string;
  organizationId: string;
  category: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  organizationName?: string;
  requestTitle?: string;
}

export const createRequest = async (
  organizationId: string,
  data: Omit<DonationRequest, 'id' | 'organizationId' | 'organizationName' | 'status' | 'createdAt' | 'currentAmount' | 'imageUrl'>
): Promise<DonationRequest> => {
  try {
    console.log('Starting request creation for:', data.title);
    
    // Get organization name
    const orgRef = ref(database, `organizations/${organizationId}`);
    const orgSnapshot = await get(orgRef);
    if (!orgSnapshot.exists()) throw new Error('Organization not found');
    const organization = orgSnapshot.val();

    // Get the organization name from the correct field
    const organizationName = organization.organizationName || organization.name;
    if (!organizationName) {
      throw new Error('Organization name not found');
    }

    console.log('Organization found:', organizationName);

    // Generate image for the request
    let imageUrl = '';
    try {
      console.log('Attempting to generate image for:', {
        title: data.title,
        category: data.category
      });
      
      const generatedImageUrl = await generateRequestImage(data.title, data.category);
      imageUrl = generatedImageUrl;
      console.log('Image generation result:', imageUrl.substring(0, 50) + '...');
    } catch (error) {
      console.error('Error during image generation:', error);
      // Continue with empty string for default image
    }

    // Create new request
    const newRequest: DonationRequest = {
      id: push(ref(database, 'requests')).key!,
      organizationId,
      organizationName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      imageUrl,
      ...data
    };

    console.log('Saving request to database:', {
      id: newRequest.id,
      title: newRequest.title,
      hasImage: !!newRequest.imageUrl,
      organizationName: newRequest.organizationName
    });

    // Save to database
    await set(ref(database, `requests/${newRequest.id}`), newRequest);

    console.log('Request created successfully');
    return newRequest;
  } catch (error) {
    console.error('Error in createRequest:', error);
    throw new Error('Failed to create request');
  }
};

export async function createDonation(requestId: string, request: DonationRequest): Promise<string> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get request details
    const requestRef = ref(database, `requests/${requestId}`);
    const requestSnapshot = await get(requestRef);
    if (!requestSnapshot.exists()) throw new Error('Request not found');

    const requestData = requestSnapshot.val();

    // Create donation
    const donationsRef = ref(database, 'donations');
    const newDonationRef = push(donationsRef);
    const donationId = newDonationRef.key!;

    const donation: Donation = {
      id: donationId,
      donorId: user.uid,
      requestId,
      organizationId: requestData.organizationId,
      category: request.category,
      quantity: request.quantity,
      amount: request.quantity * (requestData.unitPrice || 0),
      status: 'accepted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationName: requestData.organizationName,
      requestTitle: requestData.title,
    };

    // Update the request status and add donor information
    await update(requestRef, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      donorId: user.uid,
      donorEmail: user.email,
      currentQuantity: (requestData.currentQuantity || 0) + request.quantity
    });

    // Save the donation
    await set(newDonationRef, donation);

    return donationId;
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
}

export async function getDonorDonations(donorId: string): Promise<Donation[]> {
  try {
    const donationsRef = ref(database, 'donations');
    const snapshot = await get(donationsRef);
    
    if (!snapshot.exists()) return [];

    const donations = Object.entries(snapshot.val())
      .map(([id, data]: [string, any]) => ({
        id,
        ...data
      }))
      .filter((donation: Donation) => donation.donorId === donorId);

    return donations;
  } catch (error) {
    console.error('Error fetching donor donations:', error);
    throw error;
  }
}

export async function updateDonationStatus(donationId: string, status: Donation['status']): Promise<void> {
  try {
    const donationRef = ref(database, `donations/${donationId}`);
    await update(donationRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating donation status:', error);
    throw error;
  }
} 