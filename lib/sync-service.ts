// Sync service for fetching submissions from LeetCode API via server-side proxy
// Handles authentication, pagination, and progress tracking

import { StoredSubmission, storageService } from './storage';

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'success' | 'error';
  currentOffset: number;
  totalFetched: number;
  newSubmissions: number;
  message: string;
  error?: string;
  storageUsage?: { used: number; percentage: number; isNearLimit: boolean };
  submissionDateRange?: { oldest: string; newest: string } | null;
}

export interface LeetCodeSubmissionResponse {
  submissions_dump: Array<{
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
  }>;
  has_next: boolean;
  submissions_count: number;
}

class SyncService {
  private readonly PROXY_API_URL = '/api/leetcode-proxy';
  private readonly BATCH_SIZE = 20;
  private readonly DELAY_BETWEEN_REQUESTS = 4000; // 4 seconds
  private isCancelled = false;
  private isSyncing = false;

  // Get authentication headers for the proxy
  private getProxyHeaders(): Record<string, string> {
    const authConfig = storageService.getAuthConfig();
    
    if (!authConfig) {
      throw new Error('Authentication not configured');
    }

    return {
      'Content-Type': 'application/json',
      'x-csrf-token': authConfig.csrftoken,
      'x-session-cookie': authConfig.sessionCookie
    };
  }

