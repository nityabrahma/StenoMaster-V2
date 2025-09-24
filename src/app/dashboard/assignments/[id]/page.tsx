
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Send, Timer, Zap, Target, AlertCircle, XCircle } from 'lucide-react';
import { useDataStore } from '@/hooks/use-data-store';
import { useAppRouter } from '@/hooks/use-app-router';
import { Textarea } from '@/components/ui/textarea';
import type { Mistake } from '@/lib/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export default function AssignmentPage() {
  const { user } = useAuth();
  const router = useAppRouter();
  const params = useParams();
  const { toast } = useToast();
  const { assignments, createScore } = useDataStore();
  
  const assignmentId = typeof params.id === 'string' ? params.id : '';
  const assignment = assignments.find((a) => a.id === assignmentId);

  // Test State
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userInput, setUserInput] = useState('');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Final Stats
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalMistakes, setFinalMistakes] = useState(0);

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

  const handleStart = () => {
    setIsStarted(true);
    startTimer();
  };

  const handleSubmit = async () => {
    if (!user || !assignment || isFinished || isSubmitting) return;

    setIsSubmitting(true);
    stopTimer();

    const finalElapsedTime = (Date.now() - (startTime ?? Date.now())) / 1000;
    const finalUserInput = userInput.trim();
    const typedWords = finalUserInput.split(/\s+/).filter(Boolean);
    const wordsTypedCount = typedWords.length;
    const finalWpmCalc = finalElapsedTime > 0 ? Math.round((wordsTypedCount / finalElapsedTime) * 60) : 0;

    const originalWords = assignment.text.split(/\s+/).filter(Boolean);
    const mistakes: Mistake[] = [];
    let correctChars = 0;
    let typedWordIndex = 0;
    let originalWordIndex = 0;
    let currentInputPos = 0;

    while (typedWordIndex < typedWords.length && originalWordIndex < originalWords.length) {
        const typedWord = typedWords[typedWordIndex];
        const originalWord = originalWords[originalWordIndex];

        // Find the start position of the current typed word in the user's input string
        const searchPos = userInput.indexOf(typedWord, currentInputPos);
        const position = searchPos !== -1 ? searchPos : currentInputPos;

        if (typedWord === originalWord) {
            correctChars += originalWord.length;
            typedWordIndex++;
            originalWordIndex++;
        } else {
            // Look ahead in original text to see if we skipped a word
            let foundMatch = false;
            for (let i = 1; i <= 2 && originalWordIndex + i < originalWords.length; i++) {
                if (typedWord === originalWords[originalWordIndex + i]) {
                    // Words were skipped
                    for (let j = 0; j < i; j++) {
                        mistakes.push({
                            expected: originalWords[originalWordIndex + j],
                            actual: '', // Empty string indicates a skipped word
                            position: position, // Position of where the skip happened
                        });
                    }
                    correctChars += typedWord.length;
                    originalWordIndex += (i + 1);
                    typedWordIndex++;
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                // It's a simple misspelling
                mistakes.push({
                    expected: originalWord,
                    actual: typedWord,
                    position: position,
                });
                // In a simple misspelling, we can still count correct characters if we want.
                // For simplicity, we can say if misspelled, no chars are correct for that word.
                // Or a more complex char-by-char diff could be done here.
                // Let's assume the word is just wrong for now.
                originalWordIndex++;
                typedWordIndex++;
            }
        }
        currentInputPos = position + typedWord.length;
    }
    
    // Add any remaining original words as skipped
    if (originalWordIndex < originalWords.length) {
        for (let i = originalWordIndex; i < originalWords.length; i++) {
            mistakes.push({ expected: originalWords[i], actual: '', position: userInput.length });
        }
    }

    const totalPossibleChars = assignment.text.length;
    const finalAccuracyCalc = totalPossibleChars > 0 ? (correctChars / totalPossibleChars) * 100 : 0;
    
    setFinalWpm(finalWpmCalc);
    setFinalAccuracy(finalAccuracyCalc);
    setFinalMistakes(mistakes.length);

    try {
        await createScore({
            assignmentId: assignment.id,
            completedAt: new Date().toISOString(),
            wpm: finalWpmCalc,
            accuracy: Math.max(0, finalAccuracyCalc), // Ensure accuracy isn't negative
            mistakes: mistakes,
            timeElapsed: finalElapsedTime,
            userInput: finalUserInput,
        });
      
        toast({
            title: "Assignment Submitted!",
            description: `Your score: ${finalWpmCalc} WPM at ${Math.max(0, finalAccuracyCalc).toFixed(1)}% accuracy.`,
        });

        setIsFinished(true);
        router.push('/dashboard/assignments');
    } catch (error: any) {
        toast({
            title: "Submission Failed",
            description: error.message || "Could not submit your assignment.",
            variant: "destructive"
        });
        setIsSubmitting(false); // Allow retry if submission fails
    }
  };
  
  useEffect(() => {
    // Cleanup timer on unmount
    return () => stopTimer();
  }, [stopTimer]);

  if (!assignment) {
    // This can happen briefly on first load, or if ID is invalid.
    // The useDataStore is responsible for fetching, so if it's not found after load, it's a 404.
    const isLoaded = assignments.length > 0;
    if (isLoaded) {
      return notFound();
    }
    return null; // Or a loading skeleton
  }

  const hasImage = !!assignment.imageUrl;

  return (
    <div className="container mx-auto p-4 md:p-8 h-full">
        <div className={cn("grid gap-8 h-full", hasImage ? "md:grid-cols-2" : "grid-cols-1")}>
            {hasImage && (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden my-auto">
                <Image
                    src={assignment.imageUrl}
                    alt={assignment.title}
                    fill
                    style={{ objectFit: 'cover' }}
                />
                </div>
            )}
            
            <div className={cn("flex flex-col h-full", !hasImage && "col-span-1")}>
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <CardTitle className="font-headline text-xl">{assignment.title}</CardTitle>
                             <div className="flex gap-2">
                                {!isStarted ? (
                                    <Button onClick={handleStart} size="sm">
                                        <Play className="mr-2 h-4 w-4" />
                                        Start
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={isSubmitting || !userInput} size="sm">
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 h-4 w-4" />
                                        )}
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </Button>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={isSubmitting}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will cancel the assignment attempt. Your progress will not be saved.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Continue Typing</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => router.push('/dashboard/assignments')}>Yes, Cancel</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                       <div className="grid grid-cols-3 gap-4 text-center">
                            <Card className='bg-card/50'>
                                <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">WPM</CardTitle>
                                    <Zap className="h-4 w-4 text-muted-foreground ml-2"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{finalWpm}</div>
                                </CardContent>
                            </Card>
                            <Card className='bg-card/50'>
                                <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground ml-2"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{finalAccuracy.toFixed(1)}%</div>
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
                       
                        <CardDescription className="text-center">
                            {isStarted ? "Begin typing now. The timer has started." : "Click the 'Start' button to begin the timer and enable typing."}
                        </CardDescription>

                        <Card className="flex-1 bg-transparent mt-4 p-3">
                            <Textarea
                                placeholder="Start typing here..."
                                className="h-full w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none font-code text-lg"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                disabled={!isStarted || isFinished}
                                autoFocus
                            />
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
