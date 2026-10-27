import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { rateLimiters, withRateLimit } from '@/lib/rateLimiter';

/**
 * POST /api/upload
 * Upload images to local filesystem (public/uploads)
 * Returns array of URLs
 */
export const POST = withRateLimit(rateLimiters.upload, withAuth(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 files can be uploaded per request' },
        { status: 400 }
      );
    }

    // Validate file types and extensions strictly
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const safeExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP` },
          { status: 400 }
        );
      }

      const rawExt = path.extname(file.name).toLowerCase();
      if (!safeExtensions.has(rawExt)) {
        return NextResponse.json(
          { error: `Invalid file extension: ${rawExt}. Allowed: .jpg, .jpeg, .png, .webp` },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max size: 5MB` },
          { status: 400 }
        );
      }
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, ignore error
    }

    const uploadedUrls: string[] = [];

    // Process each file
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate strictly sanitized unique filename with cryptographically random identifier
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const safeExtension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
      const filename = `product-${timestamp}-${randomString}${safeExtension}`;

      // Write file
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // Return URL relative to public folder
      const url = `/uploads/products/${filename}`;
      uploadedUrls.push(url);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} file(s)`,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}));
