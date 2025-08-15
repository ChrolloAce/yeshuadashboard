import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  COLLECTIONS, 
  AnalyticsSnapshot, 
  FinancialRecord, 
  CompanyMetrics,
  Job,
  JobStatus
} from '@/types/database';

export class AnalyticsPersistenceService {
  private static instance: AnalyticsPersistenceService;

  public static getInstance(): AnalyticsPersistenceService {
    if (!AnalyticsPersistenceService.instance) {
      AnalyticsPersistenceService.instance = new AnalyticsPersistenceService();
    }
    return AnalyticsPersistenceService.instance;
  }

  /**
   * Remove undefined values from an object recursively
   */
  private filterUndefinedValues(obj: any): any {
    const filtered: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value as any)?.toDate) {
          filtered[key] = this.filterUndefinedValues(value);
        } else {
          filtered[key] = value;
        }
      }
    }
    return filtered;
  }

  // ===== FINANCIAL RECORDS =====
  
  /**
   * Record a financial transaction (immutable record for accounting)
   */
  public async recordFinancialTransaction(
    companyId: string,
    transaction: Omit<FinancialRecord, 'id' | 'companyId' | 'createdAt' | 'isReconciled' | 'accountingPeriod'>
  ): Promise<string> {
    try {
      const now = new Date();
      const accountingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const financialRecord: Omit<FinancialRecord, 'id'> = {
        ...transaction,
        companyId,
        accountingPeriod,
        isReconciled: false,
        createdAt: now
      };

      // Remove undefined values to prevent Firestore errors
      const cleanRecord = this.filterUndefinedValues(financialRecord);

      // Prepare the final record with proper Timestamp conversion
      const firestoreRecord: any = {
        ...cleanRecord,
        createdAt: Timestamp.fromDate(cleanRecord.createdAt)
      };

      // Only add timestamp fields if they exist
      if (cleanRecord.reconciledAt) {
        firestoreRecord.reconciledAt = Timestamp.fromDate(cleanRecord.reconciledAt);
      }
      if (cleanRecord.updatedAt) {
        firestoreRecord.updatedAt = Timestamp.fromDate(cleanRecord.updatedAt);
      }

      const docRef = await addDoc(
        collection(db, COLLECTIONS.FINANCIAL_RECORDS),
        firestoreRecord
      );

      console.log('✅ Financial record created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error recording financial transaction:', error);
      throw error;
    }
  }

  /**
   * Process job completion - creates financial records and updates metrics
   */
  public async processJobCompletion(companyId: string, job: Job): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Record job payment as income
        await this.recordFinancialTransaction(companyId, {
          type: 'income',
          category: 'job_payment',
          amount: job.pricing.finalPrice,
          currency: 'USD',
          description: `Payment for ${job.service.type} cleaning - ${job.client.firstName} ${job.client.lastName}`,
          jobId: job.id,
          clientId: job.clientId,
          paymentMethod: job.payment?.method || 'unknown',
          transactionId: job.payment?.transactionId,
          createdBy: 'system'
        });

        // 2. Record cleaner payment as expense (if assigned)
        // Note: For now using default 70% cleaner rate, TODO: get from cleaner profile
        if (job.assignedTo) {
          const defaultCleanerRate = 0.70; // 70% to cleaner, 30% profit
          const cleanerPayment = job.pricing.finalPrice * defaultCleanerRate;
          await this.recordFinancialTransaction(companyId, {
            type: 'expense',
            category: 'cleaner_payment',
            amount: cleanerPayment,
            currency: 'USD',
            description: `Payment to cleaner - ${job.assignedTo.cleanerName}`,
            jobId: job.id,
            cleanerId: job.assignedTo.cleanerId,
            createdBy: 'system'
          });
        }

        // 3. Update company metrics
        await this.updateCompanyMetrics(companyId, job);
      });

      console.log('✅ Job completion processed for analytics');
    } catch (error) {
      console.error('❌ Error processing job completion:', error);
      throw error;
    }
  }

  // ===== COMPANY METRICS =====
  
  /**
   * Update company metrics when job is completed
   */
  private async updateCompanyMetrics(companyId: string, job: Job): Promise<void> {
    const metricsRef = doc(db, COLLECTIONS.COMPANY_METRICS, companyId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    try {
      const metricsDoc = await getDoc(metricsRef);
      
      if (!metricsDoc.exists()) {
        // Create initial metrics document
        const defaultCleanerRate = 0.70;
        const cleanerPayment = job.assignedTo ? (job.pricing.finalPrice * defaultCleanerRate) : 0;
        
        const initialMetrics: CompanyMetrics = {
          id: companyId,
          companyId,
          lifetimeRevenue: job.pricing.finalPrice,
          lifetimePaidToCleaners: cleanerPayment,
          lifetimeProfit: job.pricing.finalPrice - cleanerPayment,
          lifetimeJobs: 1,
          lifetimeClients: 1,
          currentMonth: {
            year: currentYear,
            month: currentMonth,
            revenue: job.pricing.finalPrice,
            paidToCleaners: cleanerPayment,
            profit: job.pricing.finalPrice - cleanerPayment,
            jobsCompleted: 1,
            newClients: 0, // Will be updated separately when client is created
            quotesGenerated: 0
          },
          averageJobValue: job.pricing.finalPrice,
          clientRetentionRate: 0,
          quoteApprovalRate: 0,
          lastUpdated: now,
          lastJobProcessed: job.id
        };

        await setDoc(metricsRef, {
          ...initialMetrics,
          lastUpdated: Timestamp.fromDate(initialMetrics.lastUpdated)
        });
      } else {
        // Update existing metrics
        const currentMetrics = metricsDoc.data() as CompanyMetrics;
        const defaultCleanerRate = 0.70;
        const cleanerPayment = job.assignedTo ? (job.pricing.finalPrice * defaultCleanerRate) : 0;
        const profit = job.pricing.finalPrice - cleanerPayment;

        const updates: Partial<CompanyMetrics> = {
          lifetimeRevenue: currentMetrics.lifetimeRevenue + job.pricing.finalPrice,
          lifetimePaidToCleaners: currentMetrics.lifetimePaidToCleaners + cleanerPayment,
          lifetimeProfit: currentMetrics.lifetimeProfit + profit,
          lifetimeJobs: currentMetrics.lifetimeJobs + 1,
          averageJobValue: (currentMetrics.lifetimeRevenue + job.pricing.finalPrice) / (currentMetrics.lifetimeJobs + 1),
          lastUpdated: now,
          lastJobProcessed: job.id
        };

        // Update current month if same month, otherwise reset
        if (currentMetrics.currentMonth.year === currentYear && currentMetrics.currentMonth.month === currentMonth) {
          updates.currentMonth = {
            ...currentMetrics.currentMonth,
            revenue: currentMetrics.currentMonth.revenue + job.pricing.finalPrice,
            paidToCleaners: currentMetrics.currentMonth.paidToCleaners + cleanerPayment,
            profit: currentMetrics.currentMonth.profit + profit,
            jobsCompleted: currentMetrics.currentMonth.jobsCompleted + 1
          };
        } else {
          // New month - reset current month metrics
          updates.currentMonth = {
            year: currentYear,
            month: currentMonth,
            revenue: job.pricing.finalPrice,
            paidToCleaners: cleanerPayment,
            profit: profit,
            jobsCompleted: 1,
            newClients: 0,
            quotesGenerated: 0
          };
        }

        await updateDoc(metricsRef, {
          ...updates,
          lastUpdated: Timestamp.fromDate(updates.lastUpdated!)
        });
      }

      console.log('✅ Company metrics updated');
    } catch (error) {
      console.error('❌ Error updating company metrics:', error);
      throw error;
    }
  }

  // ===== ANALYTICS SNAPSHOTS =====
  
  /**
   * Create daily analytics snapshot
   */
  public async createDailySnapshot(companyId: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day
      
      const snapshotId = `${companyId}_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Check if snapshot already exists
      const snapshotRef = doc(db, COLLECTIONS.ANALYTICS_SNAPSHOTS, snapshotId);
      const existingSnapshot = await getDoc(snapshotRef);
      
      if (existingSnapshot.exists()) {
        console.log('📊 Daily snapshot already exists for today');
        return;
      }

      // Get current company metrics
      const metricsRef = doc(db, COLLECTIONS.COMPANY_METRICS, companyId);
      const metricsDoc = await getDoc(metricsRef);
      
      if (!metricsDoc.exists()) {
        console.log('📊 No metrics found, skipping snapshot');
        return;
      }

      const metrics = metricsDoc.data() as CompanyMetrics;
      
      // Create snapshot
      const snapshot: AnalyticsSnapshot = {
        id: snapshotId,
        companyId,
        date: today,
        period: 'daily',
        metrics: {
          totalRevenue: metrics.lifetimeRevenue,
          totalJobs: metrics.lifetimeJobs,
          completedJobs: metrics.lifetimeJobs, // Assuming all are completed for now
          activeClients: metrics.lifetimeClients,
          newClients: metrics.currentMonth.newClients,
          totalQuotes: metrics.currentMonth.quotesGenerated,
          approvedQuotes: metrics.lifetimeJobs, // Simplified assumption
          totalPaidToCleaners: metrics.lifetimePaidToCleaners,
          totalProfit: metrics.lifetimeProfit,
          averageJobValue: metrics.averageJobValue
        },
        breakdown: {
          revenueByService: {} as Record<string, number>, // TODO: Calculate from jobs
          jobsByStatus: {
            'pending': 0,
            'confirmed': 0,
            'assigned': 0,
            'in-progress': 0,
            'completed': 0,
            'cancelled': 0,
            'rescheduled': 0
          } as Record<JobStatus, number>,
          paymentsByMethod: {} as Record<string, number> // TODO: Calculate from financial records
        },
        createdAt: new Date()
      };

      await setDoc(snapshotRef, {
        ...snapshot,
        date: Timestamp.fromDate(snapshot.date),
        createdAt: Timestamp.fromDate(snapshot.createdAt)
      });

      console.log('✅ Daily analytics snapshot created');
    } catch (error) {
      console.error('❌ Error creating daily snapshot:', error);
      throw error;
    }
  }

  // ===== GETTERS =====
  
  /**
   * Get company metrics
   */
  public async getCompanyMetrics(companyId: string): Promise<CompanyMetrics | null> {
    try {
      const metricsRef = doc(db, COLLECTIONS.COMPANY_METRICS, companyId);
      const metricsDoc = await getDoc(metricsRef);
      
      if (!metricsDoc.exists()) {
        return null;
      }

      const data = metricsDoc.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as CompanyMetrics;
    } catch (error) {
      console.error('❌ Error getting company metrics:', error);
      return null;
    }
  }

  /**
   * Get financial records for a period
   */
  public async getFinancialRecords(
    companyId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<FinancialRecord[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.FINANCIAL_RECORDS),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const records: FinancialRecord[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          reconciledAt: data.reconciledAt?.toDate()
        } as FinancialRecord);
      });

      // Filter by date range if provided
      if (startDate || endDate) {
        return records.filter(record => {
          if (startDate && record.createdAt < startDate) return false;
          if (endDate && record.createdAt > endDate) return false;
          return true;
        });
      }

      return records;
    } catch (error) {
      console.error('❌ Error getting financial records:', error);
      return [];
    }
  }
}
