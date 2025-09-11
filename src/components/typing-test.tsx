'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Target, AlertCircle } from 'lucide-react';

type TypingTestProps = {
  text: string;
  onComplete: (result: {
    wpm: number;
    accuracy: number;
    mistakes: number;
  }) => void;
};

export default function TypingTest({ text, onComplete }: TypingTestProps) {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetTest = useCallback(() => {
    setUserInput('');
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
    setMistakes(0);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished]);
  
  useEffect(() => {
    resetTest();
  }, [text, resetTest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isFinished) return;

    if (!startTime) {
      setStartTime(Date.now());
    }
    setUserInput(value);
  };
  
  useEffect(() => {
    if (userInput.length >= text.length && !isFinished) {
        setStartTime(null); // Stops the timer
        setIsFinished(true);

        const finalElapsedTime = (Date.now() - (startTime || Date.now())) / 1000;
        setElapsedTime(finalElapsedTime);

        let currentMistakes = 0;
        text.split('').forEach((char, index) => {
            if (userInput[index] !== char) {
                currentMistakes++;
            }
        });
        setMistakes(currentMistakes);

        const wordsTyped = text.length / 5;
        const wpm = Math.round((wordsTyped / finalElapsedTime) * 60);
        const accuracy = ((text.length - currentMistakes) / text.length) * 100;
        
        onComplete({ wpm, accuracy, mistakes: currentMistakes });
    }
  }, [userInput, text, isFinished, startTime, onComplete]);


  const renderText = () => {
    return text.split('').map((char, index) => {
      let color = 'text-muted-foreground';
      if (index < userInput.length) {
        color = char === userInput[index] ? 'text-foreground' : 'text-destructive';
      }
      return <span key={index} className={color}>{char}</span>;
    });
  };

  const wordsTyped = userInput.length / 5;
  const wpm = elapsedTime > 0 ? Math.round((wordsTyped / elapsedTime) * 60) : 0;
  
  const currentMistakes = userInput.split('').reduce((acc, char, index) => {
      return acc + (text[index] !== char ? 1 : 0);
  }, 0);
  const accuracy = userInput.length > 0 ? Math.max(0, ((userInput.length - currentMistakes) / userInput.length) * 100) : 100;

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
                <span className="text-xl font-bold">{currentMistakes}</span>
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
          <p className="text-muted-foreground mt-2">Press the button below to submit your results.</p>
           <Button className="mt-4" onClick={() => onComplete({ wpm, accuracy, mistakes })}>
            Submit Score
          </Button>
        </Card>
      )}
    </div>
  );
}
