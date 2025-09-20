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
    const originalWords = text.split(' ');
    const typedWords = userInput.split(' ');
    const result: React.ReactNode[] = [];
    let originalWordIndex = 0;

    // Iterate through each typed word to compare
    for (let typedWordIndex = 0; typedWordIndex < typedWords.length; typedWordIndex++) {
        const isLastTypedWord = typedWordIndex === typedWords.length - 1;
        const typedWord = typedWords[typedWordIndex];

        // If we've run out of original words, any further typed words are "extra"
        if (originalWordIndex >= originalWords.length) {
            result.push(<span key={`extra-${typedWordIndex}`} className="text-yellow-400 bg-yellow-500/20 rounded-sm">{typedWord}</span>);
            result.push(' ');
            continue;
        }

        const originalWord = originalWords[originalWordIndex];
        
        // Perfect match
        if (typedWord === originalWord && !isLastTypedWord) {
            result.push(<span key={originalWordIndex} className="text-green-400">{originalWord}</span>);
            result.push(' ');
            originalWordIndex++;
            continue;
        }

        // Handle misspellings and the currently-being-typed word
        if (isLastTypedWord) {
            const wordWithCursor: React.ReactNode[] = [];
            for (let i = 0; i < originalWord.length; i++) {
                const isCursorPosition = i === typedWord.length;
                let charClassName = 'text-muted-foreground';

                if (i < typedWord.length) {
                    if (typedWord[i] === originalWord[i]) {
                        charClassName = 'text-green-400';
                    } else {
                        charClassName = 'text-red-400 bg-red-500/20';
                    }
                }
                
                const charToRender = originalWord[i];

                if (isCursorPosition && isStarted && !isFinished) {
                     wordWithCursor.push(
                        <span key={`${originalWordIndex}-${i}-cursor`} className="relative">
                            <span className={cn("animate-pulse border-b-2 border-primary absolute left-0 top-0 bottom-0", charClassName)}>
                                {charToRender}
                            </span>
                            <span className="opacity-0">{charToRender}</span>
                        </span>
                    );
                } else {
                     wordWithCursor.push(<span key={`${originalWordIndex}-${i}`} className={cn('rounded-sm', charClassName)}>{charToRender}</span>);
                }
            }
             // Add any extra characters the user typed beyond the original word length
            if (typedWord.length > originalWord.length) {
                const extraChars = typedWord.slice(originalWord.length);
                wordWithCursor.push(<span key={`${originalWordIndex}-extra`} className="text-yellow-400 bg-yellow-500/20 rounded-sm">{extraChars}</span>);
            }

            result.push(<span key={originalWordIndex}>{wordWithCursor}</span>);
            result.push(' ');
            
        } else { // Word is complete but incorrect
            // Lookahead to see if the user skipped a word
            let lookaheadIndex = originalWordIndex + 1;
            let foundMatch = false;
            while(lookaheadIndex < originalWords.length && lookaheadIndex < originalWordIndex + 5) { // Limit lookahead
                if (typedWord === originalWords[lookaheadIndex]) {
                    // Mark skipped words as missed
                    for(let i = originalWordIndex; i < lookaheadIndex; i++) {
                        result.push(<span key={`missed-${i}`} className="text-gray-500">{originalWords[i]}</span>);
                        result.push(' ');
                    }
                    result.push(<span key={lookaheadIndex} className="text-green-400">{originalWords[lookaheadIndex]}</span>);
                    result.push(' ');
                    originalWordIndex = lookaheadIndex + 1;
                    foundMatch = true;
                    break;
                }
                lookaheadIndex++;
            }

            if (!foundMatch) {
                // If no match found in lookahead, it's just an incorrect word
                result.push(<span key={`incorrect-${originalWordIndex}`} className="text-red-400 bg-red-500/20 rounded-sm">{typedWord}</span>);
                result.push(' ');
                originalWordIndex++; // Move on to the next word
            }
        }
    }

    // Add remaining original words
    for (let i = originalWordIndex; i < originalWords.length; i++) {
        const isFirstUntyped = i === originalWordIndex && typedWords.length === originalWords.length;
        if (i === originalWordIndex && userInput.endsWith(' ') && isStarted && !isFinished) {
             result.push(
                <span key={`${i}-cursor`} className="relative">
                    <span className={cn("animate-pulse border-b-2 border-primary absolute left-0 top-0 bottom-0", "text-muted-foreground")}>
                        {originalWords[i][0]}
                    </span>
                    <span className="opacity-0">{originalWords[i][0]}</span>
                </span>
            );
            result.push(<span className="text-muted-foreground">{originalWords[i].slice(1)}</span>)
        } else {
            result.push(<span key={i} className="text-muted-foreground">{originalWords[i]}</span>);
        }
        if (i < originalWords.length - 1) {
            result.push(' ');
        }
    }

    return result;
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
