
import { NextRequest, NextResponse } from 'next/server';
import { deleteAssignment, updateAssignment } from '@/lib/services/assignment.service';
import { validateRequest } from '@/lib/auth';
import type { Assignment } from '@/lib/types';


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    if (validation.user?.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        await deleteAssignment(params.id);
        return NextResponse.json({ message: 'Assignment deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    if (validation.user?.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const assignmentData = await req.json() as Partial<Assignment>;
        const updated = await updateAssignment(params.id, assignmentData);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
