
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import type { SignupCredentials } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, email, password, role } = await req.json() as SignupCredentials;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Correctly map the incoming fields to the schema fields
    const newUser = new UserModel({
      fullName: name, // Correct mapping
      email,
      password: hashedPassword,
      userType: role, // Correct mapping
    });
    
    await newUser.save();

    const userObject = {
      id: newUser.userId,
      name: newUser.fullName,
      email: newUser.email,
      role: newUser.userType,
    }

    return NextResponse.json(userObject, { status: 201 });
  } catch (error: any) {
    console.error('[API Register Error]', error);
    // Provide a more specific error message if it's a validation error
    if (error.name === 'ValidationError') {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'An unexpected error occurred during registration.' }, { status: 500 });
  }
}
