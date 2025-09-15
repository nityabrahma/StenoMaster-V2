
import { db } from '@/lib/data-store';
import type { Submission } from '@/lib/types';

export async function getAllSubmissions(): Promise<Submission[]> {
    return new Promise(resolve => resolve(db.read<Submission>('submissions')));
}

export async function createSubmission(data: Omit<Submission, 'id'>): Promise<Submission> {
    let submissions = await getAllSubmissions();
    
    const newSubmission: Submission = {
        ...data,
        id: `sub-${Date.now()}`,
    };
    
    // Remove any previous submission for the same assignment by the same student
    submissions = submissions.filter(s => 
        !(s.assignmentId === newSubmission.assignmentId && s.studentId === newSubmission.studentId)
    );

    db.write('submissions', [newSubmission, ...submissions]);
    return new Promise(resolve => resolve(newSubmission));
}
