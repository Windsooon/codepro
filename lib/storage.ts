// localStorage service for LeetCode submissions
// Manages submissions, authentication, and sync history with 5MB limit

export interface StoredSubmission {
  id: number;
  question_id: number;
  lang: string;
  lang_name: string;
  time: string;
  timestamp: number;
  status: number;
  status_display: string;
  runtime: string;
  url: string;
  is_pending: string;
  title: string;
  memory: string;
  code: string;
  compare_result: string;
  title_slug: string;
  has_notes: boolean;
  flag_type: number;
  frontend_id: number;
}

export interface AuthConfig {
  csrftoken: string;
  sessionCookie: string;
  createdAt: number;
  lastUsed: number;
}

export interface SyncHistory {
  lastSyncTimestamp: number;
  lastSyncDate: string;
  totalSubmissions: number;
  newSubmissionsSynced: number;
  syncStatus: 'success' | 'error' | 'never';
  errorMessage?: string;
}

// Storage keys
const STORAGE_KEYS = {
  SUBMISSIONS: 'leetcode_submissions',
  AUTH: 'leetcode_auth',
  SYNC_HISTORY: 'leetcode_sync_history',
  IS_DEMO_DATA: 'leetcode_is_demo_data'
} as const;

// Storage limits (in bytes)
const STORAGE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  WARNING_SIZE: 4.2 * 1024 * 1024, // 4.2MB
} as const;

class LocalStorageService {
  // Load demo data from public/demo-data.json
  private async loadDemoData(): Promise<StoredSubmission[]> {
    try {
      const response = await fetch('/demo-data.json');
      if (!response.ok) {
        // Demo data file not found or could not be loaded
        return [];
      }
      const demoData: StoredSubmission[] = await response.json();
      return demoData;
    } catch (error) {
      console.error('Error loading demo data:', error);
      return [];
    }
  }

  // Check if current data is demo data
  isDemoData(): boolean {
    try {
      const isDemoFlag = localStorage.getItem(STORAGE_KEYS.IS_DEMO_DATA);
      return isDemoFlag === 'true';
    } catch (error) {
      return false;
    }
  }

  // Set demo data flag
  private setDemoDataFlag(isDemo: boolean): void {
    try {
      if (isDemo) {
        localStorage.setItem(STORAGE_KEYS.IS_DEMO_DATA, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.IS_DEMO_DATA);
      }
    } catch (error) {
      console.error('Error setting demo data flag:', error);
    }
  }

  // Get current storage usage in bytes
  getStorageUsage(): { used: number; percentage: number; isNearLimit: boolean } {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    
    const percentage = (totalSize / STORAGE_LIMITS.MAX_SIZE) * 100;
    const isNearLimit = totalSize > STORAGE_LIMITS.WARNING_SIZE;
    
    return { used: totalSize, percentage, isNearLimit };
  }

  // Get submissions from localStorage, load demo data if empty
  getSubmissions(): StoredSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      const submissions = data ? JSON.parse(data) : [];
      
      // If no submissions exist, trigger demo data loading
      if (submissions.length === 0 && !this.isDemoData()) {
        // We can't use async here, so we'll return empty and let the component handle loading
        return [];
      }
      
