
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TypingTest from '@/components/typing-test';
import { typingTexts } from '@/lib/typing-data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, History } from 'lucide-react';
import type { SubmissionResult } from '@/components/typing-test';
import { useAssignments } from '@/hooks/use-assignments';
import { useAuth } from '@/hooks/use-auth';
import PracticeTestsModal from '@/components/PracticeTestsModal';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import type { Assignment, Submission } from '@/lib/types';

export default function TypingTestPage() {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const { toast } = useToast();
    const { user } = useAuth();
    const { addSubmission, submissions } = useAssignments();

    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const currentTest = typingTexts[currentTextIndex];

    const handleComplete = async (result: SubmissionResult) => {
        if (!user) return;
        
        await addSubmission({
            assignmentId: `practice-${currentTest.id}`,
            studentId: user.id,
            submittedAt: new Date().toISOString(),
            ...result,
        });
        
        toast({
            title: "Practice Complete!",
            description: `Your score: ${result.wpm} WPM at ${result.accuracy.toFixed(1)}% accuracy.`,
        });
    };

    const nextTest = () => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % typingTexts.length);
    };
    
    const practiceTestSubmissions = submissions.filter(s => s.assignmentId.startsWith('practice-') && s.studentId === user?.id);

    const handleSelectSubmission = (submission: Submission) => {
        setSelectedSubmission(submission);
        setIsListModalOpen(false);
    }
    
    const getAssignmentForSubmission = (submission: Submission): Assignment => {
        const textId = submission.assignmentId.replace('practice-', '');
        const practiceText = typingTexts.find(t => t.id === textId);
        return {
            id: submission.assignmentId,
            title: `Practice Text #${textId}`,
            text: practiceText?.text || "Text not found.",
            classId: '',
            deadline: '',
        };
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-3xl">Typing Practice</CardTitle>
                            <CardDescription>Hone your skills with our curated typing tests. Focus on speed and accuracy.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => setIsListModalOpen(true)}>
                            <History className="mr-2 h-4 w-4" />
                            View Results
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TypingTest text={currentTest.text} onComplete={handleComplete} />
                    <div className="flex justify-end">
                        <Button onClick={nextTest}>
                            Next Test <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <PracticeTestsModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                submissions={practiceTestSubmissions}
                onSelectSubmission={handleSelectSubmission}
            />

            {selectedSubmission && (
                <SubmissionReviewModal
                    isOpen={!!selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    submission={selectedSubmission}
                    assignment={getAssignmentForSubmission(selectedSubmission)}
                />
            )}
        </div>
    );
}