  // Fetch a single page of submissions via proxy
  private async fetchSubmissionsPage(offset: number): Promise<LeetCodeSubmissionResponse> {
    const url = `${this.PROXY_API_URL}?offset=${offset}&limit=${this.BATCH_SIZE}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getProxyHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your CSRF token and session cookie.');
        }
        
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        const errorDetails = errorData.details ? ` - ${errorData.details}` : '';
        
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        throw new Error('Network error: Unable to connect to the proxy server. Please check your internet connection.');
      }
      
      if (error instanceof Error) {
        // Re-throw known errors
        throw error;
      }
      
      // Generic fallback
      throw new Error('Failed to fetch submissions. Please try again.');
    }
  }

  // Sleep helper function
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convert API response to StoredSubmission format
  private convertToStoredSubmission(apiSubmission: LeetCodeSubmissionResponse['submissions_dump'][0]): StoredSubmission {
    return {
      id: apiSubmission.id,
      question_id: apiSubmission.question_id,
      lang: apiSubmission.lang,
      lang_name: apiSubmission.lang_name,
      time: apiSubmission.time,
      timestamp: apiSubmission.timestamp,
      status: apiSubmission.status,
      status_display: apiSubmission.status_display,
      runtime: apiSubmission.runtime,
      url: apiSubmission.url,
      is_pending: apiSubmission.is_pending,
      title: apiSubmission.title,
      memory: apiSubmission.memory,
      code: apiSubmission.code,
      compare_result: apiSubmission.compare_result,
      title_slug: apiSubmission.title_slug,
      has_notes: apiSubmission.has_notes,
      flag_type: apiSubmission.flag_type,
      frontend_id: apiSubmission.frontend_id
    };
  }

  // Cancel the current sync operation
  cancelSync(): void {
    this.isCancelled = true;
  }

  // Reset cancellation state
  private resetCancellation(): void {
    this.isCancelled = false;
  }

  // Check if sync is currently in progress
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  // Main sync function with progress callback
  async syncSubmissions(
    onProgress: (progress: SyncProgress) => void
  ): Promise<{ success: boolean; newSubmissions: number; totalSubmissions: number; error?: string }> {
    
    // Prevent concurrent syncs
    if (this.isSyncing) {
      const error = 'Sync is already in progress. Please wait for it to complete.';
      onProgress({
        status: 'error',
        currentOffset: 0,
        totalFetched: 0,
        newSubmissions: 0,
        message: error,
        error
      });
      return { success: false, newSubmissions: 0, totalSubmissions: 0, error };
    }
    
    // Reset cancellation state at the start
    this.resetCancellation();
    this.isSyncing = true;

    // Check authentication
    if (!storageService.isAuthConfigured()) {
      const error = 'Authentication not configured. Please add your CSRF token and session cookie.';
      this.isSyncing = false;
      onProgress({
        status: 'error',
        currentOffset: 0,
        totalFetched: 0,
        newSubmissions: 0,
        message: error,
        error
      });
      return { success: false, newSubmissions: 0, totalSubmissions: 0, error };
    }

    // Clear demo data if it exists - we're starting a real sync
    if (storageService.isDemoData()) {
      storageService.clearSubmissions();
      onProgress({
        status: 'syncing',
        currentOffset: 0,
        totalFetched: 0,
        newSubmissions: 0,
        message: 'Clearing demo data and starting real sync...'
      });
    }

    // Get the newest submission timestamp to know when to stop
    const newestTimestamp = storageService.getNewestSubmissionTimestamp();
    
    onProgress({
      status: 'syncing',
      currentOffset: 0,
      totalFetched: 0,
      newSubmissions: 0,
      message: 'Starting sync via server proxy...'
    });

    let offset = 0;
    let totalFetched = 0;
    let totalNewSubmissions = 0;
    let shouldContinue = true;

    try {
      // Update auth last used timestamp
      storageService.updateAuthLastUsed();

      while (shouldContinue && !this.isCancelled) {
        // Check for cancellation
        if (this.isCancelled) {
          break;
        }

        onProgress({
          status: 'syncing',
          currentOffset: offset,
          totalFetched,
          newSubmissions: totalNewSubmissions,
          message: `Fetching submissions ${offset + 1}-${offset + this.BATCH_SIZE} via proxy...`
        });

        // Fetch page via proxy
        const response = await this.fetchSubmissionsPage(offset);
        
        if (!response.submissions_dump || response.submissions_dump.length === 0) {
          shouldContinue = false;
          break;
        }

        // Process submissions
        const pageSubmissions = response.submissions_dump;
        totalFetched += pageSubmissions.length;

        // Check if we've reached submissions older than our newest
        let foundOlderSubmission = false;
        const pageNewSubmissions: StoredSubmission[] = [];

        for (const apiSubmission of pageSubmissions) {
          if (newestTimestamp > 0 && apiSubmission.timestamp <= newestTimestamp) {
            foundOlderSubmission = true;
            break;
          }
          pageNewSubmissions.push(this.convertToStoredSubmission(apiSubmission));
        }

        // Save new submissions from this page immediately
        if (pageNewSubmissions.length > 0) {
          const result = storageService.addSubmissions(pageNewSubmissions);
          totalNewSubmissions += result.added;
          
          // Get updated storage info after saving
          const updatedUsage = storageService.getStorageUsage();
          const updatedDateRange = storageService.getSubmissionDateRange();
          
          onProgress({
            status: 'syncing',
            currentOffset: offset,
            totalFetched,
            newSubmissions: totalNewSubmissions,
            message: `Saved ${pageNewSubmissions.length} new submissions. Total new: ${totalNewSubmissions}`,
            storageUsage: updatedUsage,
            submissionDateRange: updatedDateRange
          });
        } else {
          onProgress({
            status: 'syncing',
            currentOffset: offset,
            totalFetched,
            newSubmissions: totalNewSubmissions,
            message: `No new submissions in this batch. Total new: ${totalNewSubmissions}`
          });
        }

        // Check stopping conditions
        if (foundOlderSubmission) {
          shouldContinue = false;
          break;
        }

        if (pageSubmissions.length < this.BATCH_SIZE) {
          shouldContinue = false;
          break;
        }

        // Prepare for next iteration
        offset += this.BATCH_SIZE;

        // Wait before next request (except for the last iteration)
        if (shouldContinue && !this.isCancelled) {
          onProgress({
            status: 'syncing',
            currentOffset: offset,
            totalFetched,
            newSubmissions: totalNewSubmissions,
            message: `Waiting 4 seconds before next request...`
          });
          
          // Sleep with cancellation check
          for (let i = 0; i < this.DELAY_BETWEEN_REQUESTS / 100; i++) {
            if (this.isCancelled) break;
            await this.sleep(100);
          }
        }
      }

      // Check if sync was cancelled
      if (this.isCancelled) {
        // Save partial sync history
        storageService.saveSyncHistory({
          totalSubmissions: storageService.getSubmissionCount(),
          newSubmissionsSynced: totalNewSubmissions,
          syncStatus: 'error',
          errorMessage: 'Sync cancelled by user'
        });

        onProgress({
          status: 'error',
          currentOffset: offset,
          totalFetched,
          newSubmissions: totalNewSubmissions,
          message: `Sync cancelled. ${totalNewSubmissions} submissions were saved before cancellation.`,
          error: 'Sync cancelled by user'
        });

        this.isSyncing = false;
        return {
          success: false,
          newSubmissions: totalNewSubmissions,
          totalSubmissions: storageService.getSubmissionCount(),
          error: 'Sync cancelled by user'
        };
      }

      // Get final submission count
      const finalSubmissionCount = storageService.getSubmissionCount();
      
      // Update sync history
      storageService.saveSyncHistory({
        totalSubmissions: finalSubmissionCount,
        newSubmissionsSynced: totalNewSubmissions,
        syncStatus: 'success'
      });

      onProgress({
        status: 'success',
        currentOffset: offset,
        totalFetched,
        newSubmissions: totalNewSubmissions,
        message: `Sync completed! Added ${totalNewSubmissions} new submissions.`
      });

      this.isSyncing = false;
      return {
        success: true,
        newSubmissions: totalNewSubmissions,
        totalSubmissions: finalSubmissionCount
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Save error to sync history (but keep the submissions we already saved)
      storageService.saveSyncHistory({
        syncStatus: 'error',
        errorMessage
      });

      onProgress({
        status: 'error',
        currentOffset: offset,
        totalFetched,
        newSubmissions: totalNewSubmissions,
        message: `Sync failed: ${errorMessage}. ${totalNewSubmissions} submissions were saved before the error.`,
        error: errorMessage
      });

      this.isSyncing = false;
      return {
        success: false,
        newSubmissions: totalNewSubmissions,
        totalSubmissions: storageService.getSubmissionCount(),
        error: errorMessage
      };
    }
  }

  // Test authentication by making a simple API call via proxy
  async testAuthentication(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.fetchSubmissionsPage(0);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication test failed';
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const syncService = new SyncService(); 