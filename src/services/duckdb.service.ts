/**
 * DuckDB Service
 * 
 * Manages client-side DuckDB WASM instance for querying faculty static data
 * from Parquet snapshots.
 */

import * as duckdb from '@duckdb/duckdb-wasm';

const BACKEND_URL = 'http://localhost:8000';

export interface FacultyStatic {
  id: number;
  name: string;
  department: string;
  school: string;
  designation: string;
  role: string;
  cabin_number: string;
  phone_number: string;
  location_id: string;
  courses_taken: string[];
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
}

export interface FacultyFilters {
  school?: string;
  role?: string;
  department?: string;
  nameQuery?: string;
}

class DuckDBServiceClass {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;
  private initialized = false;
  private currentVersion: string | null = null;
  
  /**
   * Initialize DuckDB WASM instance
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('DuckDB already initialized');
      return;
    }

    try {
      console.log('🦆 Initializing DuckDB WASM...');
      
      // Manual bundle configuration for Vite compatibility
      // This avoids CORS issues with CDN workers
      const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-mvp.wasm',
          mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-browser-mvp.worker.js',
        },
        eh: {
          mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-eh.wasm',
          mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/duckdb-browser-eh.worker.js',
        },
      };
      
      // Select appropriate bundle based on browser capabilities
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
      
      // Create logger
      const logger = new duckdb.ConsoleLogger();
      
      // Fetch worker script as blob to avoid CORS issues
      const workerResponse = await fetch(bundle.mainWorker!);
      const workerBlob = await workerResponse.blob();
      const workerUrl = URL.createObjectURL(workerBlob);
      
      // Initialize worker with blob URL (same origin)
      const worker = new Worker(workerUrl, { type: 'module' });
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundle.mainModule);
      
      // Create connection
      this.conn = await this.db.connect();
      
      this.initialized = true;
      console.log('✅ DuckDB initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize DuckDB:', error);
      throw new Error(`DuckDB initialization failed: ${error}`);
    }
  }

  /**
   * Load Parquet snapshot from server
   */
  async loadSnapshot(version: string): Promise<void> {
    if (!this.initialized || !this.conn) {
      throw new Error('DuckDB not initialized');
    }

    try {
      console.log(`📥 Loading snapshot version: ${version}`);
      
      // Determine filename from version
      const filename = `faculty_static_${version}.parquet`;
      const url = `${BACKEND_URL}/api/snapshots/${filename}`;
      
      // Fetch Parquet file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch snapshot: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      console.log(`✅ Downloaded snapshot: ${(uint8Array.length / 1024).toFixed(2)} KB`);
      
      // Register file with DuckDB
      await this.db!.registerFileBuffer('faculty.parquet', uint8Array);
      
      // Create view from Parquet (or replace if exists)
      try {
        await this.conn.query('DROP VIEW IF EXISTS faculty_static');
        await this.conn.query(`
          CREATE VIEW faculty_static AS
          SELECT * FROM 'faculty.parquet'
        `);
      } catch (e) {
        // If view creation fails, try to use existing view
        console.warn('View creation warning:', e);
        // Try to query existing view to verify it works
        try {
          await this.conn.query('SELECT COUNT(*) FROM faculty_static');
          console.log('✅ Using existing faculty_static view');
        } catch (queryError) {
          throw new Error(`Failed to create or use faculty_static view: ${queryError}`);
        }
      }
      
      this.currentVersion = version;
      console.log('✅ Snapshot loaded successfully');
    } catch (error) {
      this.currentVersion = null; // Reset so next initialization retry can happen
      console.error('❌ Failed to load snapshot:', error);
      throw new Error(`Snapshot loading failed: ${error}`);
    }
  }

  /**
   * Clear everything to force a fresh reload
   */
  async reset(): Promise<void> {
    this.currentVersion = null;
    // Don't terminate DB, just clear registered files if possible
    // or just let loadSnapshot overwrite faculty.parquet
  }

