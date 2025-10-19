import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return new NextResponse('Filename required', { status: 400 });
    }

    // Security check - only allow specific image extensions
    if (!filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return new NextResponse('Invalid file type', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'thumbnails', filename);
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const extension = path.extname(filename).toLowerCase();
    
    let contentType = 'image/jpeg';
    if (extension === '.png') contentType = 'image/png';
    else if (extension === '.webp') contentType = 'image/webp';
    else if (extension === '.gif') contentType = 'image/gif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Error serving thumbnail:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}