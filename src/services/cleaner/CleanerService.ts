import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CleanerProfile, User, COLLECTIONS, JoinRequestStatus } from '@/types/database';

export interface JoinRequest {
  companyId: string;
  companyName: string;
  status: JoinRequestStatus;
  requestedAt: Date;
}

export class CleanerService {
  private static instance: CleanerService;

  public static getInstance(): CleanerService {
    if (!CleanerService.instance) {
      CleanerService.instance = new CleanerService();
    }
    return CleanerService.instance;
  }

  private constructor() {}

  /**
   * Remove undefined values from object before saving to Firestore
   */
  private cleanForFirestore(obj: any): any {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
  }

  /**
   * Create a cleaner profile
   */
  public async createCleanerProfile(userId: string, profileData: {
    skills?: string[];
    certifications?: string[];
    hourlyRate?: number;
  }): Promise<CleanerProfile> {
    try {
      const defaultAvailability = {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '17:00', available: false },
        sunday: { start: '09:00', end: '17:00', available: false }
      };

      const profile: CleanerProfile = {
        id: userId,
        userId,
        skills: profileData.skills || [],
        certifications: profileData.certifications || [],
        hourlyRate: profileData.hourlyRate,
        availability: defaultAvailability,
        rating: 5.0,
        totalJobs: 0,
        joinRequests: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, COLLECTIONS.CLEANER_PROFILES, userId), this.cleanForFirestore({
        ...profile,
        createdAt: Timestamp.fromDate(profile.createdAt),
        updatedAt: Timestamp.fromDate(profile.updatedAt)
      }));

      return profile;
    } catch (error) {
      console.error('Error creating cleaner profile:', error);
      throw error;
    }
  }

  /**
   * Get cleaner profile by user ID
   */
  public async getCleanerProfile(userId: string): Promise<CleanerProfile | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CLEANER_PROFILES, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        joinRequests: data.joinRequests?.map((req: any) => ({
          ...req,
          requestedAt: req.requestedAt.toDate()
        })) || []
      } as CleanerProfile;
    } catch (error) {
      console.error('Error getting cleaner profile:', error);
      throw error;
    }
  }

  /**
   * Update cleaner profile
   */
  public async updateCleanerProfile(userId: string, updates: Partial<CleanerProfile>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CLEANER_PROFILES, userId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.userId;
      delete updateData.createdAt;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating cleaner profile:', error);
      throw error;
    }
  }

  /**
   * Request to join a company
   */
  public async requestToJoinCompany(
    cleanerId: string, 
    companyId: string, 
    companyName: string
  ): Promise<void> {
    try {
      const joinRequest: JoinRequest = {
        companyId,
        companyName,
        status: 'pending',
        requestedAt: new Date()
      };

      const docRef = doc(db, COLLECTIONS.CLEANER_PROFILES, cleanerId);
      await updateDoc(docRef, {
        joinRequests: arrayUnion({
          ...joinRequest,
          requestedAt: Timestamp.fromDate(joinRequest.requestedAt)
        }),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error requesting to join company:', error);
      throw error;
    }
  }

  /**
   * Update join request status
   */
  public async updateJoinRequestStatus(
    cleanerId: string,
    companyId: string,
    status: JoinRequestStatus
  ): Promise<void> {
    try {
      const profile = await this.getCleanerProfile(cleanerId);
      if (!profile) {
        throw new Error('Cleaner profile not found');
      }

      // Find and update the specific join request
      const updatedRequests = profile.joinRequests.map(req => 
        req.companyId === companyId 
          ? { ...req, status }
          : req
      );

      await this.updateCleanerProfile(cleanerId, {
        joinRequests: updatedRequests
      });

      // If accepted, add cleaner to company
      if (status === 'accepted') {
        const { CompanyService } = await import('../company/CompanyService');
        await CompanyService.getInstance().addCleanerToCompany(cleanerId, companyId);
      }
    } catch (error) {
      console.error('Error updating join request status:', error);
      throw error;
    }
  }

  /**
   * Get pending join requests for a company
   */
  public async getPendingJoinRequests(companyId: string): Promise<Array<{
    cleaner: User;
    profile: CleanerProfile;
    request: JoinRequest;
  }>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CLEANER_PROFILES),
        where('joinRequests', 'array-contains-any', [{ companyId, status: 'pending' }])
      );

      const querySnapshot = await getDocs(q);
      const results: Array<{
        cleaner: User;
        profile: CleanerProfile;
        request: JoinRequest;
      }> = [];

      for (const docSnap of querySnapshot.docs) {
        const profileData = docSnap.data();
        const profile = {
          ...profileData,
          id: docSnap.id,
          createdAt: profileData.createdAt.toDate(),
          updatedAt: profileData.updatedAt.toDate(),
          joinRequests: profileData.joinRequests?.map((req: any) => ({
            ...req,
            requestedAt: req.requestedAt.toDate()
          })) || []
        } as CleanerProfile;

        // Find the pending request for this company
        const request = profile.joinRequests.find(
          req => req.companyId === companyId && req.status === 'pending'
        );

        if (request) {
          // Get cleaner user data
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, profile.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const cleaner = {
              ...userData,
              id: userDoc.id,
              createdAt: userData.createdAt.toDate(),
              updatedAt: userData.updatedAt.toDate(),
              lastLoginAt: userData.lastLoginAt?.toDate()
            } as User;

            results.push({ cleaner, profile, request });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting pending join requests:', error);
      throw error;
    }
  }

  /**
   * Remove join request
   */
  public async removeJoinRequest(cleanerId: string, companyId: string): Promise<void> {
    try {
      const profile = await this.getCleanerProfile(cleanerId);
      if (!profile) {
        throw new Error('Cleaner profile not found');
      }

      const requestToRemove = profile.joinRequests.find(req => req.companyId === companyId);
      if (!requestToRemove) {
        return; // Request doesn't exist
      }

      const docRef = doc(db, COLLECTIONS.CLEANER_PROFILES, cleanerId);
      await updateDoc(docRef, {
        joinRequests: arrayRemove({
          ...requestToRemove,
          requestedAt: Timestamp.fromDate(requestToRemove.requestedAt)
        }),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error removing join request:', error);
      throw error;
    }
  }
}
