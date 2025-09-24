
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
    status: 'correct' | 'incorrect' | 'extra' | 'missing';
};

export type WordDiff = {
    word: string;
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
    const lookahead = 5;

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
        for (let i = 1; i <= lookahead && (originalIndex + i) < originalWords.length; i++) {
            if (originalWords[originalIndex + i] === tWord) {
                // Found a sync point. Words in between were skipped.
                for (let j = 0; j < i; j++) {
                    mistakes.push({
                        expected: originalWords[originalIndex + j],
                        actual: '',
                        position: originalIndex + j
                    });
                }
                originalIndex += i; // Move original index to the sync point
                foundSync = true;
                break;
            }
        }
        
        if (foundSync) {
            // After skipping, the current typed word is now correct.
            // Loop will handle it in the next iteration.
            continue;
        }

        // No sync found by skipping. Let's try to find an extra word.
        // Look ahead in the typed text to see if it matches the current original word.
        let foundExtra = false;
        for (let i = 1; i <= lookahead && (typedIndex + i) < typedWords.length; i++) {
             if (originalWords[originalIndex] === typedWords[typedIndex + i]) {
                // Found a sync point. Words in between were extra.
                for (let j = 0; j < i; j++) {
                    mistakes.push({
                        expected: '',
                        actual: typedWords[typedIndex + j],
                        position: originalIndex,
                    });
                }
                typedIndex += i;
                foundExtra = true;
                break;
             }
        }

        if (foundExtra) {
            // After accounting for extra words, the current original word should now match.
            // The loop will handle it in the next iteration.
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

    let oIndex = 0; // Pointer for originalWords
    let tIndex = 0; // Pointer for typedWords
    const lookahead = 5;

    while (oIndex < originalWords.length) {
        const oWord = originalWords[oIndex];
        const tWord = typedWords[tIndex];

        // If we've run out of typed words, the rest are pending
        if (tWord === undefined) {
             diff.push({ word: oWord, status: /\s+/.test(oWord) ? 'whitespace' : 'pending' });
             oIndex++;
             continue;
        }

        // Handle whitespace in both arrays
        if (/\s+/.test(oWord)) {
            diff.push({ word: oWord, status: 'whitespace' });
            oIndex++;
            if (tIndex < typedWords.length && /\s+/.test(typedWords[tIndex])) {
                tIndex++;
            }
            continue;
        }
        if (/\s+/.test(tWord)) {
            // User typed extra space, mark it and advance typed pointer
            diff.push({ word: tWord, status: 'extra' });
            tIndex++;
            continue;
        }

        // Direct match
        if (oWord === tWord) {
            diff.push({ word: oWord, status: 'correct' });
            oIndex++;
            tIndex++;
            continue;
        }

        // Mismatch logic: try to re-sync
        let foundSync = false;
        // Look ahead in original text to see if user skipped a word
        for (let i = 1; i <= lookahead && oIndex + i < originalWords.length; i++) {
            if (originalWords[oIndex + i] === tWord) {
                // Words from oIndex to oIndex + i - 1 were skipped
                for (let j = 0; j < i; j++) {
                    const skippedWord = originalWords[oIndex + j];
                    diff.push({ word: skippedWord, status: /\s+/.test(skippedWord) ? 'whitespace' : 'skipped' });
                }
                oIndex += i;
                foundSync = true;
                break;
            }
        }
        if (foundSync) continue;
        
        // Look ahead in typed text to see if user added an extra word
        for (let i = 1; i <= lookahead && tIndex + i < typedWords.length; i++) {
            if (oWord === typedWords[tIndex + i]) {
                // Words from tIndex to tIndex + i - 1 were extra
                for (let j = 0; j < i; j++) {
                     const extraWord = typedWords[tIndex + j];
                     if (!/\s+/.test(extraWord)) {
                        diff.push({ word: extraWord, status: 'extra' });
                     }
                }
                tIndex += i;
                foundSync = true;
                break;
            }
        }
        if(foundSync) continue;


        // If no sync, it's a misspelling. Perform char-level diff.
        const charDiffs: CharDiff[] = [];
        const maxLen = Math.max(oWord.length, tWord.length);
        for (let i = 0; i < maxLen; i++) {
            const oChar = oWord[i];
            const tChar = tWord[i];
            if (oChar === tChar) {
                charDiffs.push({ char: tChar, status: 'correct' });
            } else if (oChar === undefined) {
                charDiffs.push({ char: tChar, status: 'extra' });
            } else if (tChar === undefined) {
                charDiffs.push({ char: oChar, status: 'missing' });
            } else {
                charDiffs.push({ char: oChar, status: 'incorrect' });
            }
        }
        diff.push({ word: oWord, charDiffs, status: 'incorrect' });
        oIndex++;
        tIndex++;
    }
    
     // Any remaining typed words are extra
    while (tIndex < typedWords.length) {
        const tWord = typedWords[tIndex];
        if (!/\s+/.test(tWord)) {
            diff.push({ word: tWord, status: 'extra' });
        }
        tIndex++;
    }


    return diff;
}
