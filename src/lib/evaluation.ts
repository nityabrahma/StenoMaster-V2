
import type { Mistake } from './types';

export interface EvaluationResult {
    wpm: number;
    accuracy: number;
    mistakes: Mistake[];
    timeElapsed: number;
    userInput: string;
}

export type CharDiff = {
    char: string;
    status: 'correct' | 'incorrect' | 'extra' | 'missing' | 'pending';
};

export type WordDiff = {
    word: string;
    expected?: string; // Add expected word for incorrect status
    charDiffs?: CharDiff[];
    status: 'correct' | 'incorrect' | 'skipped' | 'extra' | 'whitespace' | 'pending';
};


/**
 * Calculates typing metrics (WPM, accuracy, mistakes) using an intelligent diffing algorithm.
 * This version handles skipped words, extra words, and misspellings gracefully.
 * @param originalText The correct text.
 * @param userInput The text typed by the user.
 * @param timeElapsed The time in seconds.
 * @returns An object with the calculated metrics.
 */
export function evaluateTyping(originalText: string, userInput: string, timeElapsed: number): EvaluationResult {
    const originalWords = originalText.trim().split(/\s+/).filter(Boolean);
    const typedWords = userInput.trim().split(/\s+/).filter(Boolean);

    const mistakes: Mistake[] = [];
    let correctChars = 0;
    let originalIndex = 0;
    let typedIndex = 0;

    while (originalIndex < originalWords.length || typedIndex < typedWords.length) {
        const oWord = originalWords[originalIndex];
        const tWord = typedWords[typedIndex];

        if (oWord === undefined && tWord === undefined) {
            break;
        }

        // Correct word match
        if (oWord === tWord) {
            correctChars += (oWord.length + 1); // +1 for the space
            originalIndex++;
            typedIndex++;
            continue;
        }
        
        // Handle end-of-text scenarios
        if (tWord === undefined) { // User finished typing but original text remains
            mistakes.push({ expected: oWord, actual: '', position: originalIndex });
            originalIndex++;
            continue;
        }
        if (oWord === undefined) { // User typed extra words at the end
            mistakes.push({ expected: '', actual: tWord, position: originalIndex });
            typedIndex++;
            continue;
        }

        // Mismatch: Attempt to resynchronize by looking ahead in the original text
        let foundSync = false;
        let bestSyncIndex = -1;
        
        // Find the nearest future match
        for (let i = 1; (originalIndex + i) < originalWords.length; i++) {
            if (originalWords[originalIndex + i] === tWord) {
                bestSyncIndex = i;
                break; // Found the closest match, stop searching
            }
        }
        
        if (bestSyncIndex !== -1) {
            // Words in between were skipped.
            for (let j = 0; j < bestSyncIndex; j++) {
                mistakes.push({
                    expected: originalWords[originalIndex + j],
                    actual: '',
                    position: originalIndex + j
                });
            }
            originalIndex += bestSyncIndex; // Move original index to the sync point
            foundSync = true;
        }
        
        if (foundSync) {
            continue;
        }

        // No sync found by skipping. Let's try to find an extra word.
        let foundExtra = false;
        bestSyncIndex = -1;
        for (let i = 1; (typedIndex + i) < typedWords.length; i++) {
             if (originalWords[originalIndex] === typedWords[typedIndex + i]) {
                bestSyncIndex = i;
                break;
             }
        }

        if (bestSyncIndex !== -1) {
            for (let j = 0; j < bestSyncIndex; j++) {
                mistakes.push({
                    expected: '',
                    actual: typedWords[typedIndex + j],
                    position: originalIndex,
                });
            }
            typedIndex += bestSyncIndex;
            foundExtra = true;
        }


        if (foundExtra) {
            continue;
        }
        
        // Still no sync. Assume it's a simple misspelling.
        mistakes.push({
            expected: oWord,
            actual: tWord,
            position: originalIndex
        });
        originalIndex++;
        typedIndex++;
    }
    
    const totalPossibleChars = originalText.length;
    let incorrectChars = 0;
    mistakes.forEach(mistake => {
        if (mistake.actual === '') { // Skipped
            incorrectChars += mistake.expected.length + 1;
        } else if (mistake.expected === '') { // Extra
            incorrectChars += mistake.actual.length + 1;
        } else { // Misspelled
            incorrectChars += Math.max(mistake.expected.length, mistake.actual.length) + 1;
        }
    });

    const calculatedCorrectChars = totalPossibleChars - incorrectChars;
    const accuracy = totalPossibleChars > 0 ? Math.max(0, (calculatedCorrectChars / totalPossibleChars) * 100) : 0;
    
    const grossWords = userInput.length / 5;
    const wpm = timeElapsed > 0 ? Math.round(grossWords / (timeElapsed / 60)) : 0;

    return {
        wpm: wpm,
        accuracy,
        mistakes,
        timeElapsed,
        userInput: userInput.trim(),
    };
}


