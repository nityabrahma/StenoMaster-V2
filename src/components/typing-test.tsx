
'use client';
import { useRef, useEffect, useMemo, useState } from 'react';
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


const Cursor = () => (
    <span className="animate-pulse duration-500 border-b-2 border-primary -mb-1" />
);

const renderCharDiffs = (charDiffs: CharDiff[], wordIndex: number, cursorIndex: number | null) => {
    return charDiffs.map((charDiff, charIndex) => {
        const key = `${wordIndex}-${charIndex}`;
        const isCursorPosition = cursorIndex === charIndex;
        
        switch (charDiff.status) {
            case 'correct':
                return <span key={key} className="text-green-400">{charDiff.char}{isCursorPosition && <Cursor />}</span>;
            case 'incorrect':
                return <span key={key} className="text-red-400 bg-red-500/20">{charDiff.char}{isCursorPosition && <Cursor />}</span>;
            case 'extra':
                return <span key={key} className="text-yellow-400 bg-yellow-500/20">{charDiff.char}{isCursorPosition && <Cursor />}</span>;
            case 'pending':
                return <span key={key}>{charDiff.char}{isCursorPosition && <Cursor />}</span>;
            default:
                 return <span key={key}>{charDiff.char}{isCursorPosition && <Cursor />}</span>;
        }
    });
};

const RenderedWord = ({ wordDiff, index, isCurrentWord, cursorPosition }: { wordDiff: WordDiff, index: number, isCurrentWord: boolean, cursorPosition: number | null }) => {
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
                return <>{renderCharDiffs(charDiffs, index, isCurrentWord ? cursorPosition : null)}</>;
            }
            return <span className="text-red-400 bg-red-500/20">{expected || word}</span>;
        case 'pending':
             return <span>{isCurrentWord && cursorPosition === 0 && <Cursor />}{word}</span>;
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
  const [diffs, setDiffs] = useState<WordDiff[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (isStarted && !isFinished) {
      inputRef.current?.focus();
    }
  }, [isStarted, isFinished]);

  useEffect(() => {
    const newDiffs = generateAdvancedDiff(text, userInput);
    setDiffs(newDiffs);

    let typedWordsCount = 0;
    let charPos = 0;
    for(let i=0; i<newDiffs.length; i++){
        const diff = newDiffs[i];
        if(diff.status !== 'pending' && diff.status !== 'whitespace'){
            typedWordsCount = i;
        }
        if(diff.status === 'incorrect' || diff.status === 'correct'){
            charPos = diff.word.length;
        } else {
           if(diff.status !== 'pending') charPos = 0;
        }
    }
    
    const lastNonPendingDiffIndex = newDiffs.findLastIndex(d => d.status !== 'pending');
    const currentDiff = newDiffs[lastNonPendingDiffIndex + 1] || newDiffs[newDiffs.length -1];
    
    if(currentDiff && currentDiff.status === 'pending') {
        setCurrentWordIndex(lastNonPendingDiffIndex + 1);
        setCursorPosition(0);
    } else if (currentDiff && currentDiff.charDiffs) {
        setCurrentWordIndex(lastNonPendingDiffIndex);
        const lastTypedCharIndex = currentDiff.charDiffs.findLastIndex(c => c.status !== 'pending' && c.status !== 'missing');
        setCursorPosition(lastTypedCharIndex + 1);
    }

  }, [text, userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isFinished) return;
    onUserInputChange(e.target.value);
  };
  
const renderedText = useMemo(() => {
    return diffs.map((diff, index) => (
        <RenderedWord 
            key={index} 
            wordDiff={diff} 
            index={index}
            isCurrentWord={index === currentWordIndex}
            cursorPosition={cursorPosition}
        />
    ));
}, [diffs, currentWordIndex, cursorPosition]);


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
