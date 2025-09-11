
/**
 * This is a mock authentication service.
 * In a real application, you would make API calls to a backend service.
 */
import { students, teachers } from './data';
import type { LoginCredentials, SignupCredentials, User } from './types';

// In a real app, this would be a secret key stored on the server.
const JWT_SECRET = 'your-super-secret-key-that-is-at-least-32-characters-long';
const MOCK_USERS_KEY = 'steno-mock-users';

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


// Initialize mock users from data.ts if not already in localStorage
function initializeMockUsers() {
    if (typeof window !== 'undefined' && !localStorage.getItem(MOCK_USERS_KEY)) {
        const initialUsers: User[] = [...teachers, ...students];
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
    }
}

function getMockUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
}

function saveMockUsers(users: User[]) {
     if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    }
}


/**
 * Simulates signing a JWT.
 * In a real app, this would be done by a library like 'jsonwebtoken' on the server.
 */
function sign(payload: object, secret: string, options: { expiresIn: string }): string {
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
export function decodeToken(token: string): object | null {
  try {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) {
        throw new Error('Invalid token format');
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
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
export async function signIn(credentials: LoginCredentials): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            initializeMockUsers(); // Ensure localStorage is initialized.
            const userList: User[] = getMockUsers();
            const user = userList.find((u) => u.email === credentials.email && u.role === credentials.role);

            if (!user) {
                return reject(new Error('User not found or invalid credentials.'));
            }

            // In a real app, you would verify the password here.
            // For this simulation, we'll just check if the user exists.

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

/**
 * Simulates a sign-up API call.
 * Adds a new user to our mock database.
 */
export async function signUp(credentials: SignupCredentials): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            initializeMockUsers(); // Ensure localStorage is initialized.
            const users = getMockUsers();
            const existingUser = users.find(u => u.email === credentials.email);

            if (existingUser) {
                return reject(new Error('An account with this email already exists.'));
            }

            const newUser: User = {
                id: `user-${Date.now()}`,
                name: credentials.name,
                email: credentials.email,
                role: credentials.role,
            };

            if (newUser.role === 'student') {
                (newUser as any).classIds = [];
            }
            
            users.push(newUser);
            saveMockUsers(users);
            
            resolve();
        }, 500); // Simulate network latency
    });
}
