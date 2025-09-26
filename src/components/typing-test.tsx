
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


const renderCharDiffs = (charDiffs: CharDiff[], expectedWord: string, wordIndex: number) => {
    return (
        <span key={wordIndex}>
            {charDiffs.map((charDiff, charIndex) => {
                const key = `${wordIndex}-${charIndex}`;
                switch (charDiff.status) {
                    case 'correct':
                        return <span key={key} className="text-green-400">{charDiff.char}</span>;
                    case 'incorrect':
                        // Render the original character with an error background
                        return <span key={key} className="text-red-400 bg-red-500/20">{expectedWord[charIndex] ?? ''}</span>;
                    case 'extra':
                         // Extra characters typed by the user are shown, but they don't replace original text
                        return <span key={key} className="text-yellow-400 bg-yellow-500/20">{charDiff.char}</span>;
                    case 'missing':
                         return <span key={key} className="text-red-400 bg-red-500/20 line-through">{charDiff.char}</span>;
                    case 'pending':
                         return <span key={key}>{charDiff.char}</span>;
                }
            })}
            {' '}
        </span>
    )
}

const RenderedWord = ({ wordDiff, index }: { wordDiff: WordDiff, index: number }) => {
    const { status, word, expected, charDiffs } = wordDiff;

    switch (status) {
        case 'correct':
            return <span className="text-green-400">{word} </span>;
        case 'skipped':
            return <span className="text-gray-400 bg-gray-500/30 rounded-sm">{word} </span>;
        case 'extra':
            return <span className="text-yellow-400 bg-yellow-500/20 rounded-sm">{word} </span>;
        case 'incorrect':
            if (charDiffs && expected) {
                return renderCharDiffs(charDiffs, expected, index);
            }
            return <span className="text-red-400 bg-red-500/20">{word} </span>;
        case 'pending':
            return <span>{word} </span>;
        case 'whitespace':
            return <span> </span>;
        default:
            return <span>{word} </span>;
    }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isFinished) return;
    onUserInputChange(e.target.value);
  };
  
const renderedText = useMemo(() => {
    const diffs = generateWordDiff(text, userInput);
    return diffs.map((diff, index) => <RenderedWord key={index} wordDiff={diff} index={index} />);
}, [text, userInput]);


  return (
    <Card className="relative" onClick={() => inputRef.current?.focus()}>
      <CardContent className="p-6">
        <div className="font-code text-lg leading-relaxed tracking-wider text-muted-foreground">
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
