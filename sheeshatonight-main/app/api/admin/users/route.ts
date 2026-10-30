import { NextResponse } from 'next/server';
import { withAdmin, successResponse, errorResponse, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { getPaginationParams, buildPaginationResponse } from '@/lib/utils';
import { logAdminAction } from '@/lib/audit';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users
 * Get all users with filters and pagination (Admin only)
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip, take } = getPaginationParams(searchParams);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const adminRole = searchParams.get('adminRole');
    const status = searchParams.get('status');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role && ['CUSTOMER', 'VENDOR', 'ADMIN'].includes(role)) {
      where.role = role;
    }
    if (adminRole) {
      where.adminRole = adminRole;
    }
    if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          adminRole: true,
          adminPermissions: true,
          verified: true,
          kycStatus: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          vendor: {
            select: {
              id: true,
              name: true,
              tier: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      buildPaginationResponse(users, total, page, pageSize),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get admin users error:', error);
    return errorResponse('Failed to fetch users', 500);
  }
});

/**
 * POST /api/admin/users
 * Create / Invite new staff administrator or customer
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { name, email, password, phone, role = 'ADMIN', adminRole = 'ADMIN_MANAGER', adminPermissions, status = 'ACTIVE' } = body;

    if (!email || !name) {
      return errorResponse('Name and email are required', 400);
    }

    if (!password || password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return errorResponse('A user with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        role: role as any,
        adminRole: role === 'ADMIN' ? adminRole : null,
        adminPermissions: role === 'ADMIN' && adminPermissions ? adminPermissions : null,
        status: status as any,
        verified: true,
        kycStatus: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        adminRole: true,
        adminPermissions: true,
        status: true,
        createdAt: true,
      },
    });

    // Record audit log
    await logAdminAction({
      userId: req.user?.userId || 'admin',
      action: 'CREATE_STAFF_USER',
      resourceType: 'User',
      resourceId: newUser.id,
      afterState: { email: newUser.email, role: newUser.role, adminRole: newUser.adminRole },
    });

    return successResponse(newUser, 'Staff administrator account created successfully', 201);
  } catch (error: any) {
    console.error('Create admin user error:', error);
    return errorResponse(error.message || 'Failed to create user', 500);
  }
});

/**
 * PATCH /api/admin/users
 * Update staff role, permissions, status, or credentials
 */
export const PATCH = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { id, name, phone, role, adminRole, adminPermissions, status, password } = body;

    if (!id) {
      return errorResponse('User ID is required', 400);
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse('User not found', 404);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (adminRole !== undefined) updateData.adminRole = adminRole;
    if (adminPermissions !== undefined) updateData.adminPermissions = adminPermissions;
    if (status !== undefined) updateData.status = status;
    if (password && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        adminRole: true,
        adminPermissions: true,
        status: true,
        updatedAt: true,
      },
    });

    // Record audit log
    await logAdminAction({
      userId: req.user?.userId || 'admin',
      action: 'UPDATE_STAFF_USER',
      resourceType: 'User',
      resourceId: id,
      beforeState: { role: existing.role, adminRole: existing.adminRole, status: existing.status },
      afterState: { role: updatedUser.role, adminRole: updatedUser.adminRole, status: updatedUser.status },
    });

    return successResponse(updatedUser, 'User privileges updated successfully');
  } catch (error: any) {
    console.error('Update admin user error:', error);
    return errorResponse(error.message || 'Failed to update user', 500);
  }
});

/**
 * DELETE /api/admin/users
 * Remove staff account (with protection against self-deletion)
 */
export const DELETE = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('User ID is required', 400);
    }

    // Check if trying to delete own account
    if (req.user?.userId === id) {
      return errorResponse('You cannot delete your own administrator account', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    await prisma.user.delete({
      where: { id },
    });

    // Record audit log
    await logAdminAction({
      userId: req.user?.userId || 'admin',
      action: 'DELETE_STAFF_USER',
      resourceType: 'User',
      resourceId: id,
      beforeState: { email: targetUser.email, role: targetUser.role },
    });

    return successResponse(null, 'Staff administrator account deleted successfully');
  } catch (error: any) {
    console.error('Delete admin user error:', error);
    return errorResponse(error.message || 'Failed to delete user', 500);
  }
});
