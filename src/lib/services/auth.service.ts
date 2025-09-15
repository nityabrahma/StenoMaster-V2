
import { db } from '@/lib/data-store';
import { sign } from '@/lib/auth';
import type { LoginCredentials, SignupCredentials, User, Student, CheckUserResponse } from '@/lib/types';

export async function checkUserExists(email: string): Promise<CheckUserResponse> {
    return new Promise((resolve) => {
        const userList = db.read<User>('users');
        const user = userList.find(u => u.email === email);

        if (user) {
            resolve({ exists: true, role: user.role });
        } else {
            resolve({ exists: false });
        }
    });
}


export async function signIn(credentials: LoginCredentials): Promise<{ token: string, user: User }> {
    return new Promise((resolve, reject) => {
        const userList = db.read<User>('users');
        const user = userList.find(u => u.email === credentials.email && u.role === credentials.role);
        
        if (!user) {
            return reject(new Error('User not found. Please check your email and role.'));
        }

        // In a real app, you would verify the hashed password here.
        // For this simulation, we assume if the user exists, the password is "correct".
        if (credentials.password === "incorrect") { // Simulate incorrect password
            return reject(new Error('Incorrect password. Please try again.'));
        }
        
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
                id: `teacher-${Date.now()}`,
                name: credentials.name,
                email: credentials.email,
                role: credentials.role,
            };
        }
        
        db.write('users', [...users, newUser]);
        
        resolve(newUser);
    });
}
