import { prisma } from './prisma';

export interface AuditLogParams {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Record an audit log entry in the MySQL database.
 * Fails gracefully without throwing to prevent breaking main business operations.
 */
export async function logAdminAction(params: AuditLogParams): Promise<void> {
  try {
    const {
      userId = 'system',
      action,
      resourceType,
      resourceId = null,
      beforeState = null,
      afterState = null,
      ipAddress = null,
      userAgent = null,
    } = params;

    await prisma.auditLog.create({
      data: {
        userId: userId || 'system',
        action,
        resourceType,
        resourceId: resourceId ? String(resourceId) : null,
        beforeState: beforeState ? JSON.stringify(beforeState) : null,
        afterState: afterState ? JSON.stringify(afterState) : null,
        ipAddress: ipAddress ? String(ipAddress) : null,
        userAgent: userAgent ? String(userAgent) : null,
      },
    });
  } catch (error) {
    console.warn('Failed to record audit log:', error);
  }
}

