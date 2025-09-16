
import { connectToDatabase } from '@/lib/database/mongoose';
import UserModel from '@/lib/database/models/user.model';
import type { Student } from '@/lib/types';

// Map the MongoDB user document to the Student type used in the frontend
function mapUserToStudent(user: any): Student {
    return {
        id: user.userId.toString(),
        name: user.fullName,
        email: user.email,
        role: 'student',
        classIds: user.classIds || [], // Assuming classIds are stored on the user model
    };
}


/**
 * Fetches all students assigned to a specific teacher directly from MongoDB.
 * @param teacherId The userId of the teacher.
 * @returns A promise that resolves to an array of Student objects.
 */
export async function getStudentsByTeacher(teacherId: string): Promise<Student[]> {
    try {
        await connectToDatabase();
        const studentsFromDb = await UserModel.find({ userType: 'student', teacherId: teacherId }).lean();

        if (!studentsFromDb) {
            return [];
        }

        // We need to fetch class enrollments for each student separately
        // For now, let's just map the basic data. Class IDs will need to be populated.
        // This is a simplification until we have a clear link between mongo users and firestore classes.
        const students: Student[] = studentsFromDb.map(user => ({
            id: user.userId,
            name: user.fullName,
            email: user.email,
            role: 'student',
            classIds: [], // Placeholder, as class data is in Firestore.
        }));
        
        return students;

    } catch (error) {
        console.error('Error fetching students by teacher:', error);
        throw new Error('Could not fetch students.');
    }
}


export async function getAllStudents(): Promise<Student[]> {
    try {
        await connectToDatabase();
        const users = await UserModel.find({ userType: 'student' }).lean();
        return users.map(mapUserToStudent);
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
