
'use client';
import { useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Mistake } from '@/lib/types';
import { cn } from '@/lib/utils';
import { generateWordDiff, WordDiff, CharDiff } from '@/lib/evaluation';

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


const RenderedWord = ({ wordDiff }: { wordDiff: WordDiff }) => {
    const { status, word, charDiffs } = wordDiff;

    if (status === 'whitespace') {
        return <span> </span>;
    }

    let wordStyle = "text-muted-foreground"; // Default for pending words

    if (status === 'correct') {
        wordStyle = "text-green-400";
    } else if (status === 'skipped') {
        wordStyle = "bg-gray-500/30 text-gray-400 rounded-sm";
    }

    if (status === 'incorrect' && charDiffs) {
        return (
            <span>
                {charDiffs.map((charDiff, index) => {
                    let className = '';
                    switch (charDiff.status) {
                        case 'correct':
                            className = 'text-green-400';
                            break;
                        case 'incorrect':
                            className = 'bg-red-500/20 text-red-400';
                            break;
                        case 'extra':
                            className = 'bg-yellow-500/20 text-yellow-400';
                            break;
                        case 'missing':
                             return <span key={index} className="bg-red-500/20 text-red-400 line-through">{charDiff.char}</span>
                    }
                    return <span key={index} className={className}>{charDiff.char}</span>;
                })}
                {' '}
            </span>
        )
    }

    return <span className={wordStyle}>{word}{' '}</span>;
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
  
  // This effect is not needed anymore with the new logic,
  // as the diffing handles the current input state.

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isFinished) return;

    let value = e.target.value;
    onUserInputChange(value);

    // Completion condition is handled by the submit button now.
  };
  
const renderedText = useMemo(() => {
    const diffs = generateWordDiff(text, userInput);
    return diffs.map((diff, index) => <RenderedWord key={index} wordDiff={diff} />);
}, [text, userInput]);


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
