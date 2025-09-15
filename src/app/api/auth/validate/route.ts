
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeToken, isTokenExpired } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token || isTokenExpired(token)) {
    // Also clear the cookie if it's invalid/expired
    const response = NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
    response.cookies.set('auth-token', '', { expires: new Date(0), path: '/' });
    return response;
  }
  
  const user = decodeToken(token);
  return NextResponse.json({ isAuthenticated: true, user });
}
