
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

const renderTextWithDiff = (originalText: string, userInput: string) => {
    const originalWords = originalText.split(/(\s+)/); // Keep spaces
    const typedWords = userInput.split(/(\s+)/);
    const result: React.ReactNode[] = [];
    let originalIndex = 0;
    let typedIndex = 0;

    while (originalIndex < originalWords.length || typedIndex < typedWords.length) {
        const originalWord = originalWords[originalIndex];
        const typedWord = typedWords[typedIndex];
        
        // Handle trailing spaces or different length inputs
        if (originalIndex >= originalWords.length) {
            if (typedWord && typedWord.trim()) {
                result.push(<span key={`extra-${typedIndex}`} className="bg-yellow-500/20 text-yellow-400 rounded-sm">{typedWord}</span>);
            } else {
                 result.push(<span key={`extra-space-${typedIndex}`}>{typedWord}</span>);
            }
            typedIndex++;
            continue;
        }

        if (typedIndex >= typedWords.length) {
            if (originalWord && originalWord.trim()) {
                result.push(<span key={`missed-${originalIndex}`} className="bg-gray-500/20 text-gray-400 rounded-sm">{originalWord}</span>);
            } else {
                result.push(<span key={`missed-space-${originalIndex}`}>{originalWord}</span>);
            }
            originalIndex++;
            continue;
        }

        // If it's a space, just add it and continue
        if (/\s+/.test(originalWord)) {
            result.push(<span key={`space-${originalIndex}`}>{originalWord}</span>);
            originalIndex++;
            // Also advance typed pointer if it's also a space
            if (/\s+/.test(typedWord)) {
                typedIndex++;
            }
            continue;
        }

        if (originalWord === typedWord) {
            // Correct word
            result.push(<span key={`correct-${originalIndex}`} className="text-green-400">{originalWord}</span>);
            originalIndex++;
            typedIndex++;
        } else {
             // Look ahead for a match to handle skipped words
            let foundMatch = false;
            for (let lookahead = 1; lookahead <= 3 && originalIndex + lookahead < originalWords.length; lookahead++) {
                if (originalWords[originalIndex + lookahead] === typedWord) {
                    // Skipped words found
                    for (let i = 0; i < lookahead; i++) {
                        const skippedWord = originalWords[originalIndex + i];
                         if (skippedWord && skippedWord.trim()) {
                           result.push(<span key={`skipped-${originalIndex + i}`} className="bg-gray-500/20 text-gray-400 rounded-sm">{skippedWord}</span>);
                        } else {
                            result.push(<span key={`skipped-space-${originalIndex + i}`}>{skippedWord}</span>);
                        }
                    }
                    originalIndex += lookahead;
                    foundMatch = true;
                    break;
                }
            }

            if (foundMatch) {
                // Now render the correctly typed word that we found ahead
                result.push(<span key={`correct-sync-${originalIndex}`} className="text-green-400">{originalWords[originalIndex]}</span>);
                originalIndex++;
                typedIndex++;
            } else {
                // No match found, so it's an incorrect word or an extra word
                 result.push(<span key={`incorrect-${typedIndex}`} className="bg-red-500/20 text-red-400 rounded-sm line-through">{typedWord}</span>);
                 // We still need to show what was expected
                 if(originalWord && originalWord.trim()){
                    result.push(<span key={`expected-${originalIndex}`} className="bg-gray-500/20 text-gray-400 rounded-sm">{originalWord}</span>);
                 }
                originalIndex++;
                typedIndex++;
            }
        }
    }
    return result;
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

    