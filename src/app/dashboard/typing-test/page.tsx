
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TypingTest from '@/components/typing-test';
import { sampleTexts } from '@/lib/sample-text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, History } from 'lucide-react';
import type { SubmissionResult } from '@/components/typing-test';
import { useDataStore } from '@/hooks/use-data-store';
import { useAuth } from '@/hooks/use-auth';
import PracticeTestsModal from '@/components/PracticeTestsModal';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import type { Assignment, Score } from '@/lib/types';

export default function TypingTestPage() {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const { toast } = useToast();
    const { user } = useAuth();
    const { createScore, scores } = useDataStore();

    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedScore, setSelectedScore] = useState<Score | null>(null);

    const currentTestText = sampleTexts[currentTextIndex];
    const currentTestId = (currentTextIndex + 1).toString();

    const handleComplete = async (result: SubmissionResult) => {
        if (!user) return;
        
        try {
            await createScore({
                assignmentId: `practice-${currentTestId}`,
                completedAt: new Date().toISOString(),
                ...result,
            });
            
            toast({
                title: "Practice Complete!",
                description: `Your score: ${result.wpm} WPM at ${result.accuracy.toFixed(1)}% accuracy.`,
            });
        } catch (error: any) {
            toast({
                title: "Practice Submission Failed",
                description: error.message || "Could not save your practice score.",
                variant: "destructive",
            });
        }
    };

    const nextTest = () => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % sampleTexts.length);
    };
    
    const practiceTestScores = scores.filter(s => s.assignmentId.startsWith('practice-') && s.studentId === user?.id);

    const handleSelectScore = (score: Score) => {
        setSelectedScore(score);
        setIsListModalOpen(false);
    }
    
    const getAssignmentForScore = (score: Score): Assignment => {
        const textId = score.assignmentId.replace('practice-', '');
        const practiceText = sampleTexts[parseInt(textId, 10) - 1] || "Text not found.";
        return {
            id: score.assignmentId,
            title: `Practice Text #${textId}`,
            text: practiceText,
            classId: '',
            deadline: '',
            isActive: true
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
                    <TypingTest text={currentTestText} onComplete={handleComplete} />
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
                scores={practiceTestScores}
                onSelectScore={handleSelectScore}
            />

            {selectedScore && (
                <SubmissionReviewModal
                    isOpen={!!selectedScore}
                    onClose={() => setSelectedScore(null)}
                    score={selectedScore}
                    assignment={getAssignmentForScore(selectedScore)}
                />
            )}
        </div>
    );
}
