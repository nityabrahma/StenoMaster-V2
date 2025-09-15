
import type { User } from './types';
import { cookies } from 'next/headers';

// In a real app, this would be a secret key stored on the server as an environment variable.
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';

// Helper functions for URL-safe base64 encoding
function base64UrlEncode(str: string): string {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf-8');
}


/**
 * Simulates signing a JWT.
 * In a real app, this would be done by a library like 'jsonwebtoken' on the server.
 */
export function sign(payload: object, secret: string, options: { expiresIn: string }): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + parseExpiry(options.expiresIn);
    
    const fullPayload = { ...payload, iat: now, exp: expiry };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    
    // In a real JWT, you'd use crypto to create a signature. We'll just fake it.
    const signature = `${encodedHeader}.${encodedPayload}.${secret}`;
    const encodedSignature = base64UrlEncode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}


/**
 * Simulates verifying and decoding a JWT.
 * In a real app, this would be done by a library like 'jsonwebtoken' on the server.
 * Here we do it on the client for demonstration.
 */
export function decodeToken(token: string): User | null {
  try {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) {
        throw new Error('Invalid token format');
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    
    // Basic validation of payload structure
    if (payload && typeof payload === 'object' && 'id' in payload && 'role' in payload) {
        return payload as User;
    }
    return null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (payload && typeof payload === 'object' && 'exp' in payload) {
        const exp = (payload as any).exp as number;
        return Date.now() >= exp * 1000;
    }
    return true; // If no 'exp' field or invalid token, treat as expired.
}

function parseExpiry(expiresIn: string): number {
    const unit = expiresIn.charAt(expiresIn.length - 1);
    const value = parseInt(expiresIn.slice(0, -1), 10);
    switch(unit) {
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        default: return value; // seconds
    }
}

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

    if (isTokenExpired(token)) {
        return { user: null, error: 'Unauthorized: Token expired', status: 401 };
    }

    const user = decodeToken(token);
    if (!user) {
        return { user: null, error: 'Unauthorized: Invalid token', status: 401 };
    }

    return { user };
}
