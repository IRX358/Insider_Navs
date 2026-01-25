/**
 * Faculty Service
 * 
 * Merges static faculty data from DuckDB with live data from the API
 * Provides a unified interface for accessing faculty information
 */

import { DuckDBService, FacultyStatic, FacultyFilters } from './duckdb.service';

const BACKEND_URL = 'http://localhost:8000';

export interface FacultyLive {
  id: number;
  availability: boolean;
  unavailable_message?: string;
}

export interface Faculty extends FacultyStatic {
  availability: boolean;
  unavailable_message?: string;
}

class FacultyServiceClass {
  private liveDataCache: Map<number, FacultyLive> = new Map();
  private initialized = false;
  private fallbackMode = false; // Use old API if DuckDB fails

  /**
   * Initialize the faculty service (DuckDB + fetch initial snapshot)
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initialzing/Syncing Faculty Service...');
      
      // Try DuckDB initialization if not done
      if (!this.initialized && !this.fallbackMode) {
        try {
          await DuckDBService.initialize();
          this.initialized = true;
          this.startPeriodicRefresh();
        } catch (duckdbError) {
          console.error('⚠️  DuckDB initialization failed, falling back to API:', duckdbError);
          this.fallbackMode = true;
          this.initialized = true;
        }
      }

      // If we are in DuckDB mode, check for version updates
      if (this.initialized && !this.fallbackMode) {
        try {
          const { needsUpdate, serverVersion } = await DuckDBService.checkVersionSync();
          
          if (needsUpdate || !DuckDBService.getCurrentVersion()) {
            if (serverVersion === 'none') {
              console.warn('⚠️  No snapshot available, using fallback mode');
              this.fallbackMode = true;
            } else {
              await DuckDBService.loadSnapshot(serverVersion);
              this.fallbackMode = false;
            }
          }
        } catch (syncError) {
          console.error('⚠️  Sync check failed, continuing with current data:', syncError);
        }
      }
      
      // Always refresh live data on initialization
      await this.refreshLiveData();
    } catch (error) {
      console.error('❌ Faculty service initialization/sync failed:', error);
      // Don't throw, just fallback
      this.fallbackMode = true;
      this.initialized = true;
    }
  }

  /**
   * Periodic background refresh of live data
   */
  private startPeriodicRefresh(): void {
    // Refresh live data every 1 minute
    setInterval(() => {
      this.refreshLiveData().catch(() => {});
    }, 60000);
  }

  /**
   * Refresh live data from API
   */
  async refreshLiveData(): Promise<void> {
    try {
      // Add timestamp to query to prevent browser caching
      const t = new Date().getTime();
      const response = await fetch(`${BACKEND_URL}/api/faculty/live?t=${t}`);
      const liveData: FacultyLive[] = await response.json();
      
      // Update cache
      this.liveDataCache.clear();
      liveData.forEach(item => {
        // Ensure ID is a number for matching with DuckDB
        this.liveDataCache.set(Number(item.id), item);
      });
      
      console.log(`✅ Refreshed live data for ${liveData.length} faculty members`);
    } catch (error) {
      console.error('Failed to refresh live data:', error);
      throw error;
    }
  }

  /**
   * Get all faculty with merged static + live data
   */
  async getAllFaculty(): Promise<Faculty[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.fallbackMode) {
      return this.fallbackGetAllFaculty();
    }

