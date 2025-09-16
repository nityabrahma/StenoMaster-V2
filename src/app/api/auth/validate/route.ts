import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { User } from '@/lib/types';
import { getUserByEmail } from '@/lib/actions/user.action';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; email: string; role: 'student' | 'teacher' };
    const user = await getUserByEmail(decoded.email);
    if (!user) {
        throw new Error("User not found")
    }

    const userPayload: User = {
        id: user.userId,
        name: user.fullName,
        email: user.email,
        role: user.userType,
    }
    
    return NextResponse.json({ isAuthenticated: true, user: userPayload });
  } catch (error) {
    // Token is invalid or expired
    const response = NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
    response.cookies.set('auth-token', '', { expires: new Date(0), path: '/' });
    return response;
  }
}