/**
 * Generates a visual diff array to show differences between original text and user input.
 * This version handles skipped/extra words and character-level differences.
 * @param originalText The correct text.
 * @param userInput The text typed by the user.
 * @returns An array of WordDiff objects.
 */
export function generateWordDiff(originalText: string, userInput: string): WordDiff[] {
    const originalWords = originalText.split(/(\s+)/).filter(Boolean);
    const typedWords = userInput.split(/(\s+)/).filter(Boolean);
    const diff: WordDiff[] = [];

    let oIndex = 0;
    let tIndex = 0;

    while (oIndex < originalWords.length || tIndex < typedWords.length) {
        const oWord = originalWords[oIndex];
        const tWord = typedWords[tIndex];

        if (oWord === undefined && tWord === undefined) break;

        // Whitespace handling
        if (oWord && /\s+/.test(oWord)) {
            diff.push({ word: oWord, status: 'whitespace' });
            oIndex++;
            if (tWord && /\s+/.test(tWord) && tWord.length === oWord.length) {
                tIndex++;
            }
            continue;
        }
         if (tWord && /\s+/.test(tWord)) {
            diff.push({ word: tWord, status: 'extra' });
            tIndex++;
            continue;
        }


        // End of one of the texts
        if (tWord === undefined) {
            diff.push({ word: oWord, status: 'pending' });
            oIndex++;
            continue;
        }
        if (oWord === undefined) {
            diff.push({ word: tWord, status: 'extra' });
            tIndex++;
            continue;
        }

        // Perfect match
        if (oWord === tWord) {
            diff.push({ word: oWord, status: 'correct' });
            oIndex++;
            tIndex++;
            continue;
        }

        // Mismatch logic
        // 1. Look for a resync point by checking if user skipped words
        let bestSyncIndex = -1;
        for (let i = 1; oIndex + i < originalWords.length; i++) {
             if (/\s+/.test(originalWords[oIndex + i])) continue;
             if (originalWords[oIndex + i] === tWord) {
                bestSyncIndex = i;
                break;
            }
        }
        if (bestSyncIndex !== -1) {
            for (let j = 0; j < bestSyncIndex; j++) {
                const skippedWord = originalWords[oIndex + j];
                if (!/\s+/.test(skippedWord)) {
                    diff.push({ word: skippedWord, status: 'skipped' });
                }
            }
            oIndex += bestSyncIndex;
            continue; // Re-evaluate with the synced-up original index
        }
        
        // 2. Look for a resync point by checking if user added extra words
        bestSyncIndex = -1;
        for (let i = 1; tIndex + i < typedWords.length; i++) {
             if (/\s+/.test(typedWords[tIndex + i])) continue;
             if (oWord === typedWords[tIndex + i]) {
                bestSyncIndex = i;
                break;
             }
        }
        if(bestSyncIndex !== -1) {
             for (let j = 0; j < bestSyncIndex; j++) {
                const extraWord = typedWords[tIndex + j];
                if (!/\s+/.test(extraWord)) {
                   diff.push({ word: extraWord, status: 'extra' });
                }
           }
           tIndex += bestSyncIndex;
           continue; // Re-evaluate
        }


        // 3. No easy resync found, assume misspelling
        const charDiffs: CharDiff[] = [];
        const maxLen = Math.max(oWord.length, tWord.length);
        for (let i = 0; i < maxLen; i++) {
            const oChar = oWord[i];
            const tChar = tWord[i];

            if (i >= oWord.length) {
                charDiffs.push({ char: tChar, status: 'extra' });
            } else if (i >= tWord.length) {
                charDiffs.push({ char: oChar, status: 'pending' });
            } else if (oChar === tChar) {
                charDiffs.push({ char: tChar, status: 'correct' });
            } else {
                charDiffs.push({ char: oChar, status: 'incorrect' });
            }
        }
        diff.push({ word: tWord, expected: oWord, charDiffs, status: 'incorrect' });
        oIndex++;
        tIndex++;
    }

    return diff;
}
