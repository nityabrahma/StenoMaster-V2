
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

    try {
        let scores: Score[] = [];
        if (user.role === 'teacher') {
            scores = await getScoresByTeacher(user.id as string);
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
        const newScore = await createScore({ ...scoreData, studentId: validation.user!.id as string });
        return NextResponse.json(newScore, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
