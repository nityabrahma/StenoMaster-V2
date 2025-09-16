
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ exists: false, message: 'Email is required.' }, { status: 400 });
    }
    
    const user = await UserModel.findOne({ email }).lean();
    
    if (user) {
        return NextResponse.json({ exists: true, role: user.role });
    } else {
        return NextResponse.json({ exists: false, message: 'No user found with this email.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('[API Check-User Error]', error);
    return NextResponse.json({ exists: false, message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