      return submissions;
    } catch (error) {
      console.error('Error reading submissions from localStorage:', error);
      return [];
    }
  }

  // Initialize demo data if no submissions exist
  async initializeDemoDataIfNeeded(): Promise<boolean> {
    const existingSubmissions = this.getSubmissions();
    
    // Only load demo data if no submissions exist and not already demo data
    if (existingSubmissions.length === 0 && !this.isDemoData()) {
      const demoData = await this.loadDemoData();
      if (demoData.length > 0) {
        const success = this.saveSubmissions(demoData);
        if (success) {
          this.setDemoDataFlag(true);
          return true;
        }
      }
    }
    
    return false;
  }

  // Save submissions to localStorage with automatic cleanup if needed
  saveSubmissions(submissions: StoredSubmission[]): boolean {
    try {
      // Sort by timestamp (newest first)
      const sortedSubmissions = [...submissions].sort((a, b) => b.timestamp - a.timestamp);
      
      let dataToStore = sortedSubmissions;
      let jsonString = JSON.stringify(dataToStore);
      
      // Check if data exceeds storage limit
      while (jsonString.length > STORAGE_LIMITS.MAX_SIZE && dataToStore.length > 100) {
        // Remove oldest 10% of submissions
        const removeCount = Math.max(1, Math.floor(dataToStore.length * 0.1));
        dataToStore = dataToStore.slice(0, -removeCount);
        jsonString = JSON.stringify(dataToStore);
        // Storage limit exceeded - removed oldest submissions
      }
      
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, jsonString);
      return true;
    } catch (error) {
      console.error('Error saving submissions to localStorage:', error);
      return false;
    }
  }

  // Add new submissions (merge with existing, avoid duplicates)
  addSubmissions(newSubmissions: StoredSubmission[]): { added: number; total: number } {
    const existing = this.getSubmissions();
    const existingIds = new Set(existing.map(s => s.id));
    
    // Filter out duplicates
    const uniqueNew = newSubmissions.filter(s => !existingIds.has(s.id));
    
    // If we're adding real submissions to demo data, clear demo flag
    if (this.isDemoData() && uniqueNew.length > 0) {
      this.setDemoDataFlag(false);
    }
    
    // Merge and save
    const allSubmissions = [...existing, ...uniqueNew];
    this.saveSubmissions(allSubmissions);
    
    return {
      added: uniqueNew.length,
      total: allSubmissions.length
    };
  }

  // Get newest submission timestamp
  getNewestSubmissionTimestamp(): number {
    const submissions = this.getSubmissions();
    if (submissions.length === 0) return 0;
    
    return Math.max(...submissions.map(s => s.timestamp));
  }

  // Get authentication config
  getAuthConfig(): AuthConfig | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading auth config from localStorage:', error);
      return null;
    }
  }

  // Save authentication config
  saveAuthConfig(config: Omit<AuthConfig, 'createdAt' | 'lastUsed'>): boolean {
    try {
      const authConfig: AuthConfig = {
        ...config,
        createdAt: Date.now(),
        lastUsed: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authConfig));
      return true;
    } catch (error) {
      console.error('Error saving auth config to localStorage:', error);
      return false;
    }
  }

  // Update last used timestamp for auth config
  updateAuthLastUsed(): void {
    const config = this.getAuthConfig();
    if (config) {
      config.lastUsed = Date.now();
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(config));
    }
  }

  // Get sync history
  getSyncHistory(): SyncHistory {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_HISTORY);
      return data ? JSON.parse(data) : {
        lastSyncTimestamp: 0,
        lastSyncDate: 'Never',
        totalSubmissions: 0,
        newSubmissionsSynced: 0,
        syncStatus: 'never' as const
      };
    } catch (error) {
      console.error('Error reading sync history from localStorage:', error);
      return {
        lastSyncTimestamp: 0,
        lastSyncDate: 'Never',
        totalSubmissions: 0,
        newSubmissionsSynced: 0,
        syncStatus: 'never' as const
      };
    }
  }

  // Save sync history
  saveSyncHistory(history: Partial<SyncHistory>): boolean {
    try {
      const existing = this.getSyncHistory();
      const updated: SyncHistory = {
        ...existing,
        ...history,
        lastSyncTimestamp: Date.now(),
        lastSyncDate: new Date().toLocaleString()
      };
      localStorage.setItem(STORAGE_KEYS.SYNC_HISTORY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving sync history to localStorage:', error);
      return false;
    }
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.SYNC_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO_DATA);
  }

  // Get formatted storage size
  formatStorageSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Check if authentication is configured
  isAuthConfigured(): boolean {
    const config = this.getAuthConfig();
    return !!(config?.csrftoken && config?.sessionCookie);
  }

  // Get submission count
  getSubmissionCount(): number {
    return this.getSubmissions().length;
  }

  // Clear all submissions (but keep auth and sync history)
  clearSubmissions(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
      localStorage.removeItem(STORAGE_KEYS.IS_DEMO_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing submissions from localStorage:', error);
      return false;
    }
  }

  // Get submission date range
  getSubmissionDateRange(): { oldest: string; newest: string } | null {
    const submissions = this.getSubmissions();
    if (submissions.length === 0) return null;
    
    const timestamps = submissions.map(s => s.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    const newestTimestamp = Math.max(...timestamps);
    
    const formatDate = (timestamp: number): string => {
      return new Date(timestamp * 1000).toISOString().split('T')[0];
    };
    
    return {
      oldest: formatDate(oldestTimestamp),
      newest: formatDate(newestTimestamp)
    };
  }

  // Export submissions data for demo data creation (temporary utility)
  exportSubmissionsForDemo(): void {
    const submissions = this.getSubmissions();
    // Export functionality for demo data - output would be logged here if needed
  }
}

// Export singleton instance
export const storageService = new LocalStorageService(); 