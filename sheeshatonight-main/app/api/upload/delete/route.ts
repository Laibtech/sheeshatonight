import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

/**
 * DELETE /api/upload/delete
 * Delete uploaded images from filesystem
 * Body: { urls: string[] }
 */
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Vendor permissions required to delete assets' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided' },
        { status: 400 }
      );
    }

    const results = [];

    for (const url of urls) {
      try {
        // Extract filename from URL (e.g., /uploads/products/filename.jpg)
        if (!url || typeof url !== 'string' || !url.startsWith('/uploads/products/')) {
          results.push({ url, success: false, error: 'Invalid URL format' });
          continue;
        }

        const filename = path.basename(url);
        // Ensure strictly alphanumeric with safe characters to prevent directory traversal
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
          results.push({ url, success: false, error: 'Invalid filename' });
          continue;
        }

        const filepath = path.join(process.cwd(), 'public', 'uploads', 'products', filename);

        // Delete file
        await unlink(filepath);
        results.push({ url, success: true });

      } catch (err) {
        results.push({ 
          url, 
          success: false, 
          error: err instanceof Error ? err.message : 'Failed to delete'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Deleted ${successCount} of ${urls.length} file(s)`,
      results,
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete files' },
      { status: 500 }
    );
  }
});
