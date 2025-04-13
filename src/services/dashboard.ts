import { ref, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';
import { UserData } from './auth';

export interface DashboardStats {
  totalDonations: number;
  totalValue: number;
  organizationsSupported: number;
  recentDonations: any[];
  upcomingDonations: any[];
}

export interface OrganizationStats {
  activeRequests: number;
  totalDonors: number;
  urgentNeeds: number;
  recentDonations: any[];
  pendingRequests: any[];
  acceptedDonations: {
    id: string;
    donorName: string;
    donorEmail: string;
    amount: number;
    status: string;
    timestamp: number;
    items?: string[];
  }[];
}

export interface AdminStats {
  totalOrganizations: number;
  pendingOrganizations: number;
  totalRequests: number;
  pendingRequests: number;
  recentActivity: {
    type: 'organization' | 'request' | 'donation';
    id: string;
    name: string;
    status: string;
    timestamp: number;
  }[];
}

export const getDonorDashboardData = async (userId: string): Promise<DashboardStats> => {
  try {
    const donationsRef = ref(database, 'donations');
    const donationsQuery = query(donationsRef, orderByChild('donorId'), equalTo(userId));
    const snapshot = await get(donationsQuery);
    
    const donations = snapshot.val() || {};
    const donationList = Object.values(donations);
    
    return {
      totalDonations: donationList.length,
      totalValue: donationList.reduce((sum: number, donation: any) => sum + (donation.value || 0), 0),
      organizationsSupported: new Set(donationList.map((d: any) => d.organizationId)).size,
      recentDonations: donationList
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .slice(0, 5),
      upcomingDonations: donationList
        .filter((d: any) => d.status === 'scheduled')
        .sort((a: any, b: any) => a.scheduledDate - b.scheduledDate)
        .slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching donor dashboard data:', error);
    throw error;
  }
};

export const getOrganizationDashboardData = async (orgId: string): Promise<OrganizationStats> => {
  try {
    // Get organization data
    const orgRef = ref(database, `organizations/${orgId}`);
    const orgSnapshot = await get(orgRef);
    const organization = orgSnapshot.val();

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get requests data
    const requestsRef = ref(database, 'requests');
    const requestsQuery = query(requestsRef, orderByChild('organizationId'), equalTo(orgId));
    const requestsSnapshot = await get(requestsQuery);
    const requests = requestsSnapshot.val() || {};

    // Calculate request stats
    const activeRequests = Object.values(requests).filter(
      (req: any) => req.status === 'active'
    ).length;
    const urgentNeeds = Object.values(requests).filter(
      (req: any) => req.priority === 'high' && req.status === 'active'
    ).length;

    // Get donations
    const donationsRef = ref(database, 'donations');
    const donationsQuery = query(
      donationsRef,
      orderByChild('organizationId'),
      equalTo(orgId)
    );
    const donationsSnapshot = await get(donationsQuery);
    const donations = donationsSnapshot.val() || {};

    // Get all donors to fetch their information
    const donorIds = new Set(Object.values(donations).map((d: any) => d.donorId));
    const donorsRef = ref(database, 'donors');
    const donorsSnapshot = await get(donorsRef);
    const donors = donorsSnapshot.val() || {};

    // Process donations with donor information
    const processedDonations = Object.entries(donations).map(([id, donation]: [string, any]) => ({
      id,
      donorName: donors[donation.donorId]?.name || 'Anonymous',
      donorEmail: donors[donation.donorId]?.email || 'N/A',
      amount: donation.amount,
      status: donation.status,
      timestamp: donation.timestamp,
      items: donation.items || [],
    }));

    const recentDonations = processedDonations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    const acceptedDonations = processedDonations
      .filter(donation => donation.status === 'accepted')
      .sort((a, b) => b.timestamp - a.timestamp);

    // Get pending requests
    const pendingRequests = Object.entries(requests)
      .filter(([_, req]: [string, any]) => req.status === 'pending')
      .map(([id, req]: [string, any]) => ({
        id,
        title: req.title,
        priority: req.priority,
        timestamp: req.createdAt,
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      activeRequests,
      totalDonors: donorIds.size,
      urgentNeeds,
      recentDonations,
      pendingRequests,
      acceptedDonations,
    };
  } catch (error) {
    console.error('Error fetching organization dashboard data:', error);
    throw error;
  }
};

export const getAdminDashboardData = async (): Promise<AdminStats> => {
  try {
    // Get all organizations
    const organizationsSnapshot = await get(ref(database, 'users'));
    const organizations = organizationsSnapshot.val() || {};
    
    // Filter pending organizations
    const pendingOrganizations = Object.values(organizations).filter(
      (org: any) => org.role === 'organization' && org.status === 'pending'
    );

    // Get all requests
    const requestsSnapshot = await get(ref(database, 'requests'));
    const requests = requestsSnapshot.val() || {};
    
    // Filter pending requests
    const pendingRequests = Object.values(requests).filter(
      (req: any) => req.status === 'pending'
    );

    // Get recent activity
    const recentActivity = [
      ...pendingOrganizations.map((org: any) => ({
        type: 'organization' as const,
        id: org.uid,
        name: org.organizationName,
        status: org.status,
        timestamp: Date.now(),
      })),
      ...pendingRequests.map((req: any) => ({
        type: 'request' as const,
        id: req.id,
        name: req.title,
        status: req.status,
        timestamp: req.createdAt,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    return {
      totalOrganizations: Object.values(organizations).filter(
        (org: any) => org.role === 'organization'
      ).length,
      pendingOrganizations: pendingOrganizations.length,
      totalRequests: Object.keys(requests).length,
      pendingRequests: pendingRequests.length,
      recentActivity: recentActivity.slice(0, 10),
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw error;
  }
};

export const getPendingOrganizations = async (): Promise<UserData[]> => {
  try {
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.val() || {};

    return Object.values(users).filter(
      (user: any) => user.role === 'organization' && user.status === 'pending'
    ) as UserData[];
  } catch (error) {
    console.error('Error fetching pending organizations:', error);
    throw error;
  }
}; 