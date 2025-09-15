
import { NextRequest, NextResponse } from 'next/server';
import { updateStudent, deleteStudent } from '@/lib/services/student.service';
import type { Student } from '@/lib/types';
import { validateRequest } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    if (validation.user?.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const studentData = await req.json() as Partial<Student>;
        const updated = await updateStudent(params.id, studentData);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    if (validation.user?.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        await deleteStudent(params.id);
        return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
}
