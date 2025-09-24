'use client';
import { useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Mistake } from '@/lib/types';
import { cn } from '@/lib/utils';
import { generateWordDiff, WordDiff } from '@/lib/evaluation';

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
    // Reset user input when the text changes for a new practice test
    onUserInputChange('');
  }, [text, onUserInputChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isFinished) return;

    let value = e.target.value;
    onUserInputChange(value);

    // Completion condition can be based on length or a specific key press
    // For now, let's keep it simple.
    if (value.length >= text.length) {
      onComplete();
    }
  };
  
const renderedText = useMemo(() => {
    const diffs = generateWordDiff(text, userInput);
    let typedIndex = 0;
    
    const elements = diffs.map((diff, index) => {
        let className = '';
        let currentWordLength = diff.word.length;

        switch (diff.status) {
            case 'correct':
                className = 'text-green-400';
                typedIndex += currentWordLength;
                break;
            case 'incorrect':
                className = 'text-red-400 bg-red-500/20';
                typedIndex += currentWordLength;
                break;
            case 'skipped':
                 className = 'text-gray-400 underline decoration-red-500 decoration-2';
                 break;
            case 'extra':
                className = 'text-yellow-400 bg-yellow-500/20';
                // Extra words don't advance the original text index
                break;
            case 'whitespace':
                typedIndex += currentWordLength;
                return <span key={`diff-${index}`}>{diff.word}</span>;
            default:
                break;
        }
        return <span key={`diff-${index}`} className={cn("rounded-sm", className)}>{diff.word}</span>
    });

    // Manually add cursor if needed
    // This is a simplified representation. A more complex one would split words to place the cursor mid-word.
    if (isStarted && !isFinished && userInput.length < text.length) {
      // This is a naive cursor implementation. For a real cursor, we'd need to manipulate the DOM more directly
      // or split the word where the cursor is.
    }

    return elements;
}, [text, userInput, isStarted, isFinished]);


  return (
    <Card className="relative" onClick={() => inputRef.current?.focus()}>
      <CardContent className="p-6">
        <div className="font-code text-lg leading-relaxed tracking-wider whitespace-pre-wrap">
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
