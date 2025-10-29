import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// This route is for initial setup only - you should disable it after first run
export async function POST() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin already exists' },
        { status: 400 }
      );
    }

    // Create admin with the specified credentials
    const admin = await Admin.create({
      username: 'admin',
      password: 'ObeyAllah@786',
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
