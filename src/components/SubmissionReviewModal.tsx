
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Score, Assignment } from '@/lib/types';
import { Zap, Target, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { generateWordDiff, WordDiff, CharDiff } from '@/lib/evaluation';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';


const renderWord = (wordDiff: WordDiff, index: number) => {
    if (wordDiff.status === 'whitespace') {
        return <span key={index}> </span>;
    }
    if (wordDiff.status === 'correct') {
        return <span key={index} className="text-green-400">{wordDiff.word}{' '}</span>;
    }
    if (wordDiff.status === 'skipped') {
        return <span key={index} className="bg-gray-500/30 text-gray-400 rounded-sm">{wordDiff.word}{' '}</span>;
    }
    if (wordDiff.status === 'extra') {
         return <span key={index} className="bg-yellow-500/20 text-yellow-400 rounded-sm">{wordDiff.word}{' '}</span>;
    }

    // Handle incorrect with char-level diff
    if (wordDiff.status === 'incorrect' && wordDiff.charDiffs) {
        return (
            <span key={index}>
                {wordDiff.charDiffs.map((charDiff, charIndex) => {
                    let className = '';
                    switch (charDiff.status) {
                        case 'correct':
                            className = 'text-green-400';
                            break;
                        case 'incorrect':
                            className = 'bg-red-500/20 text-red-400';
                            break;
                        case 'extra':
                            className = 'bg-yellow-500/20 text-yellow-400';
                            break;
                        case 'missing':
                             return <span key={charIndex} className="bg-red-500/20 text-red-400 line-through">{charDiff.char}</span>
                    }
                    return <span key={charIndex} className={className}>{charDiff.char}</span>;
                })}
                {' '}
            </span>
        );
    }

    return <span key={index}>{wordDiff.word}{' '}</span>
}


interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: Score;
  assignment: Assignment;
}


export default function SubmissionReviewModal({
  isOpen,
  onClose,
  score,
  assignment,
}: SubmissionReviewModalProps) {
  
  if (!score || !assignment) return null;
  
  const wordDiffs = useMemo(() => generateWordDiff(assignment.text, score.userInput), [assignment.text, score.userInput]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Review: {assignment.title}
          </DialogTitle>
          <DialogDescription>
            Here's a detailed breakdown of your performance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 my-4">
            <Card className="bg-card/70 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                    <Zap className="h-6 w-6 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">WPM</p>
                        <p className="text-2xl font-bold">{score.wpm}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card/70 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                    <Target className="h-6 w-6 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-2xl font-bold">{score.accuracy.toFixed(1)}%</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card/70 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Mistakes</p>
                        <p className="text-2xl font-bold">{score.mistakes.length}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-2 gap-6 h-[40vh]">
            <div className="flex flex-col">
                <h3 className="font-semibold mb-2">Your Submission with Errors</h3>
                <Card className="flex-1 bg-background/80 overflow-y-auto">
                    <CardContent className="p-4">
                        <p className="font-code text-base leading-relaxed whitespace-pre-wrap">
                            {wordDiffs.map(renderWord)}
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col">
                <h3 className="font-semibold mb-2">Mistakes Breakdown</h3>
                <Card className="flex-1 bg-background/80">
                    <ScrollArea className="h-full">
                        <CardContent className="p-4">
                            {score.mistakes.length === 0 ? (
                                <p className="text-muted-foreground text-center pt-10">No mistakes found. Great job!</p>
                            ) : (
                                <ul className="space-y-3">
                                    {score.mistakes.map((mistake, index) => (
                                        <li key={index} className="text-sm border-b border-border/50 pb-2">
                                            {mistake.actual === '' ? (
                                                <p><span className="font-semibold text-gray-400">Skipped:</span> "{mistake.expected}"</p>
                                            ) : mistake.expected === '' ? (
                                                 <p><span className="font-semibold text-yellow-400">Extra Word:</span> "{mistake.actual}"</p>
                                            ) : (
                                                <p><span className="font-semibold text-red-400">Incorrect:</span> You typed "{mistake.actual}" instead of "{mistake.expected}"</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </ScrollArea>
                </Card>
            </div>
        </div>


        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
