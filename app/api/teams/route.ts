import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/Team';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { teamName, captainPhone, players, paymentScreenshot } = body;

    // Validation
    if (!teamName || !captainPhone || !players || players.length !== 8) {
      return NextResponse.json(
        { success: false, error: 'Invalid team data' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(captainPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number. Must be 10 digits.' },
        { status: 400 }
      );
    }

    if (!paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: 'Payment screenshot is required' },
        { status: 400 }
      );
    }

    const hasCaptain = players.some((p: any) => p.isCaptain);
    if (!hasCaptain) {
      return NextResponse.json(
        { success: false, error: 'Team must have a captain' },
        { status: 400 }
      );
    }

    const team = await Team.create({
      teamName,
      captainPhone,
      players,
      paymentScreenshot,
      verified: false,
    });

    return NextResponse.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const teams = await Team.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
