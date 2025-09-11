/**
 * This is a mock authentication service.
 * In a real application, you would make API calls to a backend service.
 */
import { students, teachers } from './data';
import type { User } from './types';

// In a real app, this would be a secret key stored on the server.
const JWT_SECRET = 'your-super-secret-key-that-is-at-least-32-characters-long';

/**
 * Simulates signing a JWT.
 * In a real app, this would be done by a library like 'jsonwebtoken' on the server.
 */
function sign(payload: object, secret: string, options: { expiresIn: string }): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + parseExpiry(options.expiresIn);
    
    const fullPayload = { ...payload, iat: now, exp: expiry };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    
    // In a real JWT, you'd use crypto to create a signature. We'll just fake it.
    const signature = `${encodedHeader}.${encodedPayload}.${secret}`;
    const encodedSignature = Buffer.from(signature).toString('base64url');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}


/**
 * Simulates verifying and decoding a JWT.
 * In a real app, this would be done by a library like 'jsonwebtoken' on the server.
 * Here we do it on the client for demonstration.
 */
export function decodeToken(token: string): object | null {
  try {
    const [encodedHeader, encodedPayload] = token.split('.');
    if (!encodedHeader || !encodedPayload) {
        throw new Error('Invalid token format');
    }
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (payload && typeof payload === 'object' && 'exp' in payload) {
        const exp = payload.exp as number;
        return Date.now() >= exp * 1000;
    }
    return true;
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
 * Simulates a sign-in API call.
 * Finds the user and returns a JWT.
 */
export async function signIn(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const allUsers: User[] = [...teachers, ...students];
            const user = allUsers.find((u) => u.id === userId);

            if (!user) {
                return reject(new Error('User not found'));
            }

            // Don't include sensitive data in the token payload.
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };

            const token = sign(payload, JWT_SECRET, { expiresIn: '1h' });

            resolve(token);
        }, 500); // Simulate network latency
    });
}
