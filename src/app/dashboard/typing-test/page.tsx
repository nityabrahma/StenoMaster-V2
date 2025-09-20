
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TypingTest from '@/components/typing-test';
import { sampleTexts } from '@/lib/sample-text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { History, Play, Send, RefreshCw, Zap, Target, AlertCircle, Timer } from 'lucide-react';
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

    // Test State
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedScore, setSelectedScore] = useState<Score | null>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [userInput, setUserInput] = useState('');
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentTestText = sampleTexts[currentTextIndex];
    const currentTestId = (currentTextIndex + 1).toString();
    
    // Derived Stats
    const correctChars = userInput.split('').reduce((acc, char, index) => {
        return acc + (char === currentTestText[index] ? 1 : 0);
    }, 0);
    const mistakeCount = userInput.length - correctChars;
    const wpm = elapsedTime > 0 ? Math.round(((userInput.length / 5) / elapsedTime) * 60) : 0;
    const accuracy = userInput.length > 0 ? (correctChars / userInput.length) * 100 : 100;

    const startTimer = useCallback(() => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        const start = Date.now() - elapsedTime * 1000;
        setStartTime(start);
        timerIntervalRef.current = setInterval(() => {
            setElapsedTime((Date.now() - start) / 1000);
        }, 100);
    }, [elapsedTime]);

    const stopTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    const resetTest = useCallback((newTextIndex?: number) => {
        stopTimer();
        setIsStarted(false);
        setIsFinished(false);
        setStartTime(null);
        setElapsedTime(0);
        setUserInput('');
        if (newTextIndex !== undefined) {
            setCurrentTextIndex(newTextIndex);
        }
    }, [stopTimer]);

    const handleStart = () => {
        setIsStarted(true);
        startTimer();
    };
    
    const handleNextTest = () => {
        const nextIndex = (currentTextIndex + 1) % sampleTexts.length;
        resetTest(nextIndex);
    }

    const handleComplete = useCallback(async (finalUserInput: string) => {
        if (!user || isFinished) return;

        stopTimer();
        setIsFinished(true);

        const finalElapsedTime = (Date.now() - (startTime ?? Date.now())) / 1000;
        const wordsTyped = finalUserInput.length / 5;
        const finalWpm = finalElapsedTime > 0 ? Math.round((wordsTyped / finalElapsedTime) * 60) : 0;
        
        const finalMistakes: { expected: string; actual: string; position: number }[] = [];
        finalUserInput.split('').forEach((char, index) => {
            if (char !== currentTestText[index]) {
                finalMistakes.push({
                    expected: currentTestText[index],
                    actual: char,
                    position: index
                });
            }
        });
        const finalAccuracy = ((finalUserInput.length - finalMistakes.length) / finalUserInput.length) * 100;

        const result: SubmissionResult = {
            wpm: finalWpm,
            accuracy: finalAccuracy,
            mistakes: finalMistakes,
            timeElapsed: finalElapsedTime,
            userInput: finalUserInput
        };

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
    }, [user, isFinished, startTime, stopTimer, currentTestText, createScore, currentTestId, toast]);
    
    useEffect(() => {
        // Cleanup timer on unmount
        return () => stopTimer();
    }, [stopTimer]);

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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">WPM</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground ml-2"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{wpm}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground ml-2"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Mistakes</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground ml-2"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mistakeCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Timer</CardTitle>
                                <Timer className="h-4 w-4 text-muted-foreground ml-2"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Math.floor(elapsedTime)}s</div>
                            </CardContent>
                        </Card>
                    </div>

                    <TypingTest 
                        text={currentTestText} 
                        userInput={userInput}
                        onUserInputChange={setUserInput}
                        isStarted={isStarted}
                        isFinished={isFinished}
                        onComplete={() => handleComplete(userInput)}
                    />

                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                             <Button onClick={handleNextTest} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Change Paragraph
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            {!isStarted ? (
                                <Button onClick={handleStart}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start
                                </Button>
                            ) : (
                                <Button onClick={() => handleComplete(userInput)} disabled={isFinished}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {isFinished ? 'Submitted' : 'Submit'}
                                </Button>
                            )}
                        </div>
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
