import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';

export const runtime = 'nodejs';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const userAgent = request.headers.get('user-agent') || '';
  const isVercelCron = userAgent.includes('vercel-cron/1.0');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}` || !isVercelCron) {
    return NextResponse.json(
      { ok: false, message: 'Not found' },
      { status: 404 }
    );
  }

  try {
    const supabase = createServiceClient();

    // Lightweight query to touch PostgREST/DB without returning real data.
    const { error } = await supabase
      .from('devis_requests')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, message: 'Supabase keep-alive failed', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Supabase keep-alive succeeded',
      at: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Keep-alive route failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
