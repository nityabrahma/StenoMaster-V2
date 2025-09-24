
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
import { cn } from '@/lib/utils';


interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: Score;
  assignment: Assignment;
}


const renderTextWithDiff = (originalText: string, userInput: string) => {
    const originalWords = originalText.split(/(\s+)/); // Split by space but keep delimiters
    const typedWords = userInput.split(/(\s+)/);
    const diff: React.ReactNode[] = [];
    let originalIndex = 0;
    let typedIndex = 0;

    while (originalIndex < originalWords.length || typedIndex < typedWords.length) {
        const originalWord = originalWords[originalIndex];
        const typedWord = typedWords[typedIndex];

        const isOriginalSpace = originalWord && /\s+/.test(originalWord);
        const isTypedSpace = typedWord && /\s+/.test(typedWord);

        if (isOriginalSpace) {
            diff.push(<span key={`space-o-${originalIndex}`}>{originalWord}</span>);
            originalIndex++;
            if (isTypedSpace) {
                typedIndex++;
            }
            continue;
        }

        if (typedIndex >= typedWords.length) {
            // User input is finished, but original text remains. These are missed words.
            diff.push(<span key={`missed-${originalIndex}`} className="text-gray-500 bg-gray-500/20 rounded-sm">{originalWord}</span>);
            originalIndex++;
            continue;
        }

        if (isTypedSpace) {
             // User typed a space, but we are expecting a word. Treat as extra space.
             diff.push(<span key={`extra-space-${typedIndex}`}>{typedWord}</span>);
             typedIndex++;
             continue;
        }
        
        if (originalWord === typedWord) {
            // Correct word
            diff.push(<span key={`correct-${originalIndex}`} className="text-green-400">{originalWord}</span>);
            originalIndex++;
            typedIndex++;
        } else {
            // Look ahead to see if a word was skipped
            const lookaheadIndex = originalWords.indexOf(typedWord, originalIndex + 1);
            if (lookaheadIndex !== -1 && lookaheadIndex < originalIndex + 3) { // Look ahead 1-2 words
                // Words from originalIndex to lookaheadIndex-1 were skipped
                for (let i = originalIndex; i < lookaheadIndex; i++) {
                     if (originalWords[i] && !/\s+/.test(originalWords[i])) {
                        diff.push(<span key={`skipped-${i}`} className="text-gray-500 bg-gray-500/20 rounded-sm">{originalWords[i]}</span>);
                     }
                      if (originalWords[i+1] && /\s+/.test(originalWords[i+1])) {
                        diff.push(<span key={`space-skip-${i}`}>{originalWords[i+1]}</span>);
                        i++;
                     }
                }
                // Now push the correctly typed word
                diff.push(<span key={`correct-lookahead-${lookaheadIndex}`} className="text-green-400">{typedWord}</span>);
                originalIndex = lookaheadIndex + 1;
                typedIndex++;
            } else {
                // Incorrect word (misspelling)
                diff.push(<span key={`incorrect-${typedIndex}`} className="text-red-400 bg-red-500/20 rounded-sm line-through">{typedWord || '___'}</span>);
                originalIndex++;
                typedIndex++;
            }
        }
    }
    
    return diff;
};


export default function SubmissionReviewModal({
  isOpen,
  onClose,
  score,
  assignment,
}: SubmissionReviewModalProps) {
  
  if (!score || !assignment) return null;
  
  const coloredText = useMemo(() => renderTextWithDiff(assignment.text, score.userInput), [assignment.text, score.userInput]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
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

        <Card className="max-h-[40vh] overflow-y-auto bg-background/80">
          <CardContent className="p-4">
            <p className="font-code text-base leading-relaxed whitespace-pre-wrap">
              {coloredText}
            </p>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
