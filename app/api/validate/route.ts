import { NextResponse } from 'next/server';
import { validatePattern } from '@/lib/validator';

export async function POST(request: Request) {
  // Demo endpoint only: no uploads, persistence, or real customer patterns.
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 65_536) {
    return NextResponse.json({ error: 'Payload exceeds the 64 KiB demo limit.' }, { status: 413 });
  }
  try {
    const payload: unknown = await request.json();
    const report = validatePattern(payload);
    return NextResponse.json(report, { status: report.issues.some((i) => i.code === 'INVALID_INPUT') ? 400 : 200 });
  } catch {
    return NextResponse.json({ error: 'Request body must contain valid JSON.' }, { status: 400 });
  }
}
