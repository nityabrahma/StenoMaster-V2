
import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/services/auth.service';
import type { LoginCredentials } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const credentials = (await req.json()) as LoginCredentials;
    const { token } = await signIn(credentials);
    
    const response = NextResponse.json({ success: true, message: 'Login successful' });
    response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 401 });
  }
}
