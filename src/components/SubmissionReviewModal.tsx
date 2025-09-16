
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


const renderTextWithDiff = (originalText: string, userInput: string, mistakes: Score['mistakes']) => {
    const mistakePositions = new Set(mistakes.map(m => m.position));
    
    return originalText.split('').map((char, index) => {
        let className = 'text-muted-foreground';

        if (index < userInput.length) {
            if (mistakePositions.has(index)) {
                 className = 'text-red-400 bg-red-500/20 rounded-sm';
            } else {
                className = 'text-green-400';
            }
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
  score,
  assignment,
}: SubmissionReviewModalProps) {
  
  if (!score || !assignment) return null;
  
  const coloredText = useMemo(() => renderTextWithDiff(assignment.text, score.userInput, score.mistakes), [assignment.text, score.userInput, score.mistakes]);

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
