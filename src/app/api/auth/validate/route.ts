
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { User } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // You might want to do a database check here to ensure user still exists and token isn't revoked
    return NextResponse.json({ isAuthenticated: true, user: decoded as User });
  } catch (error) {
    // Token is invalid or expired
    const response = NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
    response.cookies.set('auth-token', '', { expires: new Date(0), path: '/' });
    return response;
  }
}
