
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

interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  assignment: Assignment;
}

function getStatusArray(
  original: string,
  typed: string = '',
  lookahead = 4
): ("correct" | "wrong" | "pending")[] {
  const oChars = original.split("");
  const tChars = typed.split("");

  let oIndex = 0;
  let tIndex = 0;

  const statusArray: ("correct" | "wrong" | "pending")[] = new Array(
    oChars.length
  ).fill("pending");

  while (oIndex < oChars.length && tIndex < tChars.length) {
      if (oChars[oIndex] === tChars[tIndex]) {
        statusArray[oIndex] = "correct";
        oIndex++;
        tIndex++;
      } else {
        let found = false;
        for (let la = 1; la <= lookahead; la++) {
          if (tIndex + la < tChars.length && tChars[tIndex + la] === oChars[oIndex]) {
            statusArray[oIndex] = "wrong";
            tIndex += la;
            found = true;
            break; 
          }
          if (oIndex + la < oChars.length && oChars[oIndex + la] === tChars[tIndex]) {
            for (let k = 0; k < la; k++) {
              statusArray[oIndex + k] = "wrong";
            }
            oIndex += la;
            found = true;
            break;
          }
        }

        if (!found) {
          statusArray[oIndex] = "wrong";
          oIndex++;
          tIndex++;
        }
      }
  }

  return statusArray;
}

const renderTextWithDiff = (originalText: string, userInput: string = '') => {
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
                className = 'text-muted-foreground/50';
                break;
            default:
                break;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-3xl w-full">
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
            <p className="font-code text-base leading-relaxed tracking-wide whitespace-pre-wrap">
              {renderTextWithDiff(assignment.text, submission.userInput)}
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
