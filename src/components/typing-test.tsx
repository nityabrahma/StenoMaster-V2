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
  strict?: boolean; // New prop for strict mode
};


export default function TypingTest({ 
    text, 
    userInput, 
    onUserInputChange, 
    isStarted, 
    isFinished,
    onComplete,
    strict = false, // Default to false
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
    
    // Strict mode: check for 2 consecutive errors
    if (strict && value.length > userInput.length && value.length > 1) {
      const lastTypedCharIndex = value.length - 1;
      const secondLastTypedCharIndex = value.length - 2;

      const isLastCharIncorrect = value[lastTypedCharIndex] !== text[lastTypedCharIndex];
      const isSecondLastCharIncorrect = value[secondLastTypedCharIndex] !== text[secondLastTypedCharIndex];

      if (isLastCharIncorrect && isSecondLastCharIncorrect) {
        // Prevent typing the new character by not calling onUserInputChange
        return; 
      }
    }
    
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
        const isTyped = index < typedChars.length;
        const isCursorPosition = index === typedChars.length;

        if (isTyped) {
            if (typedChars[index] === char) {
                className = 'text-green-400';
            } else {
                className = 'text-red-400 bg-red-500/20';
            }
        }

        if (isCursorPosition && isStarted && !isFinished) {
            return (
                <span key={index} className="relative">
                    <span className={cn("animate-pulse border-b-2 border-primary absolute left-0 top-0 bottom-0", className)}>
                        {char}
                    </span>
                    <span className="opacity-0">{char}</span>
                </span>
            );
        }

        return <span key={index} className={cn('rounded-sm', className)}>{char}</span>;
    });
}, [text, userInput, isStarted, isFinished]);


  return (
    <Card className="relative" onClick={() => inputRef.current?.focus()}>
      <CardContent className="p-6">
        <div className="font-code text-lg leading-relaxed tracking-wider">
          {renderedText}
        </div>
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
