
import type { Mistake } from './types';

export interface EvaluationResult {
    wpm: number;
    accuracy: number;
    mistakes: Mistake[];
    timeElapsed: number;
    userInput: string;
}

export interface WordDiff {
    word: string;
    status: 'correct' | 'incorrect' | 'skipped' | 'extra' | 'whitespace';
}

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
 * This function uses a robust algorithm to handle skipped/extra words.
 * @param originalText The correct text.
 * @param userInput The text typed by the user.
 * @returns An array of WordDiff objects.
 */
export function generateWordDiff(originalText: string, userInput: string): WordDiff[] {
    const originalWords = originalText.trim().split(/(\s+)/).filter(Boolean);
    const typedWords = userInput.trim().split(/(\s+)/).filter(Boolean);
    const diff: WordDiff[] = [];
    
    let originalIndex = 0;
    let typedIndex = 0;
    const lookahead = 5;

    while (originalIndex < originalWords.length || typedIndex < typedWords.length) {
        const oWord = originalWords[originalIndex];
        const tWord = typedWords[typedIndex];

        if (oWord === undefined && tWord === undefined) break;

        // Handle whitespace in a uniform way
        if (oWord && /\s+/.test(oWord)) {
            diff.push({ word: oWord, status: 'whitespace' });
            originalIndex++;
            // If typed word is also whitespace, consume it
            if (tWord && /\s+/.test(tWord)) {
                typedIndex++;
            }
            continue;
        }
        if (tWord && /\s+/.test(tWord)) {
            // Original word is not whitespace, but typed is. This is an extra space.
            diff.push({ word: tWord, status: 'extra' });
            typedIndex++;
            continue;
        }

        // Main comparison logic
        if (oWord === tWord) {
            diff.push({ word: oWord, status: 'correct' });
            originalIndex++;
            typedIndex++;
        } else if (oWord === undefined) {
            diff.push({ word: tWord, status: 'extra' });
            typedIndex++;
        } else if (tWord === undefined) {
            diff.push({ word: oWord, status: 'skipped' });
            originalIndex++;
        } else {
            // Mismatch, try to resync
            let foundSyncInOriginal = -1;
            for (let i = 1; i <= lookahead && originalIndex + i < originalWords.length; i++) {
                if (originalWords[originalIndex + i] === tWord && !/\s+/.test(originalWords[originalIndex + i])) {
                    foundSyncInOriginal = i;
                    break;
                }
            }

            if (foundSyncInOriginal !== -1) {
                // Words in between were skipped
                for (let j = 0; j < foundSyncInOriginal; j++) {
                    const skippedWord = originalWords[originalIndex + j];
                    if (skippedWord && !/\s+/.test(skippedWord)) {
                       diff.push({ word: skippedWord, status: 'skipped' });
                    } else if (skippedWord) {
                       diff.push({ word: skippedWord, status: 'whitespace' });
                    }
                }
                originalIndex += foundSyncInOriginal;
                // The current tWord will now match, let the next loop iteration handle it.
                continue;
            }
            
            // Check for extra words typed by the user
            let foundSyncInTyped = -1;
            for (let i = 1; i <= lookahead && typedIndex + i < typedWords.length; i++) {
                if (oWord === typedWords[typedIndex + i] && !/\s+/.test(typedWords[typedIndex + i])) {
                    foundSyncInTyped = i;
                    break;
                }
            }

            if (foundSyncInTyped !== -1) {
                // Words in between were extra
                for (let j = 0; j < foundSyncInTyped; j++) {
                    const extraWord = typedWords[typedIndex + j];
                    if (extraWord && !/\s+/.test(extraWord)) {
                        diff.push({ word: extraWord, status: 'extra' });
                    }
                }
                typedIndex += foundSyncInTyped;
                // The current oWord will now match, let the next loop iteration handle it.
                continue;
            }

            // No sync found, it's an incorrect word
            diff.push({ word: oWord, status: 'incorrect' });
            // To provide better feedback, we can also show what the user typed instead.
            // However, the current model displays the original text with annotations.
            // So we mark the original as incorrect and advance both pointers.
            originalIndex++;
            typedIndex++;
        }
    }
    return diff;
}
