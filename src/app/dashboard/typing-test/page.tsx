'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TypingTest from '@/components/typing-test';
import typingData from '@/lib/typing-data.json';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

export default function TypingTestPage() {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const { toast } = useToast();

    const handleComplete = (result: { wpm: number; accuracy: number; mistakes: number }) => {
        // In a real app, you'd save this to the user's performance history
        toast({
            title: "Practice Complete!",
            description: `Your score: ${result.wpm} WPM at ${result.accuracy.toFixed(1)}% accuracy.`,
        });
    };

    const nextTest = () => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % typingData.length);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Typing Practice</CardTitle>
                    <CardDescription>Hone your skills with our curated typing tests. Focus on speed and accuracy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TypingTest text={typingData[currentTextIndex]} onComplete={handleComplete} />
                    <div className="flex justify-end">
                        <Button onClick={nextTest}>
                            Next Test <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