    try {
      const staticData = await DuckDBService.getAllFaculty();
      return this.mergeData(staticData);
    } catch (error) {
      console.error('DuckDB query failed, falling back to API:', error);
      this.fallbackMode = true;
      return this.fallbackGetAllFaculty();
    }
  }

  /**
   * Search faculty by name
   */
  async searchFaculty(query: string): Promise<Faculty[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.fallbackMode) {
      return this.fallbackSearchFaculty(query);
    }

    try {
      const staticData = await DuckDBService.searchFaculty(query);
      return this.mergeData(staticData);
    } catch (error) {
      console.error('DuckDB search failed, falling back to API:', error);
      this.fallbackMode = true;
      return this.fallbackSearchFaculty(query);
    }
  }

  /**
   * Filter faculty by criteria
   */
  async filterFaculty(filters: FacultyFilters & { favoriteIds?: number[] }): Promise<Faculty[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.fallbackMode) {
      return this.fallbackFilterFaculty(filters);
    }

    try {
      let staticData = await DuckDBService.filterFaculty(filters);
      
      // Apply favorite filter in-memory if needed
      if (filters.favoriteIds && filters.favoriteIds.length > 0) {
        staticData = staticData.filter(f => filters.favoriteIds!.includes(f.id));
      }
      
      return this.mergeData(staticData);
    } catch (error) {
      console.error('DuckDB filter failed, falling back to API:', error);
      this.fallbackMode = true;
      return this.fallbackFilterFaculty(filters);
    }
  }

  /**
   * Get faculty by ID with absolute latest data from DB
   */
  async getFacultyById(id: number): Promise<Faculty | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // First try to get the record from DB for absolute freshness (Priority 1)
      const response = await fetch(`${BACKEND_URL}/api/faculty/${id}?t=${new Date().getTime()}`);
      if (response.ok) {
        const latestData = await response.json();
        console.log(`✨ Fetched absolute latest data for faculty ${id}`);
        return latestData;
      }
    } catch (error) {
      console.warn('Failed to fetch latest from DB, falling back to merged cache:', error);
    }

    // Fallback to merged snapshot data (Priority 2)
    try {
      const staticData = await DuckDBService.getFacultyById(id);
      if (!staticData) {
        return null;
      }
      
      const merged = this.mergeData([staticData]);
      return merged[0] || null;
    } catch (error) {
      console.error('Merged lookup failed, falling back to API:', error);
      this.fallbackMode = true;
      return this.fallbackGetFacultyById(id);
    }
  }

  /**
   * Check and update snapshot version if needed
   */
  async checkAndUpdateSnapshot(): Promise<boolean> {
    if (this.fallbackMode) {
      return false;
    }

    try {
      const { needsUpdate, serverVersion } = await DuckDBService.checkVersionSync();
      
      if (needsUpdate) {
        console.log(`📦 Updating snapshot: ${DuckDBService.getCurrentVersion()} → ${serverVersion}`);
        await DuckDBService.loadSnapshot(serverVersion);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Snapshot update check failed:', error);
      return false;
    }
  }

  /**
   * Merge static data with live data
   */
  private mergeData(staticData: FacultyStatic[]): Faculty[] {
    return staticData.map(faculty => {
      const liveData = this.liveDataCache.get(faculty.id);
      return {
        ...faculty,
        availability: liveData?.availability ?? false,
        unavailable_message: liveData?.unavailable_message,
      };
    });
  }

  // ===================================
  // Fallback methods using old API
  // ===================================

  private async fallbackGetAllFaculty(): Promise<Faculty[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty`);
      return await response.json();
    } catch (error) {
      console.error('Fallback API failed:', error);
      throw error;
    }
  }

  private async fallbackSearchFaculty(query: string): Promise<Faculty[]> {
    const allFaculty = await this.fallbackGetAllFaculty();
    const lowerQuery = query.toLowerCase();
    return allFaculty.filter(f => 
      f.name.toLowerCase().includes(lowerQuery)
    );
  }

  private async fallbackFilterFaculty(filters: FacultyFilters & { favoriteIds?: number[] }): Promise<Faculty[]> {
    const allFaculty = await this.fallbackGetAllFaculty();
    return allFaculty.filter(faculty => {
      if (filters.school && faculty.school !== filters.school) return false;
      if (filters.role && faculty.role !== filters.role) return false;
      if (filters.department && faculty.department !== filters.department) return false;
      if (filters.nameQuery && !faculty.name.toLowerCase().includes(filters.nameQuery.toLowerCase())) return false;
      if (filters.favoriteIds && !filters.favoriteIds.includes(faculty.id)) return false;
      return true;
    });
  }

  private async fallbackGetFacultyById(id: number): Promise<Faculty | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Fallback API failed:', error);
      return null;
    }
  }

  /**
   * Check if using fallback mode
   */
  isFallbackMode(): boolean {
    return this.fallbackMode;
  }
}

// Export singleton instance
export const FacultyService = new FacultyServiceClass();
