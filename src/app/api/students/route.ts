
import { NextRequest, NextResponse } from 'next/server';
import { getStudentsByTeacher } from '@/lib/services/student.service';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    
    const user = validation.user;

    // Only teachers can see their students
    if (user?.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Pass the teacher's ID to the service function
        const students = await getStudentsByTeacher(user.id as string);
        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
