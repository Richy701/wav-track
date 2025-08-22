// Intelligent Supabase Query Optimization
// Advanced batching, caching, and performance optimization for existing Supabase integration

import { supabase } from '@/lib/supabase'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

// Query batch manager for intelligent request grouping
export class SupabaseQueryBatcher {
  private batchQueue: Map<string, {
    queries: Array<{
      id: string
      table: string
      operation: 'select' | 'insert' | 'update' | 'delete'
      query: any
      resolve: (data: any) => void
      reject: (error: any) => void
      timestamp: number
    }>
    timeout: NodeJS.Timeout
  }> = new Map()

  private readonly BATCH_DELAY = 10 // 10ms batching window
  private readonly MAX_BATCH_SIZE = 25 // Supabase RPC limit consideration

  // Batch similar queries together
  async batchQuery<T>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    queryBuilder: () => PostgrestFilterBuilder<any, any, any>,
    batchKey?: string
  ): Promise<T> {
    const key = batchKey || `${table}_${operation}`
    const queryId = `${key}_${Date.now()}_${Math.random()}`

    return new Promise((resolve, reject) => {
      // Add to batch queue
      const queryEntry = {
        id: queryId,
        table,
        operation,
        query: queryBuilder,
        resolve,
        reject,
        timestamp: Date.now()
      }

      if (!this.batchQueue.has(key)) {
        this.batchQueue.set(key, {
          queries: [queryEntry],
          timeout: setTimeout(() => this.executeBatch(key), this.BATCH_DELAY)
        })
      } else {
        const batch = this.batchQueue.get(key)!
        batch.queries.push(queryEntry)

        // Execute immediately if batch is full
        if (batch.queries.length >= this.MAX_BATCH_SIZE) {
          clearTimeout(batch.timeout)
          this.executeBatch(key)
        }
      }
    })
  }

  private async executeBatch(batchKey: string): Promise<void> {
    const batch = this.batchQueue.get(batchKey)
    if (!batch) return

    this.batchQueue.delete(batchKey)

    // Group queries by operation type
    const selectQueries = batch.queries.filter(q => q.operation === 'select')
    const insertQueries = batch.queries.filter(q => q.operation === 'insert')
    const updateQueries = batch.queries.filter(q => q.operation === 'update')
    const deleteQueries = batch.queries.filter(q => q.operation === 'delete')

    // Execute batched selects
    if (selectQueries.length > 0) {
      await this.executeBatchedSelects(selectQueries)
    }

    // Execute batched inserts
    if (insertQueries.length > 0) {
      await this.executeBatchedInserts(insertQueries)
    }

    // Execute individual updates/deletes (harder to batch efficiently)
    for (const query of [...updateQueries, ...deleteQueries]) {
      try {
        const result = await query.query().single()
        query.resolve(result)
      } catch (error) {
        query.reject(error)
      }
    }
  }

  private async executeBatchedSelects(queries: any[]): Promise<void> {
    // For selects, we can use RPC to execute multiple queries efficiently
    try {
      const results = await Promise.allSettled(
        queries.map(q => q.query())
      )

      results.forEach((result, index) => {
        const query = queries[index]
        if (result.status === 'fulfilled') {
          query.resolve(result.value)
        } else {
          query.reject(result.reason)
        }
      })
    } catch (error) {
      queries.forEach(q => q.reject(error))
    }
  }

  private async executeBatchedInserts(queries: any[]): Promise<void> {
    // Group inserts by table for efficient batch inserts
    const tableGroups = new Map<string, any[]>()

    queries.forEach(query => {
      if (!tableGroups.has(query.table)) {
        tableGroups.set(query.table, [])
      }
      tableGroups.get(query.table)!.push(query)
    })

    for (const [table, tableQueries] of tableGroups.entries()) {
      try {
        // Extract insert data from queries
        const insertData = tableQueries.map(q => {
          // This is a simplified extraction - would need more sophisticated parsing
          return {} // Placeholder for actual data extraction
        })

        const { data, error } = await supabase
          .from(table)
          .insert(insertData)
          .select()

        if (error) throw error

        // Resolve all queries for this table
        tableQueries.forEach((query, index) => {
          query.resolve({ data: data?.[index], error: null })
        })

      } catch (error) {
        tableQueries.forEach(q => q.reject(error))
      }
    }
  }
}

