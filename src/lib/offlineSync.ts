// Offline Sync Queue Manager using IndexedDB
// Handles queuing operations when offline and syncing when back online

const DB_NAME = 'hms-offline-db';
const DB_VERSION = 1;
const SYNC_QUEUE_STORE = 'sync-queue';
const CACHE_STORE = 'data-cache';

interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

class OfflineSyncManager {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(status: 'online' | 'offline' | 'syncing' | 'synced' | 'error') => void> = new Set();

  constructor() {
    this.init();
    this.setupNetworkListeners();
  }

  private async init() {
    try {
      this.db = await this.openDatabase();
      console.log('OfflineSyncManager initialized');
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create sync queue store
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('table', 'table', { unique: false });
        }

        // Create cache store
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  public onStatusChange(callback: (status: 'online' | 'offline' | 'syncing' | 'synced' | 'error') => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(status: 'online' | 'offline' | 'syncing' | 'synced' | 'error') {
    this.listeners.forEach(listener => listener(status));
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Add item to sync queue
  public async queueOperation(
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const item: SyncQueueItem = {
      id: `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      table,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item.id);
        // Try to sync immediately if online
        if (this.isOnline) {
          this.processSyncQueue();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get pending sync items
  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(SYNC_QUEUE_STORE, 'readonly');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Process sync queue
  public async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || !this.db) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners('syncing');

    try {
      const items = await this.getPendingSyncItems();
      
      if (items.length === 0) {
        this.notifyListeners('synced');
        return;
      }

      // Sort by timestamp
      items.sort((a, b) => a.timestamp - b.timestamp);

      for (const item of items) {
        try {
          await this.processQueueItem(item);
          await this.removeFromQueue(item.id);
        } catch (error) {
          // Update retry count
          item.retries++;
          item.lastError = error instanceof Error ? error.message : 'Unknown error';
          
          if (item.retries >= 3) {
            // Move to failed queue or remove after max retries
            await this.removeFromQueue(item.id);
            console.error(`Sync failed for item ${item.id} after 3 retries:`, error);
          } else {
            await this.updateQueueItem(item);
          }
        }
      }

      const remaining = await this.getPendingSyncItems();
      if (remaining.length === 0) {
        this.notifyListeners('synced');
      } else {
        this.notifyListeners('error');
      }
    } catch (error) {
      console.error('Sync queue processing failed:', error);
      this.notifyListeners('error');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    // Import supabase dynamically to avoid circular dependencies
    const { supabase } = await import('@/integrations/supabase/client');

    switch (item.operation) {
      case 'insert':
        const { error: insertError } = await supabase
          .from(item.table as any)
          .insert(item.data);
        if (insertError) throw insertError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(item.table as any)
          .update(item.data)
          .eq('id', item.data.id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(item.table as any)
          .delete()
          .eq('id', item.data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async removeFromQueue(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateQueueItem(item: SyncQueueItem): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data for offline access
  public async cacheData(key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    if (!this.db) return;

    const item: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlSeconds * 1000),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(CACHE_STORE, 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  public async getCachedData<T>(key: string): Promise<T | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(CACHE_STORE, 'readonly');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result as CacheItem | undefined;
        if (!item) {
          resolve(null);
          return;
        }

        // Check if expired
        if (item.expiresAt < Date.now()) {
          // Clean up expired item
          this.clearCachedData(key);
          resolve(null);
          return;
        }

        resolve(item.data as T);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Clear specific cached data
  public async clearCachedData(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(CACHE_STORE, 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all expired cache
  public async clearExpiredCache(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(CACHE_STORE, 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(Date.now());
    
    const request = index.openCursor(range);
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }
}

// Singleton instance
export const offlineSyncManager = new OfflineSyncManager();

// Hook for React components
export function useOfflineSync() {
  const [status, setStatus] = React.useState<'online' | 'offline' | 'syncing' | 'synced' | 'error'>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = offlineSyncManager.onStatusChange(setStatus);
    
    const updatePendingCount = async () => {
      const items = await offlineSyncManager.getPendingSyncItems();
      setPendingCount(items.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    status,
    isOnline: status === 'online' || status === 'syncing' || status === 'synced',
    pendingCount,
    queueOperation: offlineSyncManager.queueOperation.bind(offlineSyncManager),
    processSyncQueue: offlineSyncManager.processSyncQueue.bind(offlineSyncManager),
    cacheData: offlineSyncManager.cacheData.bind(offlineSyncManager),
    getCachedData: offlineSyncManager.getCachedData.bind(offlineSyncManager),
  };
}

// Need to import React for the hook
import React from 'react';
