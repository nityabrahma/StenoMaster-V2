
import { NextRequest, NextResponse } from 'next/server';
import { getAllClasses, createClass } from '@/lib/services/class.service';
import type { Class } from '@/lib/types';
import { validateRequest } from '@/lib/auth';


export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }

    try {
        const classes = await getAllClasses();
        return NextResponse.json(classes);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    const user = validation.user;
    if (user?.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const classData = await req.json() as Omit<Class, 'id' | 'teacherId'>;
        const newClass = await createClass({ ...classData, teacherId: user.id });
        return NextResponse.json(newClass, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
