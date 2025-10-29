import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Login API: Starting login process');
    
    console.log('Login API: Connecting to database...');
    await dbConnect();
    console.log('Login API: Database connected');
    
    const body = await request.json();
    console.log('Login API: Request body received:', { username: body.username, hasPassword: !!body.password });

    const { username, password } = body;

    if (!username || !password) {
      console.log('Login API: Missing username or password');
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find admin by username
    console.log('Login API: Finding admin...');
    const admin = await Admin.findOne({ username });
    console.log('Login API: Admin found:', !!admin);

    if (!admin) {
      console.log('Login API: Admin not found');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('Login API: Verifying password...');
    const isPasswordValid = await admin.comparePassword(password);
    console.log('Login API: Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Login API: Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    console.log('Login API: Creating session...');
    const session = await getSession();
    session.adminId = admin._id.toString();
    session.username = admin.username;
    session.isLoggedIn = true;
    await session.save();

    console.log('Login API: Login successful, session created');
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
