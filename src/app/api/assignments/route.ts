
import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentsByTeacher, createAssignment } from '@/lib/services/assignment.service';
import type { Assignment } from '@/lib/types';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error || !validation.user) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }

    if (validation.user.role !== 'teacher') {
         return NextResponse.json({ message: 'Forbidden: This endpoint is for teachers only. Use /api/assignments/student for student assignments.' }, { status: 403 });
    }

    try {
        const assignments = await getAssignmentsByTeacher(validation.user.id as string);
        return NextResponse.json(assignments);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error || !validation.user) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    if (validation.user?.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const assignmentData = await req.json() as Omit<Assignment, 'id'>;
        const newAssignment = await createAssignment(assignmentData);
        return NextResponse.json(newAssignment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
