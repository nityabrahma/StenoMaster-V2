
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { validateRequest } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error || validation.user?.role !== 'teacher') {
        return NextResponse.json({ message: validation.error || 'Forbidden' }, { status: validation.status || 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const results = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'stenomaster-assignments',
            }, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }).end(buffer);
        });

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ message: 'Image upload failed', error: error.message }, { status: 500 });
    }
}
