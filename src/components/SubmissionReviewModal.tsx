
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
import { useTheme } from '@/hooks/use-theme';
import type { Submission, Assignment } from '@/lib/types';
import { Zap, Target, AlertCircle } from 'lucide-react';

interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  assignment: Assignment;
}

const renderTextWithDiff = (originalText: string, userInput: string = '') => {
  const originalWords = originalText.split(/(\s+)/);
  const userWords = userInput.split(/(\s+)/);
  let userWordIndex = 0;

  const result = originalWords.map((originalWord, originalIndex) => {
    // If it's just whitespace, return it.
    if (originalWord.trim() === '') {
      return <span key={`space-o-${originalIndex}`}>{originalWord}</span>;
    }

    // Find the corresponding word in the user's input
    let currentUserWord = '';
    let foundMatch = false;

    // This loop is to find the next non-whitespace word in the user's input
    while(userWordIndex < userWords.length) {
        currentUserWord = userWords[userWordIndex];
        if(currentUserWord.trim() !== '') {
            break; // Found a word to compare
        }
        // It's whitespace, render and continue
        userWordIndex++;
    }
    
    if (userWordIndex >= userWords.length) {
      // This and all subsequent words are untyped
      return (
        <span key={`untyped-${originalIndex}`} className="text-muted-foreground/50">
          {originalWord}
        </span>
      );
    }
    
    userWordIndex++;

    if (originalWord === currentUserWord) {
      // Perfect match
      return (
        <span key={`correct-${originalIndex}`} className="text-green-600 dark:text-green-500">
          {originalWord}
        </span>
      );
    } else {
        // Incorrect word, render the user's word with error styling
        return (
            <span key={`incorrect-${originalIndex}`} className="text-red-600 dark:text-red-500 bg-red-500/10 rounded-sm">
                {currentUserWord}
            </span>
        );
    }
  });

  return result;
};


export default function SubmissionReviewModal({
  isOpen,
  onClose,
  submission,
  assignment,
}: SubmissionReviewModalProps) {
  const { colorScheme } = useTheme();
  
  if (!submission || !assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-3xl w-full rounded-xl bg-gradient-to-br backdrop-blur-xl border-0 shadow-2xl ${
          colorScheme === 'dark'
            ? 'modal-gradient-dark-bg'
            : 'modal-gradient-light-bg'
        }`}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Review: {assignment.title}
          </DialogTitle>
          <DialogDescription>
            Here's a detailed breakdown of your performance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 my-4">
            <Card className="bg-transparent">
                <CardContent className="p-4 flex items-center gap-4">
                    <Zap className="h-6 w-6 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">WPM</p>
                        <p className="text-2xl font-bold">{submission.wpm}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-transparent">
                <CardContent className="p-4 flex items-center gap-4">
                    <Target className="h-6 w-6 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-2xl font-bold">{submission.accuracy.toFixed(1)}%</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-transparent">
                <CardContent className="p-4 flex items-center gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Mistakes</p>
                        <p className="text-2xl font-bold">{submission.mistakes}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="max-h-[40vh] overflow-y-auto bg-background/50">
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
