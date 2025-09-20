
'use client';
import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Mistake } from '@/lib/types';

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
  
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-muted-foreground';
      
      if (index < userInput.length) {
          if (userInput[index] === char) {
              className = 'text-foreground';
          } else {
              className = 'text-destructive';
          }
      }
      
      if (isStarted && !isFinished && index === userInput.length) {
        className += ' animate-pulse border-b-2 border-primary';
      }
      return <span key={index} className={className}>{char}</span>;
    });
  };

  return (
    <Card className="relative" onClick={() => inputRef.current?.focus()}>
      <CardContent className="p-6">
        <p className="font-code text-lg leading-relaxed tracking-wider">
          {renderText()}
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
