
import { NextRequest, NextResponse } from 'next/server';
import { getScoresByStudent, getScoresByTeacher, createScore } from '@/lib/services/score.service';
import type { Score } from '@/lib/types';
import { validateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error || !validation.user) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    const user = validation.user;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const limit = searchParams.get('limit');

    try {
        let scores: Score[] = [];
        if (user.role === 'teacher') {
            if (studentId) {
                // Teachers can request scores for a specific student of theirs
                // (Future validation could check if studentId belongs to teacher)
                scores = await getScoresByStudent(studentId);
            } else {
                scores = await getScoresByTeacher(user.id as string, limit ? parseInt(limit) : undefined);
            }
        } else if (user.role === 'student') {
            scores = await getScoresByStudent(user.id as string);
        }
        return NextResponse.json(scores);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const validation = await validateRequest();
    if (validation.error || !validation.user) {
        return NextResponse.json({ message: validation.error }, { status: validation.status });
    }
    
    try {
        const scoreData = await req.json() as Omit<Score, 'id' | 'studentId'>;
        // If a student is submitting, their user ID is used.
        // A teacher could theoretically submit on behalf of a student, but we'll lock it to user for now.
        const newScore = await createScore({ ...scoreData, studentId: validation.user!.id as string });
        return NextResponse.json(newScore, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
