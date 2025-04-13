import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Donor, Organization } from './auth';

interface DonationRequest {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'fulfilled' | 'cancelled';
  createdAt: string;
  targetAmount?: number;
  currentAmount?: number;
}

export interface MatchScore {
  organizationId: string;
  score: number;
  distance: number;
  matchingCategories: string[];
  organization: Organization;
  requests: DonationRequest[];
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function findMatchesForDonor(donorId: string): Promise<MatchScore[]> {
  try {
    // Get donor data
    const donorRef = ref(database, `users/${donorId}`);
    const donorSnapshot = await get(donorRef);
    if (!donorSnapshot.exists()) throw new Error('Donor not found');
    const donor = donorSnapshot.val() as Donor;

    // Get all approved organizations
    const organizationsRef = ref(database, 'users');
    const organizationsSnapshot = await get(organizationsRef);
    if (!organizationsSnapshot.exists()) return [];

    const organizations = Object.entries(organizationsSnapshot.val())
      .map(([id, data]: [string, any]) => ({ id, ...data }))
      .filter((org: any) => org.role === 'organization' && org.status === 'approved') as Organization[];

    // Get all active donation requests
    const requestsRef = ref(database, 'requests');
    const requestsSnapshot = await get(requestsRef);
    const requests = requestsSnapshot.exists() 
      ? Object.entries(requestsSnapshot.val())
          .map(([id, data]: [string, any]) => ({ id, ...data }))
          .filter((req: any) => req.status === 'pending')
      : [];

    // Calculate match scores for each organization
    const matches: MatchScore[] = organizations
      .map(org => {
        const distance = calculateDistance(
          donor.location.latitude,
          donor.location.longitude,
          org.location.latitude,
          org.location.longitude
        );

        // Skip if organization is too far
        if (distance > donor.preferences.maxDistance) return null;

        // Find matching requests
        const orgRequests = requests.filter(req => req.organizationId === org.id);
        const matchingRequests = orgRequests.filter(req => 
          donor.preferences.categories.includes(req.category)
        );

        // Calculate match score (0-100)
        const distanceScore = Math.max(0, 100 - (distance * 10)); // 10 points per km
        const categoryScore = (matchingRequests.length / orgRequests.length) * 50;
        const totalScore = distanceScore + categoryScore;

        return {
          organizationId: org.id,
          score: totalScore,
          distance,
          matchingCategories: [...new Set(matchingRequests.map(req => req.category))],
          organization: org,
          requests: matchingRequests
        };
      })
      .filter((match): match is MatchScore => match !== null)
      .sort((a, b) => b.score - a.score);

    return matches;
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
} 