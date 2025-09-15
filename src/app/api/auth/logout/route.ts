
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true, message: 'Logout successful' });
    response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        path: '/',
    });
    return response;
}
