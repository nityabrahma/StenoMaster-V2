
import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/services/student.service';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    
    // For now, allow both roles to fetch all students, will be optimized later.
    // The filtering will happen on the client side.
    
    try {
        const students = await getAllStudents();
        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
