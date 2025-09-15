
import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, createSubmission } from '@/lib/services/submission.service';
import type { Submission } from '@/lib/types';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }

    try {
        const submissions = await getAllSubmissions();
        return NextResponse.json(submissions);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    
    try {
        const submissionData = await req.json() as Omit<Submission, 'id' | 'studentId'>;
        const newSubmission = await createSubmission({ ...submissionData, studentId: validation.user!.id });
        return NextResponse.json(newSubmission, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
