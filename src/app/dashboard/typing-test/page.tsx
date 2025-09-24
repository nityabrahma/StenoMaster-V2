
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TypingTest from '@/components/typing-test';
import { sampleTexts } from '@/lib/sample-text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { History, Play, Send, RefreshCw, Zap, Target, Timer, Loader2 } from 'lucide-react';
import type { SubmissionResult } from '@/components/typing-test';
import { useDataStore } from '@/hooks/use-data-store';
import { useAuth } from '@/hooks/use-auth';
import PracticeTestsModal from '@/components/PracticeTestsModal';
import SubmissionReviewModal from '@/components/SubmissionReviewModal';
import type { Assignment, Score, Mistake } from '@/lib/types';
import { cn } from '@/lib/utils';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [userInput, setUserInput] = useState('');
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentTestText = sampleTexts[currentTextIndex];
    const currentTestId = (currentTextIndex + 1).toString();
    
    // Derived Stats
    const typedWords = userInput.split(/\s+/).filter(Boolean);
    const wordsTypedCount = typedWords.length;
    const wpm = elapsedTime > 0 ? Math.round((wordsTypedCount / elapsedTime) * 60) : 0;
    
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
    
    const resetTest = useCallback((nextIndex?: number) => {
        stopTimer();
        setIsStarted(false);
        setIsFinished(false);
        setStartTime(null);
        setElapsedTime(0);
        setUserInput('');
        if(nextIndex !== undefined) {
            setCurrentTextIndex(nextIndex);
        } else {
            setCurrentTextIndex((current) => (current + 1) % sampleTexts.length);
        }
    }, [stopTimer]);

    const handleStart = () => {
        setIsStarted(true);
        startTimer();
    };

    const handleComplete = useCallback(async (finalUserInput: string) => {
        if (!user || isFinished || isSubmitting) return;
    
        setIsSubmitting(true);
        stopTimer();
        setIsFinished(true);
    
        const finalElapsedTime = (Date.now() - (startTime ?? Date.now())) / 1000;
        const trimmedUserInput = finalUserInput.trim();
        const typedWords = trimmedUserInput.split(/\s+/).filter(Boolean);
        const wordsTypedCount = typedWords.length;
        const finalWpm = finalElapsedTime > 0 ? Math.round((wordsTypedCount / finalElapsedTime) * 60) : 0;
        
        const originalWords = currentTestText.split(/\s+/).filter(Boolean);
        const finalMistakes: Mistake[] = [];
        let correctChars = 0;
        let originalIndex = 0;
        let typedIndex = 0;

        while (originalIndex < originalWords.length || typedIndex < typedWords.length) {
            const originalWord = originalWords[originalIndex];
            const typedWord = typedWords[typedIndex];

            if (originalIndex >= originalWords.length) {
                finalMistakes.push({ expected: '', actual: typedWord, position: trimmedUserInput.length -1 });
                typedIndex++;
                continue;
            }
            if (typedIndex >= typedWords.length) {
                finalMistakes.push({ expected: originalWord, actual: '', position: trimmedUserInput.length });
                originalIndex++;
                continue;
            }

            if (originalWord === typedWord) {
                correctChars += originalWord.length;
                originalIndex++;
                typedIndex++;
            } else {
                let foundMatch = false;
                for (let lookahead = 1; lookahead <= 5 && (originalIndex + lookahead) < originalWords.length; lookahead++) {
                    if (originalWords[originalIndex + lookahead] === typedWord) {
                        for (let i = 0; i < lookahead; i++) {
                            finalMistakes.push({ expected: originalWords[originalIndex + i], actual: '', position: trimmedUserInput.indexOf(typedWord) });
                        }
                        originalIndex += lookahead;
                        foundMatch = true;
                        break;
                    }
                }

                if (foundMatch) {
                    correctChars += typedWord.length;
                    originalIndex++;
                    typedIndex++;
                } else {
                    finalMistakes.push({ expected: originalWord, actual: typedWord, position: trimmedUserInput.indexOf(typedWord) });
                    originalIndex++;
                    typedIndex++;
                }
            }
        }
        
        const totalPossibleChars = currentTestText.replace(/\s+/g, ' ').length;
        const finalAccuracy = totalPossibleChars > 0 ? (correctChars / totalPossibleChars) * 100 : 0;
    
        const result: Omit<Score, 'id' | 'studentId'> = {
            assignmentId: `practice-${currentTestId}`,
            completedAt: new Date().toISOString(),
            wpm: finalWpm,
            accuracy: Math.max(0, finalAccuracy),
            mistakes: finalMistakes,
            timeElapsed: finalElapsedTime,
            userInput: trimmedUserInput
        };
    
        try {
            await createScore(result);
            toast({
                title: "Practice Complete!",
                description: `Your score: ${finalWpm} WPM at ${Math.max(0, finalAccuracy).toFixed(1)}% accuracy.`,
            });
            resetTest();
        } catch (error: any) {
            toast({
                title: "Practice Submission Failed",
                description: error.message || "Could not save your practice score.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [user, isFinished, isSubmitting, startTime, stopTimer, currentTestText, createScore, currentTestId, toast, resetTest]);
    
    useEffect(() => {
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
                        <div className="flex gap-2">
                            <Button onClick={() => resetTest()} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Change Paragraph
                            </Button>
                             {!isStarted ? (
                                <Button onClick={handleStart}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start
                                </Button>
                            ) : (
                                <Button onClick={() => handleComplete(userInput)} disabled={isFinished || isSubmitting}>
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setIsListModalOpen(true)}>
                                <History className="mr-2 h-4 w-4" />
                                View Results
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                        <Card className='bg-card/50'>
                            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">WPM</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground ml-2"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{wpm}</div>
                            </CardContent>
                        </Card>
                         <Card className='bg-card/50'>
                            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground ml-2"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">--%</div>
                            </CardContent>
                        </Card>
                        <Card className='bg-card/50'>
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

    