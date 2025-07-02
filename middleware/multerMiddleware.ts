import multer from 'multer';
import { NextRequest } from 'next/server';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function multerMiddleware(req: NextRequest): Promise<{ fields: { [key: string]: string | string[] }; files: Express.Multer.File[] }> {
  const formData = await req.formData();
  const fields: { [key: string]: string | string[] } = {};
  const files: Express.Multer.File[] = [];

  // Process form data
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file uploads
      const buffer = Buffer.from(await value.arrayBuffer());
      files.push({
        fieldname: key,
        originalname: value.name,
        encoding: '7bit',
        mimetype: value.type,
        size: value.size,
        buffer: buffer,
        stream: null as any, // Not used with memoryStorage
        destination: '',
        filename: '',
        path: '',
      });
    } else {
      // Handle text fields
      if (fields[key]) {
        if (Array.isArray(fields[key])) {
          (fields[key] as string[]).push(value.toString());
        } else {
          fields[key] = [fields[key] as string, value.toString()];
        }
      } else {
        fields[key] = value.toString();
      }
    }
  }

  // Use multer to validate files (optional, can be moved to route)
  return new Promise((resolve, reject) => {
    upload.any()(req as any, {} as any, (err: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}