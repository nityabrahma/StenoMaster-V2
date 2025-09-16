
import { submissions as initialSubmissions } from '@/lib/data';
import type { Submission } from '@/lib/types';

const submissions: Submission[] = [...initialSubmissions];

export async function getAllSubmissions(): Promise<Submission[]> {
    return new Promise(resolve => resolve(submissions));
}

export async function createSubmission(data: Omit<Submission, 'id'>): Promise<Submission> {
    const newSubmission: Submission = {
        ...data,
        id: `sub-${Date.now()}`,
    };
    
    // Remove any previous submission for the same assignment by the same student
    const index = submissions.findIndex(s => 
        s.assignmentId === newSubmission.assignmentId && s.studentId === newSubmission.studentId
    );

    if (index !== -1) {
        submissions.splice(index, 1);
    }

    submissions.unshift(newSubmission);
    return new Promise(resolve => resolve(newSubmission));
}
