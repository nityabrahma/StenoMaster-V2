
import { NextRequest, NextResponse } from 'next/server';
import { checkUserExists } from '@/lib/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ exists: false, message: 'Email is required.' }, { status: 400 });
    }
    
    const result = await checkUserExists(email);
    
    if (result.exists) {
        return NextResponse.json({ exists: true, role: result.role });
    } else {
        return NextResponse.json({ exists: false, message: 'No user found with this email.' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ exists: false, message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
