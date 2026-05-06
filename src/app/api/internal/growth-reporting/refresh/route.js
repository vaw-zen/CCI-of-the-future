import { NextResponse } from 'next/server';
import { refreshGrowthReporting } from '@/libs/growthReporting.mjs';

export const runtime = 'nodejs';

function isAuthorizedCronRequest(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const userAgent = request.headers.get('user-agent') || '';
  const isVercelCron = userAgent.includes('vercel-cron/1.0');

  return Boolean(cronSecret && authHeader === `Bearer ${cronSecret}` && isVercelCron);
}

export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { ok: false, message: 'Not found' },
      { status: 404 }
    );
  }

  const startDate = request.nextUrl.searchParams.get('start');
  const endDate = request.nextUrl.searchParams.get('end');

  try {
    const result = await refreshGrowthReporting({
      startDate,
      endDate
    });

    return NextResponse.json({
      ok: true,
      refreshedAt: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Growth reporting refresh failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
