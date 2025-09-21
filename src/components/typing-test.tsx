
'use client';
import { useRef, useEffect, useMemo, useState } from 'react';
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
  strict?: boolean;
  setIsInputBlocked?: (isBlocked: boolean) => void;
};


export default function TypingTest({ 
    text, 
    userInput, 
    onUserInputChange, 
    isStarted, 
    isFinished,
    onComplete,
    strict = false,
    setIsInputBlocked,
}: TypingTestProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isStarted && !isFinished) {
      inputRef.current?.focus();
    }
  }, [isStarted, isFinished]);
  
  useEffect(() => {
    // Reset user input when the text changes, but only if it's a practice test
    if (strict) {
        onUserInputChange('');
    }
  }, [text, onUserInputChange, strict]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isFinished) return;

    let value = e.target.value;
    
    if (strict) {
        const originalWords = text.split(' ');
        const typedWords = value.split(' ');
        const currentWordIndex = typedWords.length - 1;
        const currentTypedWord = typedWords[currentWordIndex];
        const currentOriginalWord = originalWords[currentWordIndex];

        if (currentOriginalWord && currentTypedWord) {
            // Check for word skip
            if(currentTypedWord.length === 1 && currentTypedWord[0] !== currentOriginalWord[0]) {
                // First letter is wrong, wait for second
            } else if (currentTypedWord.length === 2) {
                const firstCharMatch = currentTypedWord[0] === currentOriginalWord[0];
                const secondCharMatch = currentTypedWord[1] === currentOriginalWord[1];
                
                if (!firstCharMatch && !secondCharMatch) {
                    triggerShake();
                    setIsInputBlocked?.(true);
                    return; // Block input
                }
            }
        }
        setIsInputBlocked?.(false);
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
                <span key={index} className={cn("relative", isShaking && 'animate-shake')}>
                    <span className={cn("animate-pulse border-b-2 border-primary absolute left-0 top-0 bottom-0", className)}>
                        {char}
                    </span>
                    <span className="opacity-0">{char}</span>
                </span>
            );
        }

        return <span key={index} className={cn('rounded-sm', className)}>{char}</span>;
    });
}, [text, userInput, isStarted, isFinished, isShaking]);


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