// Advanced caching layer with intelligent invalidation
export class SupabaseIntelligentCache {
  private cache: Map<string, {
    data: any
    timestamp: number
    dependencies: Set<string>
    staleTime: number
  }> = new Map()

  private subscriptions: Map<string, {
    channel: any
    tables: string[]
    callback: (data: any) => void
  }> = new Map()

  // Cache with dependency tracking
  set(
    key: string,
    data: any,
    staleTime: number = 5 * 60 * 1000, // 5 minutes default
    dependencies: string[] = []
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      dependencies: new Set(dependencies),
      staleTime
    })

    // Set up real-time invalidation for dependencies
    this.setupRealTimeInvalidation(key, dependencies)
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if stale
    if (Date.now() - cached.timestamp > cached.staleTime) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  // Invalidate cache based on table changes
  invalidate(pattern: string | RegExp): void {
    const keysToDelete: string[] = []

    for (const [key, cached] of this.cache.entries()) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern) || cached.dependencies.has(pattern)) {
          keysToDelete.push(key)
        }
      } else {
        if (pattern.test(key)) {
          keysToDelete.push(key)
        }
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  private setupRealTimeInvalidation(cacheKey: string, dependencies: string[]): void {
    if (dependencies.length === 0) return

    const subscriptionKey = dependencies.sort().join('_')
    
    if (!this.subscriptions.has(subscriptionKey)) {
      const channel = supabase.channel(`cache_invalidation_${subscriptionKey}`)

      dependencies.forEach(table => {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table
          },
          () => {
            // Invalidate all cached entries that depend on this table
            this.invalidate(table)
          }
        )
      })

      channel.subscribe()

      this.subscriptions.set(subscriptionKey, {
        channel,
        tables: dependencies,
        callback: () => this.invalidate(subscriptionKey)
      })
    }
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.staleTime) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))
  }

  // Get cache statistics
  getStats(): {
    totalEntries: number
    staleEntries: number
    memoryUsage: number
    hitRate: number
  } {
    const now = Date.now()
    let staleCount = 0
    let memoryUsage = 0

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.staleTime) {
        staleCount++
      }
      memoryUsage += JSON.stringify({ key, ...cached }).length
    }

    return {
      totalEntries: this.cache.size,
      staleEntries: staleCount,
      memoryUsage,
      hitRate: 0 // Would need to track hits/misses for accurate rate
    }
  }
}

// Performance monitoring and optimization
export class SupabasePerformanceMonitor {
  private metrics: {
    queryTimes: Array<{ query: string; duration: number; timestamp: number }>
    cacheHits: number
    cacheMisses: number
    batchEfficiency: number
    errorRates: Map<string, number>
  } = {
    queryTimes: [],
    cacheHits: 0,
    cacheMisses: 0,
    batchEfficiency: 0,
    errorRates: new Map()
  }

  private slowQueryThreshold = 1000 // 1 second
  private maxMetricsHistory = 1000

  // Wrap query execution with monitoring
  async monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    const startTime = performance.now()
    let error: Error | null = null

