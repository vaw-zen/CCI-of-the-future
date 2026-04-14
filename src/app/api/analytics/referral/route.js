import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Referral logging endpoint has been disabled.'
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Referral logging endpoint has been disabled.'
    },
    { status: 410 }
  );
}
