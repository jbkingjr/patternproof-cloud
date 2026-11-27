import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

export async function POST() {
  const bucketName = process.env.PATTERNPROOF_BUCKET;

  if (!bucketName) {
    return NextResponse.json(
      { error: 'Storage bucket is not configured.' },
      { status: 500 }
    );
  }

  const sample = {
    name: 'Week 5 synthetic test pattern',
    rows: [
      { number: 1, stitches: ['sc', 'sc'], declaredCount: 2 }
    ]
  };

  const objectName = `week5-tests/${randomUUID()}.json`;

  try {
    const storage = new Storage();

    await storage.bucket(bucketName).file(objectName).save(
      JSON.stringify(sample, null, 2),
      {
        contentType: 'application/json',
        resumable: false
      }
    );

    return NextResponse.json({
      status: 'created',
      bucket: bucketName,
      object: objectName
    });
  } catch (error) {
    console.error('Cloud Storage write failed:', error);

    return NextResponse.json(
      { error: 'Cloud Storage write failed.' },
      { status: 502 }
    );
  }
}
