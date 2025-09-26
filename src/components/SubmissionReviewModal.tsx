
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


const renderCharDiffs = (charDiffs: CharDiff[], word: string, wordIndex: number) => {
    return (
        <span key={wordIndex}>
            {charDiffs.map((charDiff, charIndex) => {
                const key = `${wordIndex}-${charIndex}`;
                switch (charDiff.status) {
                    case 'correct':
                        return <span key={key} className="text-green-400">{charDiff.char}</span>;
                    case 'incorrect':
                        return <span key={key} className="text-red-400 bg-red-500/20">{charDiff.char}</span>;
                    case 'extra':
                        return <span key={key} className="text-yellow-400 bg-yellow-500/20">{charDiff.char}</span>;
                    case 'missing':
                         return <span key={key} className="text-red-400 bg-red-500/20 line-through">{charDiff.char}</span>;
                    case 'pending':
                        return <span key={key} className="text-muted-foreground">{charDiff.char}</span>;
                }
            })}
            {' '}
        </span>
    )
}

const renderWord = (wordDiff: WordDiff, index: number) => {
    switch (wordDiff.status) {
        case 'correct':
            return <span key={index} className="text-green-400">{wordDiff.word}{' '}</span>;
        case 'skipped':
            return <span key={index} className="bg-gray-500/30 text-gray-400 rounded-sm">{wordDiff.word}{' '}</span>;
        case 'extra':
             return <span key={index} className="bg-yellow-500/20 text-yellow-400 rounded-sm">{wordDiff.word}{' '}</span>;
        case 'incorrect':
            if (wordDiff.charDiffs) {
                return renderCharDiffs(wordDiff.charDiffs, wordDiff.word, index);
            }
            return <span key={index} className="text-red-400 bg-red-500/20">{wordDiff.word} </span>;
        case 'whitespace':
            return <span key={index}> </span>;
        case 'pending':
            return <span key={index} className="text-muted-foreground">{wordDiff.word}{' '}</span>;
        default:
            return <span key={index}>{wordDiff.word} </span>;
    }
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
