
import { NextRequest, NextResponse } from 'next/server';
import { deleteAssignment } from '@/lib/services/assignment.service';
import { validateRequest } from '@/lib/auth';


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
