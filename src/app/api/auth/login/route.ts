import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import UserModel from '@/lib/database/models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { LoginCredentials } from '@/lib/types';
import { handleError } from '@/lib/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password, role } = await req.json() as LoginCredentials;

    if (!email || !password || !role) {
        return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase(), userType: role }).select('+password');

    if (!user) {
        return NextResponse.json({ message: 'User not found. Please check your email and role.' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
        return NextResponse.json({ message: 'Incorrect password.' }, { status: 401 });
    }

    const payload = {
        id: user.userId,
        name: user.fullName,
        email: user.email,
        role: user.userType,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    await UserModel.updateOne({ _id: user._id }, { $set: { sessionToken: token } });

    const response = NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user: payload
    });
    
    response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    return response;

  } catch (error: any) {
    handleError(error)
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
