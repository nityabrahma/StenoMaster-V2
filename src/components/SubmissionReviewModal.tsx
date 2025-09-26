
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
import { generateAdvancedDiff, WordDiff, CharDiff } from '@/lib/evaluation';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

const renderWord = (wordDiff: WordDiff, index: number) => {
    const { status, word, expected } = wordDiff;

    switch (status) {
        case 'correct':
            return <span key={index}>{word}</span>;
        case 'skipped':
            // Render the skipped word from original text with a grey background
            return <span key={index} className="bg-gray-500/30 text-gray-400 rounded-sm p-1">{word}</span>;
        case 'extra':
            // Render the extra word the user typed with a yellow background
            return <span key={index} className="bg-yellow-500/20 text-yellow-400 rounded-sm p-1">{word}</span>;
        case 'incorrect':
            // Render the incorrect word followed by the expected word in green brackets
            return (
                <span key={index}>
                    <span className="text-red-400 bg-red-500/20 rounded-sm p-1">{word}</span>
                    <span className="text-green-300">[{expected}]</span>
                </span>
            );
        case 'whitespace':
            return <span key={index}>{word}</span>;
        case 'pending':
            // In a final review, "pending" means "not typed". We render it greyed out.
            return <span key={index} className="text-muted-foreground opacity-70">{word}</span>;
        default:
            return <span key={index}>{word}</span>;
    }
};

const combineTokens = (diffs: WordDiff[]): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let currentText = '';

    diffs.forEach((diff, i) => {
        if (diff.status === 'correct' || diff.status === 'whitespace') {
            currentText += diff.word;
        } else {
            if (currentText) {
                result.push(currentText);
                currentText = '';
            }
            result.push(renderWord(diff, i));
        }
    });

    if (currentText) {
        result.push(currentText);
    }

    return result;
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

    // Re-generate the diff based on the final submitted text
    const wordDiffs = useMemo(() => generateAdvancedDiff(assignment.text, score.userInput), [assignment.text, score.userInput]);

    const combinedNodes = useMemo(() => combineTokens(wordDiffs), [wordDiffs]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[90vh]">
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
                            <Zap className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">WPM</p>
                                <p className="text-2xl font-bold">{score.wpm}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/70 border-none">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Target className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Accuracy</p>
                                <p className="text-2xl font-bold">{score.accuracy.toFixed(1)}%</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/70 border-none">
                        <CardContent className="p-4 flex items-center gap-4">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                            <div>
                                <p className="text-sm text-muted-foreground">Mistakes</p>
                                <p className="text-2xl font-bold">{score.mistakes.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col">
                    <h3 className="font-semibold mb-2">Your Submission with Errors</h3>
                    <ScrollArea className="h-[50vh]">
                        <Card className="flex-1 bg-background/80 overflow-y-auto">
                            <CardContent className="p-4">
                                <p className="font-code text-lg leading-relaxed whitespace-pre-wrap">
                                    {combinedNodes.map((node, i) => <React.Fragment key={i}>{node}</React.Fragment>)}
                                </p>
                            </CardContent>
                        </Card>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
