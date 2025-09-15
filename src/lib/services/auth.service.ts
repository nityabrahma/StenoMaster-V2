
import { db } from '@/lib/data-store';
import { sign } from '@/lib/auth';
import type { LoginCredentials, SignupCredentials, User, Student } from '@/lib/types';

export async function signIn(credentials: LoginCredentials): Promise<{ token: string, user: User }> {
    return new Promise((resolve, reject) => {
        const userList = db.read<User>('users');
        const user = userList.find(u => u.email === credentials.email && u.role === credentials.role);
        
        if (!user) {
            return reject(new Error('User not found or invalid credentials.'));
        }

        // In a real app, you would verify the password here.
        
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        const token = sign(payload, process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long', { expiresIn: '1h' });
        
        resolve({ token, user });
    });
}

export async function signUp(credentials: SignupCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
        const users = db.read<User>('users');
        const existingUser = users.find(u => u.email === credentials.email);

        if (existingUser) {
            return reject(new Error('An account with this email already exists.'));
        }

        let newUser: User;

        if (credentials.role === 'student') {
            const newStudent: Student = {
                id: `student-${Date.now()}`,
                name: credentials.name,
                email: credentials.email,
                role: 'student',
                classIds: []
            };
            newUser = newStudent;
        } else {
             newUser = {
                id: `user-${Date.now()}`,
                name: credentials.name,
                email: credentials.email,
                role: credentials.role,
            };
        }
        
        db.write('users', [...users, newUser]);
        
        resolve(newUser);
    });
}
