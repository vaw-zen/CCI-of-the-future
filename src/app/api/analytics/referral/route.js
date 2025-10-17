import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.source || !data.page) {
      return NextResponse.json(
        { error: 'Missing required fields: source, page' },
        { status: 400 }
      );
    }

    // Create referral log entry
    const referralEntry = {
      id: Date.now().toString(),
      source: data.source,
      referrer: data.referrer || '',
      page: data.page,
      timestamp: data.timestamp || new Date().toISOString(),
      user_agent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Log to daily file
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(reportsDir, `facebook-referrals-${today}.json`);
    
    let existingLogs = [];
    if (fs.existsSync(logFile)) {
      try {
        existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (error) {
        console.error('Error reading existing logs:', error);
      }
    }

    existingLogs.push(referralEntry);
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));

    // Also log to a consolidated file
    const consolidatedFile = path.join(reportsDir, 'facebook-referrals-all.json');
    let allLogs = [];
    if (fs.existsSync(consolidatedFile)) {
      try {
        allLogs = JSON.parse(fs.readFileSync(consolidatedFile, 'utf8'));
      } catch (error) {
        console.error('Error reading consolidated logs:', error);
      }
    }

    allLogs.push(referralEntry);
    // Keep only last 1000 entries
    if (allLogs.length > 1000) {
      allLogs = allLogs.slice(-1000);
    }
    fs.writeFileSync(consolidatedFile, JSON.stringify(allLogs, null, 2));

    return NextResponse.json(
      { 
        success: true, 
        message: 'Referral logged successfully',
        id: referralEntry.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error logging Facebook referral:', error);
    return NextResponse.json(
      { error: 'Failed to log referral' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
    const logFile = path.join(reportsDir, `facebook-referrals-${date}.json`);
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json(
        { 
          date,
          referrals: [],
          total: 0,
          message: 'No referrals found for this date'
        },
        { status: 200 }
      );
    }

    const referrals = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    
    // Generate summary
    const summary = {
      date,
      total: referrals.length,
      by_page: {},
      by_hour: {},
      referrals
    };

    // Group by page
    referrals.forEach(ref => {
      summary.by_page[ref.page] = (summary.by_page[ref.page] || 0) + 1;
      
      const hour = new Date(ref.timestamp).getHours();
      summary.by_hour[hour] = (summary.by_hour[hour] || 0) + 1;
    });

    return NextResponse.json(summary, { status: 200 });

  } catch (error) {
    console.error('Error retrieving Facebook referrals:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve referrals' },
      { status: 500 }
    );
  }
}