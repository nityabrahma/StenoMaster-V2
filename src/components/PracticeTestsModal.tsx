
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
import type { Submission } from '@/lib/types';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';

interface PracticeTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: Submission[];
  onSelectSubmission: (submission: Submission) => void;
}

export default function PracticeTestsModal({
  isOpen,
  onClose,
  submissions,
  onSelectSubmission,
}: PracticeTestsModalProps) {
  const { colorScheme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl w-full rounded-xl bg-gradient-to-br backdrop-blur-xl border-0 shadow-2xl ${
          colorScheme === 'dark'
            ? 'modal-gradient-dark-bg'
            : 'modal-gradient-light-bg'
        }`}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Practice Test History</DialogTitle>
          <DialogDescription>
            Review your past practice test performances. Click an item to see details.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {submissions.length > 0 ? (
                [...submissions]
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((submission) => (
                    <Card
                        key={submission.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => onSelectSubmission(submission)}
                    >
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">
                                    {format(new Date(submission.submittedAt), 'MMMM d, yyyy - h:mm a')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Text ID: {submission.assignmentId.replace('practice-', '')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-primary">{submission.wpm} WPM</p>
                                <p className="text-sm">{submission.accuracy.toFixed(1)}% Accuracy</p>
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
