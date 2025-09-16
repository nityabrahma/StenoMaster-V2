
import { sign } from '@/lib/auth';
import type { LoginCredentials, SignupCredentials, User, Student, Teacher, CheckUserResponse } from '@/lib/types';
import { teachers, students } from '@/lib/data';

// This is our in-memory "database" for the server.
const allUsers: User[] = [...teachers, ...students];


export async function checkUserExists(email: string): Promise<CheckUserResponse> {
    return new Promise((resolve) => {
        const user = allUsers.find(u => u.email === email);
        if (user) {
            resolve({ exists: true, role: user.role });
        } else {
            resolve({ exists: false });
        }
    });
}


export async function signIn(credentials: LoginCredentials): Promise<{ token: string, user: User }> {
    return new Promise((resolve, reject) => {
        const user = allUsers.find(u => u.email === credentials.email && u.role === credentials.role);
        
        if (!user) {
            return reject(new Error('User not found. Please check your email and role.'));
        }

        // In a real app, you would verify the hashed password here.
        // We will simulate a password check. Let's assume no password is 'incorrect' for now.
        if (credentials.password === "incorrect") { 
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
        const existingUser = allUsers.find(u => u.email === credentials.email);

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
        } else { // Teacher
             const newTeacher: Teacher = {
                id: `teacher-${Date.now()}`,
                name: credentials.name,
                email: credentials.email,
                role: 'teacher',
            };
            newUser = newTeacher
        }
        
        // Add the new user to our in-memory store for the current server session
        allUsers.push(newUser);
        
        // This is important: For simulation, we also need to update the original arrays
        // so that subsequent client-side fetches get the new user. In a real DB, this is one transaction.
        if (newUser.role === 'student') {
            students.push(newUser as Student);
        } else {
            teachers.push(newUser as Teacher);
        }
        
        resolve(newUser);
    });
}
