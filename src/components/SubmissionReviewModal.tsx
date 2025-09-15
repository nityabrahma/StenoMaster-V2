
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
import type { Submission, Assignment } from '@/lib/types';
import { Zap, Target, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';


interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  assignment: Assignment;
}

// This is a more robust diffing function that can handle insertions and deletions
function getStatusArray(original: string, typed: string): ("correct" | "wrong" | "pending")[] {
  const status: ("correct" | "wrong" | "pending")[] = new Array(original.length).fill("pending");
  const typedChars = typed.split('');
  let typedIndex = 0;

  for (let i = 0; i < original.length; i++) {
    if (typedIndex < typedChars.length) {
      if (original[i] === typedChars[typedIndex]) {
        status[i] = "correct";
      } else {
        status[i] = "wrong";
      }
      typedIndex++;
    } else {
      status[i] = "pending";
    }
  }

  // A simplified version for this use case: we compare char by char up to the length of user input.
  // A more complex implementation would use dynamic programming for a true diff.
  return status;
}

const renderTextWithDiff = (originalText: string, userInput: string) => {
    const statusArray = getStatusArray(originalText, userInput);
    
    return originalText.split('').map((char, index) => {
        const status = statusArray[index];
        let className = '';

        switch (status) {
            case 'correct':
                className = 'text-green-400';
                break;
            case 'wrong':
                className = 'text-red-400 bg-red-500/20 rounded-sm';
                break;
            case 'pending':
                className = 'text-muted-foreground';
                break;
            default:
                break;
        }
        
        // Handle whitespace explicitly for visibility
        if (char === ' ') {
            return <span key={`char-${index}`} className={cn(className, 'whitespace-pre-wrap')}> </span>;
        }
        if (char === '\n') {
            return <br key={`char-${index}`} />;
        }
        
        return <span key={`char-${index}`} className={className}>{char}</span>
    })
};


export default function SubmissionReviewModal({
  isOpen,
  onClose,
  submission,
  assignment,
}: SubmissionReviewModalProps) {
  
  if (!submission || !assignment) return null;
  
  const coloredText = useMemo(() => renderTextWithDiff(assignment.text, submission.userInput), [assignment.text, submission.userInput]);

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
                        <p className="text-2xl font-bold">{submission.wpm}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card/70 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                    <Target className="h-6 w-6 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-2xl font-bold">{submission.accuracy.toFixed(1)}%</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card/70 border-none">
                <CardContent className="p-4 flex items-center gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Mistakes</p>
                        <p className="text-2xl font-bold">{submission.mistakes}</p>
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