    try {
      const result = await queryFn()
      return result
    } catch (e) {
      error = e as Error
      this.recordError(queryName, error)
      throw e
    } finally {
      const duration = performance.now() - startTime
      this.recordQuery(queryName, duration)

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  private recordQuery(queryName: string, duration: number): void {
    this.metrics.queryTimes.push({
      query: queryName,
      duration,
      timestamp: Date.now()
    })

    // Keep only recent metrics
    if (this.metrics.queryTimes.length > this.maxMetricsHistory) {
      this.metrics.queryTimes.shift()
    }
  }

  private recordError(queryName: string, error: Error): void {
    const errorKey = `${queryName}:${error.constructor.name}`
    this.metrics.errorRates.set(
      errorKey,
      (this.metrics.errorRates.get(errorKey) || 0) + 1
    )
  }

  recordCacheHit(): void {
    this.metrics.cacheHits++
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++
  }

  // Get performance insights
  getPerformanceReport(): {
    averageQueryTime: number
    slowQueries: Array<{ query: string; avgDuration: number; count: number }>
    cacheEfficiency: number
    topErrors: Array<{ error: string; count: number }>
    recommendations: string[]
  } {
    const recentQueries = this.metrics.queryTimes.filter(
      q => Date.now() - q.timestamp < 60 * 60 * 1000 // Last hour
    )

    const averageQueryTime = recentQueries.length > 0
      ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length
      : 0

    // Group by query name for slow query analysis
    const queryGroups = new Map<string, number[]>()
    recentQueries.forEach(q => {
      if (!queryGroups.has(q.query)) {
        queryGroups.set(q.query, [])
      }
      queryGroups.get(q.query)!.push(q.duration)
    })

    const slowQueries = Array.from(queryGroups.entries())
      .map(([query, durations]) => ({
        query,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        count: durations.length
      }))
      .filter(q => q.avgDuration > this.slowQueryThreshold)
      .sort((a, b) => b.avgDuration - a.avgDuration)

    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses
    const cacheEfficiency = totalCacheRequests > 0 
      ? this.metrics.cacheHits / totalCacheRequests 
      : 0

    const topErrors = Array.from(this.metrics.errorRates.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Generate recommendations
    const recommendations: string[] = []
    
    if (averageQueryTime > 500) {
      recommendations.push('Consider adding database indexes for frequently queried columns')
    }
    
    if (cacheEfficiency < 0.7) {
      recommendations.push('Increase cache hit rate by optimizing cache keys and stale times')
    }
    
    if (slowQueries.length > 0) {
      recommendations.push(`Optimize slow queries: ${slowQueries[0].query}`)
    }

    if (topErrors.length > 0) {
      recommendations.push(`Address frequent errors: ${topErrors[0].error}`)
    }

    return {
      averageQueryTime,
      slowQueries,
      cacheEfficiency,
      topErrors,
      recommendations
    }
  }
}

// Advanced Row Level Security optimization
export class SupabaseRLSOptimizer {
  // Optimize RLS policies with user context caching
  static optimizeUserContext(userId: string): string {
    // Cache user permissions and context for faster RLS evaluation
    return `
      WITH user_context AS (
        SELECT 
          auth.uid() as user_id,
          COALESCE(profiles.role, 'user') as user_role,
          profiles.permissions
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    `
  }

  // Generate optimized RLS policies for collaborative features
  static generateCollaborativeRLSPolicy(tableName: string): {
    select: string
    insert: string
    update: string
    delete: string
  } {
    return {
      select: `
        CREATE POLICY "${tableName}_select" ON ${tableName}
        FOR SELECT USING (
          auth.uid() = user_id OR
          auth.uid() IN (
            SELECT wp.user_id 
            FROM workspace_participants wp 
            WHERE wp.workspace_id = ${tableName}.workspace_id
          )
        );
      `,
      insert: `
        CREATE POLICY "${tableName}_insert" ON ${tableName}
        FOR INSERT WITH CHECK (
          auth.uid() = user_id AND
          EXISTS (
            SELECT 1 FROM workspace_participants wp
            WHERE wp.workspace_id = ${tableName}.workspace_id
            AND wp.user_id = auth.uid()
            AND wp.role IN ('owner', 'collaborator')
          )
        );
      `,
      update: `
        CREATE POLICY "${tableName}_update" ON ${tableName}
        FOR UPDATE USING (
          auth.uid() = user_id OR
          EXISTS (
            SELECT 1 FROM workspace_participants wp
            WHERE wp.workspace_id = ${tableName}.workspace_id
            AND wp.user_id = auth.uid()
            AND wp.role IN ('owner', 'collaborator')
          )
        );
      `,
      delete: `
        CREATE POLICY "${tableName}_delete" ON ${tableName}
        FOR DELETE USING (
          auth.uid() = user_id OR
          EXISTS (
            SELECT 1 FROM workspace_participants wp
            WHERE wp.workspace_id = ${tableName}.workspace_id
            AND wp.user_id = auth.uid()
            AND wp.role = 'owner'
          )
        );
      `
    }
  }
}

// Singleton instances for global use
export const queryBatcher = new SupabaseQueryBatcher()
export const intelligentCache = new SupabaseIntelligentCache()
export const performanceMonitor = new SupabasePerformanceMonitor()

// Enhanced Supabase client with optimization features
export class OptimizedSupabaseClient {
  constructor(
    private useQueryBatching: boolean = true,
    private useIntelligentCache: boolean = true,
    private usePerformanceMonitoring: boolean = true
  ) {}

  // Optimized select with caching and batching
  async optimizedSelect<T>(
    table: string,
    queryBuilder: (builder: any) => any,
    cacheKey?: string,
    cacheDependencies: string[] = [],
    staleTime: number = 5 * 60 * 1000
  ): Promise<T> {
    const finalCacheKey = cacheKey || `select_${table}_${JSON.stringify(queryBuilder.toString())}`

    // Try cache first
    if (this.useIntelligentCache) {
      const cached = intelligentCache.get(finalCacheKey)
      if (cached) {
        if (this.usePerformanceMonitoring) {
          performanceMonitor.recordCacheHit()
        }
        return cached
      }
      
      if (this.usePerformanceMonitoring) {
        performanceMonitor.recordCacheMiss()
      }
    }

    // Execute query with optional batching
    const executeQuery = () => {
      if (this.useQueryBatching) {
        return queryBatcher.batchQuery<T>(
          table,
          'select',
          () => queryBuilder(supabase.from(table))
        )
      } else {
        return queryBuilder(supabase.from(table))
      }
    }

    const queryFn = this.usePerformanceMonitoring
      ? () => performanceMonitor.monitorQuery(`select_${table}`, executeQuery)
      : executeQuery

    const result = await queryFn()

    // Cache the result
    if (this.useIntelligentCache) {
      intelligentCache.set(finalCacheKey, result, staleTime, [table, ...cacheDependencies])
    }

    return result
  }

  // Optimized insert with batching
  async optimizedInsert<T>(
    table: string,
    data: any | any[],
    options: { batch?: boolean } = {}
  ): Promise<T> {
    const executeQuery = () => {
      if (options.batch && this.useQueryBatching && Array.isArray(data)) {
        // Use native Supabase batch insert for arrays
        return supabase.from(table).insert(data).select()
      } else {
        return supabase.from(table).insert(data).select()
      }
    }

    const queryFn = this.usePerformanceMonitoring
      ? () => performanceMonitor.monitorQuery(`insert_${table}`, executeQuery)
      : executeQuery

    const result = await queryFn()

    // Invalidate related cache entries
    if (this.useIntelligentCache) {
      intelligentCache.invalidate(table)
    }

    return result
  }

  // Get performance metrics
  getMetrics() {
    if (this.usePerformanceMonitoring) {
      return performanceMonitor.getPerformanceReport()
    }
    return null
  }

  // Manual cache cleanup
  cleanupCache(): void {
    if (this.useIntelligentCache) {
      intelligentCache.cleanup()
    }
  }
}

// Export optimized client instance
export const optimizedSupabase = new OptimizedSupabaseClient(true, true, true)

// Setup periodic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    intelligentCache.cleanup()
  }, 5 * 60 * 1000) // Cleanup every 5 minutes
}