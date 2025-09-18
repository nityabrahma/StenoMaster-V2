
import { NextRequest, NextResponse } from 'next/server';
import { getStudentsByTeacher } from '@/lib/services/student.service';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error || !validation.user) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    
    if (validation.user.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    try {
        const students = await getStudentsByTeacher(validation.user.id as string);
        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
