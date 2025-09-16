
import UserModel from '@/models/User';
import dbConnect from '../mongodb';
import type { Student } from '@/lib/types';

export async function getAllStudents(): Promise<Student[]> {
    await dbConnect();
    const students = await UserModel.find({ role: 'student' }).lean();
    return students.map(s => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        role: 'student',
        classIds: s.classIds || []
    }));
}

export async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    await dbConnect();
    const updatedStudent = await UserModel.findByIdAndUpdate(id, data, { new: true }).lean();

    if (!updatedStudent) {
        throw new Error('Student not found');
    }

    return {
        id: updatedStudent._id.toString(),
        name: updatedStudent.name,
        email: updatedStudent.email,
        role: 'student',
        classIds: updatedStudent.classIds || []
    };
}

export async function deleteStudent(id: string): Promise<void> {
    await dbConnect();
    const result = await UserModel.findByIdAndDelete(id);
    if (!result) {
        throw new Error('Student not found');
    }
    // We would also need to remove student from classes in a real app,
    // which would be handled here or via a database trigger.
}
