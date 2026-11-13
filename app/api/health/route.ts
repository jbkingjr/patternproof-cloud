import { NextResponse } from 'next/server';
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'patternproof-cloud', phase: 'week-3-prototype' });
}
