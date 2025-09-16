
import type { User } from './types';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';


/**
 * Validates a request by checking the auth token cookie on the server-side.
 * To be used in API routes.
 */
export async function validateRequest(): Promise<{ user: User | null, error?: string, status?: number }> {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return { user: null, error: 'Unauthorized: No token provided', status: 401 };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // In a real app, you might want to check if the user still exists in the DB
        return { user: decoded as User };
    } catch (error) {
        return { user: null, error: 'Unauthorized: Invalid or expired token', status: 401 };
    }
}
