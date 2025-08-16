import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Team, User, COLLECTIONS } from '@/types/database';

export interface TeamInvite {
  id: string;
  companyId: string;
  teamId?: string;
  inviteCode: string;
  email?: string;
  role: 'cleaner' | 'team_lead';
  expiresAt: Date;
  createdAt: Date;
  createdBy: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  specialties?: string[];
  leaderId?: string;
}

export interface TeamMemberInfo extends User {
  cleanerProfile?: any;
}

export class TeamService {
  private static instance: TeamService;

  public static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  private constructor() {}

  /**
   * Create a new team
   */
  public async createTeam(companyId: string, teamData: CreateTeamData): Promise<Team> {
    try {
      const teamId = doc(collection(db, COLLECTIONS.TEAMS)).id;
      
      const team: Team = {
        id: teamId,
        companyId,
        name: teamData.name,
        leaderId: teamData.leaderId || '',
        members: teamData.leaderId ? [teamData.leaderId] : [],
        specialties: teamData.specialties || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, COLLECTIONS.TEAMS, teamId), {
        ...team,
        createdAt: Timestamp.fromDate(team.createdAt),
        updatedAt: Timestamp.fromDate(team.updatedAt)
      });

      return team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Get all teams for a company
   */
  public async getCompanyTeams(companyId: string): Promise<Team[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TEAMS),
        where('companyId', '==', companyId)
      );

      const querySnapshot = await getDocs(q);
      const teams: Team[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        teams.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Team);
      });

      return teams;
    } catch (error) {
      console.error('Error getting company teams:', error);
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  public async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const teamDoc = await getDoc(doc(db, COLLECTIONS.TEAMS, teamId));
      
      if (!teamDoc.exists()) {
        return null;
      }

      const data = teamDoc.data();
      return {
        ...data,
        id: teamDoc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Team;
    } catch (error) {
      console.error('Error getting team:', error);
      throw error;
    }
  }

  /**
   * Get team members with their details
   */
  public async getTeamMembers(teamId: string): Promise<TeamMemberInfo[]> {
    try {
      const team = await this.getTeamById(teamId);
      if (!team || team.members.length === 0) {
        return [];
      }

      const members: TeamMemberInfo[] = [];

      // Get user details for each member
      for (const memberId of team.members) {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const member: TeamMemberInfo = {
            ...userData,
            id: userDoc.id,
            createdAt: userData.createdAt.toDate(),
            updatedAt: userData.updatedAt.toDate(),
            lastLoginAt: userData.lastLoginAt?.toDate()
          } as TeamMemberInfo;

          // Get cleaner profile if user is a cleaner
          if (userData.role === 'cleaner') {
            const cleanerDoc = await getDoc(doc(db, COLLECTIONS.CLEANER_PROFILES, memberId));
            if (cleanerDoc.exists()) {
              const cleanerData = cleanerDoc.data();
              member.cleanerProfile = {
                ...cleanerData,
                createdAt: cleanerData.createdAt.toDate(),
                updatedAt: cleanerData.updatedAt.toDate()
              };
            }
          }

          members.push(member);
        }
      }

      return members;
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    }
  }

  /**
   * Add member to team
   */
  public async addMemberToTeam(teamId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.TEAMS, teamId), {
        members: arrayUnion(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error adding member to team:', error);
      throw error;
    }
  }

  /**
   * Remove member from team
   */
  public async removeMemberFromTeam(teamId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.TEAMS, teamId), {
        members: arrayRemove(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error removing member from team:', error);
      throw error;
    }
  }

  /**
   * Update team details
   */
  public async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      await updateDoc(doc(db, COLLECTIONS.TEAMS, teamId), updateData);
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  /**
   * Delete team
   */
  public async deleteTeam(teamId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TEAMS, teamId));
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }

  /**
   * Generate invitation code
   */
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Create team invitation
   */
  public async createTeamInvite(
    companyId: string, 
    createdBy: string,
    options: {
      teamId?: string;
      email?: string;
      role?: 'cleaner' | 'team_lead';
      expiresInDays?: number;
    } = {}
  ): Promise<TeamInvite> {
    try {
      const inviteId = doc(collection(db, 'team_invites')).id;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 7));

      const invite: TeamInvite = {
        id: inviteId,
        companyId,
        teamId: options.teamId,
        inviteCode: this.generateInviteCode(),
        email: options.email,
        role: options.role || 'cleaner',
        expiresAt,
        createdAt: new Date(),
        createdBy,
        isUsed: false
      };

      await setDoc(doc(db, 'team_invites', inviteId), {
        ...invite,
        expiresAt: Timestamp.fromDate(invite.expiresAt),
        createdAt: Timestamp.fromDate(invite.createdAt)
      });

      return invite;
    } catch (error) {
      console.error('Error creating team invite:', error);
      throw error;
    }
  }

  /**
   * Get invite by code
   */
  public async getInviteByCode(inviteCode: string): Promise<TeamInvite | null> {
    try {
      console.log('🔍 TeamService: Searching for invite code:', inviteCode);
      
      const q = query(
        collection(db, 'team_invites'),
        where('inviteCode', '==', inviteCode),
        where('isUsed', '==', false)
      );

      console.log('📡 TeamService: Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      
      console.log('📊 TeamService: Query result - docs found:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('❌ TeamService: No matching invites found');
        return null;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      
      console.log('📋 TeamService: Raw invite data:', data);
      
      const invite: TeamInvite = {
        ...data,
        id: docSnap.id,
        expiresAt: data.expiresAt.toDate(),
        createdAt: data.createdAt.toDate(),
        usedAt: data.usedAt?.toDate()
      } as TeamInvite;

      console.log('📅 TeamService: Processed invite:', invite);

      // Check if expired
      if (invite.expiresAt < new Date()) {
        console.log('⏰ TeamService: Invite expired:', invite.expiresAt);
        return null;
      }

      console.log('✅ TeamService: Valid invite found');
      return invite;
    } catch (error) {
      console.error('💥 TeamService: Error getting invite by code:', error);
      console.error('💥 TeamService: Error details:', {
        message: (error as any).message,
        code: (error as any).code,
        stack: (error as any).stack
      });
      throw error;
    }
  }

  /**
   * Use invitation (mark as used)
   */
  public async useInvite(inviteId: string, usedBy: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'team_invites', inviteId), {
        isUsed: true,
        usedBy,
        usedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error using invite:', error);
      throw error;
    }
  }

  /**
   * Get company invites
   */
  public async getCompanyInvites(companyId: string): Promise<TeamInvite[]> {
    try {
      const q = query(
        collection(db, 'team_invites'),
        where('companyId', '==', companyId)
      );

      const querySnapshot = await getDocs(q);
      const invites: TeamInvite[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invites.push({
          ...data,
          id: doc.id,
          expiresAt: data.expiresAt.toDate(),
          createdAt: data.createdAt.toDate(),
          usedAt: data.usedAt?.toDate()
        } as TeamInvite);
      });

      return invites;
    } catch (error) {
      console.error('Error getting company invites:', error);
      throw error;
    }
  }
}
