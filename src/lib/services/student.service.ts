
import { students as initialStudents, teachers } from '@/lib/data';
import type { Student, Class } from '@/lib/types';
import { classes } from './class.service';

const allUsers = [...initialStudents, ...teachers];

export async function getAllStudents(): Promise<Student[]> {
    // Filter from the live array in case new users were added
    const students = allUsers.filter(u => u.role === 'student') as Student[];
    return new Promise(resolve => resolve(students));
}

export async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    const studentIndex = allUsers.findIndex(s => s.id === id && s.role === 'student');

    if (studentIndex === -1) {
        throw new Error('Student not found');
    }

    const updatedStudent = { ...allUsers[studentIndex], ...data } as Student;
    allUsers[studentIndex] = updatedStudent;
    
    // Also update the original students array
    const originalStudentIndex = initialStudents.findIndex(s => s.id === id);
    if(originalStudentIndex !== -1) {
        initialStudents[originalStudentIndex] = updatedStudent;
    }


    return new Promise(resolve => resolve(updatedStudent));
}

export async function deleteStudent(id: string): Promise<void> {
    const userIndex = allUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
        throw new Error('Student not found');
    }
    allUsers.splice(userIndex, 1);

    // Also remove from original students array
    const originalStudentIndex = initialStudents.findIndex(s => s.id === id);
    if(originalStudentIndex !== -1) {
        initialStudents.splice(originalStudentIndex, 1);
    }


    // Also remove student from any classes they were in
    classes.forEach(c => {
        c.studentIds = c.studentIds.filter(studentId => studentId !== id);
    });
    
    return new Promise(resolve => resolve());
}
