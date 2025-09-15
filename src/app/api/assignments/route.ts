
import { NextRequest, NextResponse } from 'next/server';
import { getAllAssignments, createAssignment } from '@/lib/services/assignment.service';
import type { Assignment } from '@/lib/types';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }

    try {
        const assignments = await getAllAssignments();
        return NextResponse.json(assignments);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
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
