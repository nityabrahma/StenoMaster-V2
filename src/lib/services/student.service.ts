
import UserModel from '@/models/User';
import { connectToDatabase } from '../mongodb';
import type { Student } from '@/lib/types';

export async function getAllStudents(): Promise<Student[]> {
    await connectToDatabase();
    const students = await UserModel.find({ userType: 'student' }).lean();
    return students.map(s => ({
        id: s.userId,
        name: s.fullName,
        email: s.email,
        role: 'student',
        classIds: [] // This will be managed by Firestore 'classes' collection
    }));
}

export async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    await connectToDatabase();
    // Map our app's field names to the database schema names
    const dbData: { [key: string]: any } = {};
    if (data.name) dbData.fullName = data.name;
    if (data.email) dbData.email = data.email;
    
    const updatedStudent = await UserModel.findOneAndUpdate({ userId: id }, dbData, { new: true }).lean();

    if (!updatedStudent) {
        throw new Error('Student not found');
    }

    return {
        id: updatedStudent.userId,
        name: updatedStudent.fullName,
        email: updatedStudent.email,
        role: 'student',
        classIds: [] // This will be managed by Firestore 'classes' collection
    };
}

export async function deleteStudent(id: string): Promise<void> {
    await connectToDatabase();
    const result = await UserModel.findOneAndDelete({ userId: id });
    if (!result) {
        throw new Error('Student not found');
    }
}
