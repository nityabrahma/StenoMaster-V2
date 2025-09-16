
import { connectToDatabase } from '@/lib/database/mongoose';
import UserModel from '@/lib/database/models/user.model';
import type { Student } from '@/lib/types';
import { getClassesByStudent } from './class.service';

// Map the MongoDB user document to the Student type used in the frontend
async function mapUserToStudent(user: any): Promise<Student> {
    // Fetch class enrollments for the student from Firestore
    const classes = await getClassesByStudent(user.userId);
    const classIds = classes.map(c => c.id);

    return {
        id: user.userId.toString(),
        name: user.fullName,
        email: user.email,
        role: 'student',
        teacherId: user.teacherId,
        classIds: classIds || [], 
    };
}

export async function getAllStudents(): Promise<Student[]> {
    try {
        await connectToDatabase();
        const users = await UserModel.find({ userType: 'student' }).lean();
        
        // Map all users to students with their class info
        const studentPromises = users.map(user => mapUserToStudent(user));
        return Promise.all(studentPromises);

    } catch (error) {
        console.error('Error fetching all students:', error);
        return [];
    }
}

export async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    try {
        await connectToDatabase();
        // Assuming 'id' is the 'userId'
        const updatedUser = await UserModel.findOneAndUpdate({ userId: id }, data, { new: true }).lean();
        if (!updatedUser) {
            throw new Error('Student not found for update');
        }
        return mapUserToStudent(updatedUser);
    } catch (error) {
        console.error('Error updating student:', error);
        throw new Error('Could not update student');
    }
}

export async function deleteStudent(id: string): Promise<void> {
    try {
        await connectToDatabase();
        // Assuming 'id' is the 'userId'
        const result = await UserModel.deleteOne({ userId: id });
        if (result.deletedCount === 0) {
            throw new Error('Student not found for deletion');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        throw new Error('Could not delete student');
    }
}
