
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import type { Score } from '@/lib/types';
import { format } from 'date-fns';

interface PracticeTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: Score[];
  onSelectScore: (score: Score) => void;
}

export default function PracticeTestsModal({
  isOpen,
  onClose,
  scores,
  onSelectScore,
}: PracticeTestsModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Practice Test History</DialogTitle>
          <DialogDescription>
            Review your past practice test performances. Click an item to see details.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {scores.length > 0 ? (
                [...scores]
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .map((score) => (
                    <Card
                        key={score.id}
                        className="cursor-pointer bg-card/70 hover:bg-card/90 transition-colors"
                        onClick={() => onSelectScore(score)}
                    >
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">
                                    {format(new Date(score.completedAt), 'MMMM d, yyyy - h:mm a')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Text ID: {score.assignmentId.replace('practice-', '')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-primary">{score.wpm} WPM</p>
                                <p className="text-sm">{score.accuracy.toFixed(1)}% Accuracy</p>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                You haven't completed any practice tests yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
