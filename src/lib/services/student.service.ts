
import UserModel from '@/models/User';
import { connectToDatabase } from '../mongodb';
import type { Student } from '@/lib/types';

export async function getAllStudents(): Promise<Student[]> {
    await connectToDatabase();
    const students = await UserModel.find({ role: 'student' }).lean();
    return students.map(s => ({
        id: s.userId,
        name: s.name,
        email: s.email,
        role: 'student',
        classIds: s.classIds || []
    }));
}

export async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    await connectToDatabase();
    const updatedStudent = await UserModel.findOneAndUpdate({ userId: id }, data, { new: true }).lean();

    if (!updatedStudent) {
        throw new Error('Student not found');
    }

    return {
        id: updatedStudent.userId,
        name: updatedStudent.name,
        email: updatedStudent.email,
        role: 'student',
        classIds: updatedStudent.classIds || []
    };
}

export async function deleteStudent(id: string): Promise<void> {
    await connectToDatabase();
    const result = await UserModel.findOneAndDelete({ userId: id });
    if (!result) {
        throw new Error('Student not found');
    }
}
