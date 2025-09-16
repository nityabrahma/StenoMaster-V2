
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Target, AlertCircle } from 'lucide-react';
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
  onComplete: (result: SubmissionResult) => void;
};

function getStatusArray(
  original: string,
  typed: string = ''
): ("correct" | "wrong" | "pending")[] {
  const status: ("correct" | "wrong" | "pending")[] = new Array(original.length).fill("pending");
  for (let i = 0; i < typed.length; i++) {
    if (i < original.length) {
      status[i] = typed[i] === original[i] ? "correct" : "wrong";
    }
  }
  return status;
}

export default function TypingTest({ text, onComplete }: TypingTestProps) {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const statusArray = getStatusArray(text, userInput);
  const correctChars = statusArray.filter(s => s === 'correct').length;
  const mistakeCount = statusArray.slice(0, userInput.length).filter(s => s === 'wrong').length;
  
  const resetTest = useCallback(() => {
    setUserInput('');
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished]);
  
  useEffect(() => {
    resetTest();
  }, [text, resetTest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    let value = e.target.value;

    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }
    
    setUserInput(value);
  };
  
  const finishTest = useCallback(() => {
    if (isFinished || !startTime) return;

    setIsFinished(true);
    const finalElapsedTime = (Date.now() - startTime) / 1000;
    setElapsedTime(finalElapsedTime);
    
    const finalStatusArray = getStatusArray(text, userInput);
    const finalMistakes: Mistake[] = [];
    finalStatusArray.forEach((status, index) => {
      if (status === 'wrong') {
        finalMistakes.push({
          expected: text[index],
          actual: userInput[index] || '',
          position: index,
        });
      }
    });
    
    const wordsTyped = text.length / 5;
    const wpm = finalElapsedTime > 0 ? Math.round((wordsTyped / finalElapsedTime) * 60) : 0;
    const accuracy = ((text.length - finalMistakes.length) / text.length) * 100;
    
    onComplete({ wpm, accuracy, mistakes: finalMistakes, timeElapsed: finalElapsedTime, userInput });
  }, [isFinished, startTime, userInput, text, onComplete]);
  
  useEffect(() => {
    if (!isFinished && userInput.length >= text.length) {
      setTimeout(() => finishTest(), 50);
    }
  }, [userInput, text, isFinished, finishTest]);

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-muted-foreground';
      const status = statusArray[index];
      
      if (status === 'correct') {
          className = 'text-foreground';
      } else if (status === 'wrong') {
          className = 'text-destructive';
      }
      
      if (index === userInput.length) {
        className += ' animate-pulse border-b-2 border-primary';
      }
      return <span key={index} className={className}>{char}</span>;
    });
  };

  const wordsTyped = userInput.length / 5;
  const wpm = elapsedTime > 0 ? Math.round((wordsTyped / elapsedTime) * 60) : 0;
  const accuracy = userInput.length > 0 ? Math.max(0, (correctChars / userInput.length) * 100) : 100;

  return (
    <div className="space-y-4">
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
            autoFocus
            disabled={isFinished}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-4 md:gap-6">
            <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary"/>
                <span className="text-xl font-bold">{wpm}</span>
                <span className="text-sm text-muted-foreground">WPM</span>
            </div>
            <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary"/>
                <span className="text-xl font-bold">{accuracy.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive"/>
                <span className="text-xl font-bold">{mistakeCount}</span>
                <span className="text-sm text-muted-foreground">Mistakes</span>
            </div>
        </div>
        <Button onClick={resetTest} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Restart
        </Button>
      </div>

      {isFinished && (
        <Card className="bg-accent p-6 text-center">
          <h3 className="text-2xl font-bold font-headline">Test Complete!</h3>
          <p className="text-muted-foreground mt-2">Your score has been submitted.</p>
        </Card>
      )}
    </div>
  );
}
