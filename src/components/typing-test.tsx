
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
    const originalChars = text.split('');
    const typedChars = userInput.split('');

    return originalChars.map((char, index) => {
        let className = 'text-muted-foreground';
        let charToRender = char;
        
        if(index < typedChars.length) {
            if(typedChars[index] === char) {
                className = 'text-green-400';
            } else {
                className = 'text-red-400 bg-red-500/20';
                if(char === ' ') {
                   charToRender = '_';
                }
            }
        }

        const isCursorPosition = index === typedChars.length;
        if (isCursorPosition && isStarted && !isFinished) {
            return (
                <span key={index} className="relative">
                    <span className={cn("animate-pulse border-b-2 border-primary absolute left-0 top-0 bottom-0", className)}>
                        {charToRender}
                    </span>
                    <span className="opacity-0">{charToRender}</span>
                </span>
            );
        }

        return <span key={index} className={cn('rounded-sm', className)}>{charToRender}</span>;
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