  /**
   * Search faculty by name
   */
  async searchFaculty(query: string): Promise<FacultyStatic[]> {
    if (!this.initialized || !this.conn) {
      throw new Error('DuckDB not initialized');
    }

    try {
      const sanitizedQuery = query.toLowerCase().replace(/'/g, "''");
      
      const result = await this.conn.query(`
        SELECT * FROM faculty_static
        WHERE LOWER(name) LIKE '%${sanitizedQuery}%'
        ORDER BY name
      `);
      
      return result.toArray().map((row: any) => this.rowToFaculty(row));
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Filter faculty by criteria
   */
  async filterFaculty(filters: FacultyFilters): Promise<FacultyStatic[]> {
    if (!this.initialized || !this.conn) {
      throw new Error('DuckDB not initialized');
    }

    try {
      const conditions: string[] = [];
      
      if (filters.school) {
        const sanitized = filters.school.replace(/'/g, "''");
        conditions.push(`school = '${sanitized}'`);
      }
      
      if (filters.role) {
        const sanitized = filters.role.replace(/'/g, "''");
        conditions.push(`role = '${sanitized}'`);
      }
      
      if (filters.department) {
        const sanitized = filters.department.replace(/'/g, "''");
        conditions.push(`department = '${sanitized}'`);
      }
      
      if (filters.nameQuery) {
        const sanitized = filters.nameQuery.toLowerCase().replace(/'/g, "''");
        conditions.push(`LOWER(name) LIKE '%${sanitized}%'`);
      }
      
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}`
        : '';
      
      const result = await this.conn.query(`
        SELECT * FROM faculty_static
        ${whereClause}
        ORDER BY name
      `);
      
      return result.toArray().map((row: any) => this.rowToFaculty(row));
    } catch (error) {
      console.error('Filter failed:', error);
      throw error;
    }
  }

  /**
   * Get all faculty (use with caution for large datasets)
   */
  async getAllFaculty(): Promise<FacultyStatic[]> {
    if (!this.initialized || !this.conn) {
      throw new Error('DuckDB not initialized');
    }

    try {
      const result = await this.conn.query(`
        SELECT * FROM faculty_static
        ORDER BY name
      `);
      
      return result.toArray().map((row: any) => this.rowToFaculty(row));
    } catch (error) {
      console.error('Get all faculty failed:', error);
      throw error;
    }
  }

  /**
   * Get faculty by ID
   */
  async getFacultyById(id: number): Promise<FacultyStatic | null> {
    if (!this.initialized || !this.conn) {
      throw new Error('DuckDB not initialized');
    }

    try {
      const result = await this.conn.query(`
        SELECT * FROM faculty_static
        WHERE id = ${id}
      `);
      
      const rows = result.toArray();
      if (rows.length === 0) {
        return null;
      }
      
      return this.rowToFaculty(rows[0]);
    } catch (error) {
      console.error('Get faculty by ID failed:', error);
      throw error;
    }
  }

  /**
   * Check if snapshot version needs updating
   */
  async checkVersionSync(): Promise<{ needsUpdate: boolean; serverVersion: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/meta/snapshot-version`);
      const data = await response.json();
      const serverVersion = data.version;
      
      const needsUpdate = this.currentVersion !== serverVersion;
      
      return { needsUpdate, serverVersion };
    } catch (error) {
      console.error('Version check failed:', error);
      throw error;
    }
  }

  /**
   * Get current loaded version
   */
  getCurrentVersion(): string | null {
    return this.currentVersion;
  }

  /**
   * Convert DuckDB row to FacultyStatic object
   */
  private rowToFaculty(row: any): FacultyStatic {
    // Helper to ensure we have a standard JS array for courses_taken
    let courses: string[] = [];
    if (row.courses_taken) {
      if (Array.isArray(row.courses_taken)) {
        courses = row.courses_taken;
      } else if (typeof row.courses_taken.toArray === 'function') {
        courses = row.courses_taken.toArray();
      } else {
        courses = Array.from(row.courses_taken);
      }
    }

    return {
      // Use Number() to ensure ID matching with live data works (DuckDB may return BigInt)
      id: Number(row.id),
      name: row.name || '',
      department: row.department || '',
      school: row.school || '',
      designation: row.designation || '',
      role: row.role || '',
      cabin_number: row.cabin_number || '',
      phone_number: row.phone_number || '',
      location_id: row.location_id || '',
      courses_taken: courses,
      mon: row.mon || '00000000',
      tue: row.tue || '00000000',
      wed: row.wed || '00000000',
      thu: row.thu || '00000000',
      fri: row.fri || '00000000',
    };
  }

  /**
   * Cleanup DuckDB resources
   */
  async cleanup(): Promise<void> {
    if (this.conn) {
      await this.conn.close();
      this.conn = null;
    }
    if (this.db) {
      await this.db.terminate();
      this.db = null;
    }
    this.initialized = false;
    this.currentVersion = null;
  }
}

// Export singleton instance
export const DuckDBService = new DuckDBServiceClass();
