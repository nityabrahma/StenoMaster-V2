
'use client';
import { useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Mistake } from '@/lib/types';
import { cn } from '@/lib/utils';

export type SubmissionResult = {
  wpm: number;
  accuracy: number;
  mistakes: Mistake[];
  timeElapsed: number;
  userInput: string;
};

type TypingTestProps = {
  text: string;
  userInput: string;
  onUserInputChange: (value: string) => void;
  isStarted: boolean;
  isFinished: boolean;
  onComplete: () => void;
};


export default function TypingTest({ 
    text, 
    userInput, 
    onUserInputChange, 
    isStarted, 
    isFinished,
    onComplete,
}: TypingTestProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isStarted && !isFinished) {
      inputRef.current?.focus();
    }
  }, [isStarted, isFinished]);
  
  useEffect(() => {
    // Reset user input when the text changes
    onUserInputChange('');
  }, [text, onUserInputChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isFinished) return;

    const value = e.target.value;
    onUserInputChange(value);

    if (value.length >= text.length) {
      onComplete();
    }
  };
  
  const renderedText = useMemo(() => {
    const originalWords = text.split(/(\s+)/); // Split by space but keep them
    const typedWords = userInput.split(/(\s+)/);

    return originalWords.map((word, index) => {
      if (index >= typedWords.length) {
        // This is for un-typed text, including the cursor
        const isCursorPosition = index === typedWords.length;
        if (isCursorPosition && isStarted && !isFinished) {
            return (
                <span key={index} className="relative">
                    <span className="animate-pulse border-b-2 border-primary absolute left-0 top-0 bottom-0"></span>
                    <span className="text-muted-foreground opacity-0">{word}</span>
                </span>
            );
        }
        return <span key={index} className='text-muted-foreground'>{word}</span>
      }

      if (/\s+/.test(word)) { // It's a whitespace
        return <span key={index}>{word}</span>;
      }

      let className = 'text-destructive bg-red-500/20'; // Incorrect by default
      if (word === typedWords[index]) {
        className = 'text-green-400';
      }
      
      return <span key={index} className={cn('rounded-sm', className)}>{word}</span>
    });

  }, [text, userInput, isStarted, isFinished]);

  return (
    <Card className="relative" onClick={() => inputRef.current?.focus()}>
      <CardContent className="p-6">
        <p className="font-code text-lg leading-relaxed tracking-wider">
          {renderedText}
        </p>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="absolute inset-0 opacity-0 cursor-text"
          disabled={!isStarted || isFinished}
          autoFocus={isStarted}
        />
      </CardContent>
    </Card>
  );
}
