
import bcrypt from 'bcryptjs';
import { sign } from '@/lib/auth';
import type { LoginCredentials, SignupCredentials, User, CheckUserResponse } from '@/lib/types';
import dbConnect from '../mongodb';
import UserModel from '@/models/User';

export async function checkUserExists(email: string): Promise<CheckUserResponse> {
    await dbConnect();
    const user = await UserModel.findOne({ email }).lean();
    if (user) {
        return { exists: true, role: user.role as 'student' | 'teacher' };
    }
    return { exists: false };
}

export async function signIn(credentials: LoginCredentials): Promise<{ token: string, user: User }> {
    await dbConnect();
    const user = await UserModel.findOne({ email: credentials.email, role: credentials.role }).select('+password');

    if (!user) {
        throw new Error('User not found. Please check your email and role.');
    }

    const isMatch = await bcrypt.compare(credentials.password!, user.password!);
    if (!isMatch) {
        throw new Error('Incorrect password. Please try again.');
    }
    
    const payload = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const token = sign(payload, process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long', { expiresIn: '1h' });
    
    // Convert Mongoose doc to plain object and map _id to id
    const userObject: User = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'student' | 'teacher',
    };

    return { token, user: userObject };
}

export async function signUp(credentials: SignupCredentials): Promise<User> {
    await dbConnect();
    const existingUser = await UserModel.findOne({ email: credentials.email });

    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(credentials.password, 10);
    
    const user = new UserModel({
        ...credentials,
        password: hashedPassword,
    });
    
    await user.save();

    const newUser: User = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'student' | 'teacher',
    };

    return newUser;
}
