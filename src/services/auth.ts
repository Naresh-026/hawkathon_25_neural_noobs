import { ref, get, set } from 'firebase/database';
import { database, auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';

export type UserRole = 'donor' | 'organization' | 'admin';
export type OrganizationStatus = 'pending' | 'approved' | 'rejected';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
}

export interface DonorData extends UserData {
  role: 'donor';
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    categories: string[];
    maxDistance: number;
  };
  createdAt: string;
}

export interface OrganizationData extends UserData {
  role: 'organization';
  organizationName: string;
  address: string;
  description: string;
  website?: string;
  contactPerson: string;
  contactPhone: string;
  status: OrganizationStatus;
  adminNote?: string;
  lastUpdated?: string;
  password: string;
}

export interface Donor {
  id: string;
  email: string;
  name: string;
  role: 'donor';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    categories: string[];
    maxDistance: number; // in kilometers
  };
  createdAt: string;
}

export interface Organization {
  id: string;
  email: string;
  name: string;
  role: 'organization';
  status: 'pending' | 'approved' | 'rejected';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contactPerson: string;
  contactPhone: string;
  description: string;
  website?: string;
  createdAt: string;
}

export const updateOrganizationStatus = async (
  uid: string,
  status: OrganizationStatus,
  note?: string
): Promise<void> => {
  try {
    const orgRef = ref(database, `organizations/${uid}`);
    const currentData = (await get(orgRef)).val();
    
    if (!currentData) {
      throw new Error('Organization not found');
    }

    const updates = {
      ...currentData,
      status,
      adminNote: note || null,
      lastUpdated: new Date().toISOString()
    };
    
    await set(orgRef, updates);
  } catch (error) {
    console.error('Error updating organization status:', error);
    throw new Error('Failed to update organization status');
  }
};

export const login = async (email: string, password: string): Promise<UserData> => {
  try {
    // Get user data from database
    const orgsRef = ref(database, 'organizations');
    const donorsRef = ref(database, 'donors');
    
    const [orgsSnapshot, donorsSnapshot] = await Promise.all([
      get(orgsRef),
      get(donorsRef)
    ]);

    const orgsData = orgsSnapshot.val() || {};
    const donorsData = donorsSnapshot.val() || {};

    // First check if user is an organization
    const org = Object.values(orgsData).find(
      (org: any) => org.email === email && org.password === password
    ) as OrganizationData | undefined;

    if (org) {
      // Store the current user in localStorage regardless of status
      localStorage.setItem('currentUser', JSON.stringify(org));
      
      // If status is pending, throw a specific error
      if (org.status === 'pending') {
        throw new Error('Your application is pending approval. Please check your application status.');
      }
      
      // If status is rejected, throw a specific error
      if (org.status === 'rejected') {
        throw new Error('Your application has been rejected. Please contact support for more information.');
      }
      
      return org;
    }

    // If not an organization, try Firebase Auth for donors
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Check if user is a donor
      const donor = Object.values(donorsData).find(
        (donor: any) => donor.uid === firebaseUser.uid
      ) as DonorData | undefined;

      if (donor) {
        // Store the current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(donor));
        return donor;
      }
    } catch (error) {
      // If Firebase auth fails, continue to throw the final error
    }

    throw new Error('Invalid email or password');
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(error.message || 'Invalid email or password');
  }
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    if (typeof window === 'undefined') return null;
    
    // First check if we have a cached user
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }

    // Check Firebase auth state
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    // Get user data from database
    const orgsRef = ref(database, 'organizations');
    const donorsRef = ref(database, 'donors');
    
    const [orgsSnapshot, donorsSnapshot] = await Promise.all([
      get(orgsRef),
      get(donorsRef)
    ]);

    const orgsData = orgsSnapshot.val() || {};
    const donorsData = donorsSnapshot.val() || {};

    // Check if user is an organization
    const org = Object.values(orgsData).find(
      (org: any) => org.uid === currentUser.uid
    ) as OrganizationData | undefined;

    if (org) {
      localStorage.setItem('currentUser', JSON.stringify(org));
      return org;
    }

    // Check if user is a donor
    const donor = Object.values(donorsData).find(
      (donor: any) => donor.uid === currentUser.uid
    ) as DonorData | undefined;

    if (donor) {
      localStorage.setItem('currentUser', JSON.stringify(donor));
      return donor;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<OrganizationData | null> => {
  try {
    const orgsRef = ref(database, 'organizations');
    const snapshot = await get(orgsRef);
    const orgsData = snapshot.val() || {};

    // Find organization by email
    const org = Object.values(orgsData).find(
      (org: any) => org.email === email
    ) as OrganizationData | undefined;

    if (!org) {
      return null;
    }

    return org;
  } catch (error) {
    console.error('Error getting organization by email:', error);
    throw error;
  }
};

export const registerOrganization = async (
  email: string,
  password: string,
  data: Omit<OrganizationData, 'uid' | 'email' | 'role' | 'status' | 'password'>
): Promise<Omit<OrganizationData, 'password'>> => {
  try {
    // First check if organization already exists
    const orgsRef = ref(database, 'organizations');
    const snapshot = await get(orgsRef);
    const orgsData = snapshot.val() || {};
    
    // Check if email already exists
    const emailExists = Object.values(orgsData).some(
      (org: any) => org.email === email
    );
    
    if (emailExists) {
      throw new Error('An organization with this email already exists');
    }

    // Generate a unique ID for the organization
    const uid = Date.now().toString();

    // Create new organization with password
    const newOrg: OrganizationData = {
      uid,
      email,
      password,
      role: 'organization',
      status: 'pending',
      ...data,
    };

    // Save to database
    await set(ref(database, `organizations/${uid}`), newOrg);

    // Return org data without password
    const { password: _, ...orgData } = newOrg;
    return orgData;
  } catch (error: any) {
    console.error('Error registering organization:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

export const registerDonor = async (
  email: string,
  password: string,
  name: string,
  location: { latitude: number; longitude: number; address: string },
  preferences: { categories: string[]; maxDistance: number }
): Promise<UserCredential> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create donor data
    const donorData: DonorData = {
      uid: user.uid,
      email,
      name,
      role: 'donor',
      location,
      preferences,
      createdAt: new Date().toISOString()
    };

    // Save to database
    await set(ref(database, `donors/${user.uid}`), donorData);

    return userCredential;
  } catch (error: any) {
    console.error('Error registering donor:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}; 