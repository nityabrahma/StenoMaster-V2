
'use client';
import { useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Mistake } from '@/lib/types';
import { cn } from '@/lib/utils';
import { generateAdvancedDiff, WordDiff, CharDiff } from '@/lib/evaluation';

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
            {expectedWord.split('').map((char, charIndex) => {
                const diff = charDiffs[charIndex];
                const key = `${wordIndex}-${charIndex}`;
                
                if (!diff || diff.status === 'missing' || diff.status === 'incorrect') {
                     return <span key={key} className="text-red-400 bg-red-500/20">{char}</span>;
                }
                if (diff.status === 'correct') {
                     return <span key={key} className="text-green-400">{char}</span>;
                }
                 return <span key={key}>{char}</span>; // Fallback for pending
            })}
            {charDiffs.slice(expectedWord.length).map((charDiff, i) => (
                 <span key={`${wordIndex}-extra-${i}`} className="text-yellow-400 bg-yellow-500/20">{charDiff.char}</span>
            ))}
        </span>
    )
}

const RenderedWord = ({ wordDiff, index }: { wordDiff: WordDiff, index: number }) => {
    const { status, word, expected, charDiffs } = wordDiff;

    switch (status) {
        case 'correct':
            return <span className="text-green-400">{word}</span>;
        case 'skipped':
            return <span className="text-gray-400 bg-gray-500/30 rounded-sm">{word}</span>;
        case 'extra':
            return <span className="text-yellow-400 bg-yellow-500/20 rounded-sm">{word}</span>;
        case 'incorrect':
            if (charDiffs && expected) {
                 // The word itself is the user's typed input, but we render based on the expected word
                 // to keep the layout stable.
                return renderCharDiffs(charDiffs, expected, index);
            }
            return <span className="text-red-400 bg-red-500/20">{expected || word}</span>;
        case 'pending':
            return <span>{word}</span>;
        case 'whitespace':
            return <span>{word}</span>;
        default:
            return <span>{word}</span>;
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
    const diffs = generateAdvancedDiff(text, userInput);
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
