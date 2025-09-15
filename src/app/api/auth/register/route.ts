
import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/services/auth.service';
import type { SignupCredentials, User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const credentials = await req.json() as SignupCredentials;
    const newUser = await signUp(credentials);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 400 });
  }
}
