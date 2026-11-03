import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const REQUIRED_TABLES = [
  'user',
  'vendor',
  'product',
  'order',
  'orderitem',
  'invoice',
  'notification',
  'category',
  'cmscontent',
  'platformsetting',
];

/**
 * GET /api/health
 * Comprehensive production health-check verifying Next.js runtime,
 * live MySQL connection, Prisma query execution, required tables, and query latency.
 */
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const startTime = performance.now();

  try {
    // 1. Live Query Execution & Latency Benchmark
    const dbInfoRaw = await prisma.$queryRawUnsafe<Array<{ ping: number; db: string; version: string }>>(
      'SELECT 1 as ping, DATABASE() as db, VERSION() as version'
    );
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    const firstRow = dbInfoRaw && dbInfoRaw.length > 0 ? dbInfoRaw[0] : null;
    const dbName = firstRow?.db || 'unknown';
    const dbVersion = firstRow?.version || 'unknown';

    // 2. Inspect Available Tables in Active Database
    const tablesRaw = await prisma.$queryRawUnsafe<Array<Record<string, string>>>('SHOW TABLES');
    const existingTables = (tablesRaw || []).map((t) => {
      const vals = Object.values(t);
      return vals.length > 0 && typeof vals[0] === 'string' ? vals[0].toLowerCase() : '';
    });

    const missingTables = REQUIRED_TABLES.filter((t) => !existingTables.includes(t));
    const allRequiredTablesPresent = missingTables.length === 0;

    // 3. Determine Overall Health Status
    let overallStatus: 'Healthy' | 'Degraded' | 'Database Disconnected' = 'Healthy';
    let dbStatus: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED' = 'CONNECTED';

    if (!allRequiredTablesPresent) {
      overallStatus = 'Degraded';
      dbStatus = 'DEGRADED';
    } else if (latencyMs > 1500) {
      overallStatus = 'Degraded';
      dbStatus = 'DEGRADED';
    }

    return NextResponse.json(
      {
        status: overallStatus,
        application: {
          status: 'UP',
          environment: process.env.NODE_ENV || 'development',
          uptimeSeconds: Math.round(process.uptime()),
          timestamp,
        },
        database: {
          status: dbStatus,
          engine: 'MySQL / MariaDB',
          version: dbVersion,
          databaseName: dbName,
          latencyMs,
          tablesCount: existingTables.length,
          requiredTablesPresent: allRequiredTablesPresent,
          missingTables,
        },
      },
      {
        status: overallStatus === 'Healthy' ? 200 : 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    console.error('[HealthCheck] Database connection failure:', error);

    return NextResponse.json(
      {
        status: 'Database Disconnected',
        application: {
          status: 'UP',
          environment: process.env.NODE_ENV || 'development',
          uptimeSeconds: Math.round(process.uptime()),
          timestamp,
        },
        database: {
          status: 'DISCONNECTED',
          engine: 'MySQL / MariaDB',
          latencyMs,
          error: error.message || 'Unable to establish database connection',
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
