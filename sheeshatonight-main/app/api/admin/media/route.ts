import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';
import { readdir, stat, unlink, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface MediaFileInfo {
  name: string;
  url: string;
  size: number;
  sizeFormatted: string;
  updatedAt: string;
  type: string;
  extension: string;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function getFilesRecursively(dir: string, baseDir: string): Promise<MediaFileInfo[]> {
  const results: MediaFileInfo[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await getFilesRecursively(fullPath, baseDir);
        results.push(...nested);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.pdf'].includes(ext)) {
          const stats = await stat(fullPath);
          const relativePath = fullPath.substring(baseDir.length).replace(/\\/g, '/');
          const cleanUrl = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
          results.push({
            name: entry.name,
            url: cleanUrl,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            updatedAt: stats.mtime.toISOString(),
            type: ext === '.pdf' ? 'document' : 'image',
            extension: ext,
          });
        }
      }
    }
  } catch {
    // Ignore directory read error if not exists
  }
  return results;
}

// GET: List all media files
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');

    // Create uploads folder if missing
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {}

    const uploadFiles = await getFilesRecursively(uploadsDir, publicDir);

    // Also get root public image assets for convenient browsing
    const rootFiles: MediaFileInfo[] = [];
    try {
      const rootEntries = await readdir(publicDir, { withFileTypes: true });
      for (const entry of rootEntries) {
        if (!entry.isDirectory()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
            const stats = await stat(path.join(publicDir, entry.name));
            rootFiles.push({
              name: entry.name,
              url: `/${entry.name}`,
              size: stats.size,
              sizeFormatted: formatBytes(stats.size),
              updatedAt: stats.mtime.toISOString(),
              type: 'image',
              extension: ext,
            });
          }
        }
      }
    } catch {}

    const allMedia = [...uploadFiles, ...rootFiles].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return successResponse(allMedia, 'Media items retrieved successfully');
  } catch (error: any) {
    console.error('Media Library GET Error:', error);
    return errorResponse(error.message || 'Failed to list media library files', 500);
  }
});

// POST: Upload media or check usage
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const contentType = req.headers.get('content-type') || '';

    // If JSON action (e.g. check-usage)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { action, url } = body;

      if (action === 'check_usage') {
        if (!url) return errorResponse('Media URL is required', 400);

        const filename = path.basename(url);
        const usages: Array<{ module: string; recordId: string; title: string }> = [];

        // 1. Check Products
        const products = await prisma.product.findMany({
          where: {
            deletedAt: null,
          },
          select: { id: true, title: true, images: true },
        });

        for (const prod of products) {
          const imgStr = JSON.stringify(prod.images || '');
          if (imgStr.includes(url) || imgStr.includes(filename)) {
            usages.push({ module: 'Product', recordId: prod.id, title: prod.title });
          }
        }

        // 2. Check Categories
        const categories = await prisma.category.findMany({
          where: {
            OR: [
              { image: { contains: filename } },
              { icon: { contains: filename } },
            ],
          },
          select: { id: true, name: true },
        });

        for (const cat of categories) {
          usages.push({ module: 'Category', recordId: cat.id, title: cat.name });
        }

        // 3. Check Banners
        const banners = await prisma.cmsBanner.findMany({
          where: {
            OR: [
              { desktopImg: { contains: filename } },
              { mobileImg: { contains: filename } },
            ],
          },
          select: { id: true, heading: true, position: true },
        });

        for (const ban of banners) {
          usages.push({ module: 'Banner', recordId: ban.id, title: `${ban.position}: ${ban.heading}` });
        }

        // 4. Check CMS Pages
        const pages = await prisma.cmsPage.findMany({
          where: {
            OR: [
              { content: { contains: filename } },
              { ogImage: { contains: filename } },
            ],
          },
          select: { id: true, title: true, slug: true },
        });

        for (const pg of pages) {
          usages.push({ module: 'Page', recordId: pg.id, title: `${pg.title} (/${pg.slug})` });
        }

        // 5. Check CMS Content
        const cmsContents = await prisma.cmsContent.findMany();
        for (const c of cmsContents) {
          const cStr = JSON.stringify(c.value);
          if (cStr.includes(filename) || cStr.includes(url)) {
            usages.push({ module: 'CMS Setting', recordId: c.id, title: `CMS Block: ${c.key}` });
          }
        }

        return successResponse({
          url,
          isUsed: usages.length > 0,
          usageCount: usages.length,
          usages,
        });
      }

      return errorResponse('Invalid action', 400);
    }

    // Handle Multipart File Upload
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return errorResponse('No files received', 400);
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media');
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const randomString = crypto.randomBytes(6).toString('hex');
      const ext = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '-').substring(0, 30);
      const filename = `${cleanBase}-${timestamp}-${randomString}${ext}`;

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      const url = `/uploads/media/${filename}`;
      uploadedUrls.push(url);
    }

    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPLOAD_MEDIA',
      resourceType: 'MEDIA_LIBRARY',
      afterState: { filesCount: uploadedUrls.length, urls: uploadedUrls },
    });

    return successResponse({ urls: uploadedUrls }, 'Files uploaded successfully to Media Library');
  } catch (error: any) {
    console.error('Media Library POST Error:', error);
    return errorResponse(error.message || 'Failed to upload media', 500);
  }
});

// DELETE: Delete a media file with reference protection
export const DELETE = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const force = searchParams.get('force') === 'true';

    if (!url) return errorResponse('File URL is required', 400);

    // Sanitize path to prevent directory traversal
    const safeUrl = url.replace(/^[/\\]+/, '');
    if (safeUrl.includes('..') || (!safeUrl.startsWith('uploads/') && !/^[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp|svg|gif|pdf)$/i.test(safeUrl))) {
      return errorResponse('Invalid file path for deletion', 400);
    }

    const filename = path.basename(url);

    // Unless forced, check if referenced in DB
    if (!force) {
      const [banners, categories, pages] = await Promise.all([
        prisma.cmsBanner.count({
          where: { OR: [{ desktopImg: { contains: filename } }, { mobileImg: { contains: filename } }] },
        }),
        prisma.category.count({
          where: { OR: [{ image: { contains: filename } }, { icon: { contains: filename } }] },
        }),
        prisma.cmsPage.count({
          where: { OR: [{ content: { contains: filename } }, { ogImage: { contains: filename } }] },
        }),
      ]);

      const references = banners + categories + pages;
      if (references > 0) {
        return errorResponse(
          `Cannot delete: File is referenced in ${references} live database records (banners, categories, or pages). Use safe replacement or confirm force delete.`,
          409
        );
      }
    }

    const filePath = path.join(process.cwd(), 'public', safeUrl);
    await unlink(filePath);

    await logAdminAction({
      userId: req.user?.userId,
      action: 'DELETE_MEDIA_FILE',
      resourceType: 'MEDIA_LIBRARY',
      resourceId: url,
      beforeState: { path: safeUrl, forced: force },
    });

    return successResponse(null, 'Media file safely deleted from server filesystem');
  } catch (error: any) {
    console.error('Media Library DELETE Error:', error);
    return errorResponse(error.message || 'Failed to delete file', 500);
  }
});
