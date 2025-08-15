import { AnalyticsPersistenceService } from './AnalyticsPersistenceService';

export class AnalyticsScheduler {
  private static instance: AnalyticsScheduler;
  private analyticsPersistence: AnalyticsPersistenceService;
  private scheduledCompanies: Set<string> = new Set();

  private constructor() {
    this.analyticsPersistence = AnalyticsPersistenceService.getInstance();
  }

  public static getInstance(): AnalyticsScheduler {
    if (!AnalyticsScheduler.instance) {
      AnalyticsScheduler.instance = new AnalyticsScheduler();
    }
    return AnalyticsScheduler.instance;
  }

  /**
   * Schedule daily snapshots for a company
   */
  public scheduleCompanySnapshots(companyId: string): void {
    if (this.scheduledCompanies.has(companyId)) {
      return; // Already scheduled
    }

    this.scheduledCompanies.add(companyId);

    // Create snapshot immediately if it's a new day
    this.createSnapshotIfNeeded(companyId);

    // Schedule daily snapshots at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 00:01 AM

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.createDailySnapshot(companyId);
      
      // Then schedule recurring daily snapshots
      setInterval(() => {
        this.createDailySnapshot(companyId);
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilMidnight);

    console.log(`📊 Analytics snapshots scheduled for company: ${companyId}`);
  }

  /**
   * Create daily snapshot for a company
   */
  private async createDailySnapshot(companyId: string): Promise<void> {
    try {
      await this.analyticsPersistence.createDailySnapshot(companyId);
      console.log(`✅ Daily snapshot created for company: ${companyId}`);
    } catch (error) {
      console.error(`❌ Error creating daily snapshot for company ${companyId}:`, error);
    }
  }

  /**
   * Create snapshot if needed (called when user logs in)
   */
  private async createSnapshotIfNeeded(companyId: string): Promise<void> {
    // This will check if today's snapshot exists and create it if not
    await this.createDailySnapshot(companyId);
  }

  /**
   * Stop scheduling for a company (cleanup)
   */
  public unscheduleCompanySnapshots(companyId: string): void {
    this.scheduledCompanies.delete(companyId);
  }
}
