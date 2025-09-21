
import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentsByClassIds } from '@/lib/services/assignment.service';
import { getClassesByStudentId } from '@/lib/services/class.service';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error || !validation.user) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    const user = validation.user;

    if (user.role !== 'student') {
        return NextResponse.json({ message: 'Forbidden: This route is for students only.' }, { status: 403 });
    }

    try {
        // 1. Get the classes for the logged-in student
        const studentClasses = await getClassesByStudentId(user.id as string);
        if (studentClasses.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Extract the class IDs
        const classIds = studentClasses.map(c => c.id);

        // 3. Fetch only the assignments for those class IDs
        const assignments = await getAssignmentsByClassIds(classIds);
        
        return NextResponse.json(assignments);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
