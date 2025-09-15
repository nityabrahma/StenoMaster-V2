
import { NextRequest, NextResponse } from 'next/server';
import { updateClass } from '@/lib/services/class.service';
import type { Class } from '@/lib/types';
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
        const classData = await req.json() as Partial<Class>;
        const updated = await updateClass(params.id, classData);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
