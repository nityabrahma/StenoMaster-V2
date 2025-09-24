
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
 * @param originalText The correct text.
 * @param userInput The text typed by the user.
 * @param timeElapsed The time in seconds.
 * @returns An object with the calculated metrics.
 */
export function evaluateTyping(originalText: string, userInput: string, timeElapsed: number): EvaluationResult {
    const originalWords = originalText.split(/\s+/).filter(Boolean);
    const typedWords = userInput.trim().split(/\s+/).filter(Boolean);

    const mistakes: Mistake[] = [];
    let correctChars = 0;
    let originalIndex = 0;
    let typedIndex = 0;
    const lookahead = 5; 

    while (originalIndex < originalWords.length || typedIndex < typedWords.length) {
        const oWord = originalWords[originalIndex];
        const tWord = typedWords[typedIndex];

        if (tWord === undefined && oWord === undefined) {
            break;
        }

        if (tWord === oWord) {
            // Correct word
            correctChars += oWord.length + 1; // +1 for the space
            originalIndex++;
            typedIndex++;
        } else if (oWord === undefined) {
             // User typed extra words at the end
             mistakes.push({ expected: '', actual: tWord, position: userInput.lastIndexOf(tWord) });
             typedIndex++;
        } else if (tWord === undefined) {
            // User missed words at the end
            mistakes.push({ expected: oWord, actual: '', position: userInput.length });
            originalIndex++;
        } else {
            // Mismatch, try to resync
            let foundSync = false;
            for (let i = 1; i <= lookahead && (originalIndex + i) < originalWords.length; i++) {
                if (originalWords[originalIndex + i] === tWord) {
                    // Found a sync point. The words in between were skipped.
                    for (let j = 0; j < i; j++) {
                        mistakes.push({
                            expected: originalWords[originalIndex + j],
                            actual: '',
                            position: userInput.indexOf(tWord) > 0 ? userInput.indexOf(tWord) -1 : 0
                        });
                    }
                    originalIndex += i; // Move originalIndex past the skipped words
                    foundSync = true;
                    break;
                }
            }

            if (!foundSync) {
                 // No sync found, assume it's a misspelling or an extra word
                 mistakes.push({
                    expected: oWord,
                    actual: tWord,
                    position: userInput.indexOf(tWord)
                 });
                 originalIndex++;
                 typedIndex++;
            }
        }
    }
    
    // Total characters in the original text (including spaces) for accuracy calculation
    const totalPossibleChars = originalText.length;
    
    // Calculate accuracy. Ensure it's not negative.
    const accuracy = totalPossibleChars > 0 ? Math.max(0, (correctChars / totalPossibleChars) * 100) : 0;
    
    // Calculate WPM. A "word" is considered to be 5 characters.
    const grossWpm = (userInput.length / 5) / (timeElapsed / 60);
    const netWpm = Math.max(0, grossWpm - (mistakes.length / (timeElapsed / 60)));


    return {
        wpm: Math.round(netWpm),
        accuracy,
        mistakes,
        timeElapsed,
        userInput: userInput.trim(),
    };
}


/**
 * Generates a visual diff array to show differences between original text and user input.
 * @param originalText The correct text.
 * @param userInput The text typed by the user.
 * @returns An array of WordDiff objects.
 */
export function generateWordDiff(originalText: string, userInput: string): WordDiff[] {
    const originalWords = originalText.split(/(\s+)/);
    const typedWords = userInput.split(/(\s+)/);
    const diff: WordDiff[] = [];
    
    let originalIndex = 0;
    let typedIndex = 0;
    const lookahead = 5;

    while (originalIndex < originalWords.length || typedIndex < typedWords.length) {
        const oWord = originalWords[originalIndex];
        const tWord = typedWords[typedIndex];

        if (oWord === undefined && tWord === undefined) break;

        // Handle whitespace
        if (oWord && /\s+/.test(oWord)) {
            diff.push({ word: oWord, status: 'whitespace' });
            originalIndex++;
            if (tWord && /\s+/.test(tWord)) {
                typedIndex++;
            }
            continue;
        }
        if (tWord && /\s+/.test(tWord)) {
             diff.push({ word: tWord, status: 'extra' });
             typedIndex++;
             continue;
        }

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
            let foundSync = false;
            for (let i = 1; i <= lookahead && originalIndex + i < originalWords.length; i++) {
                // We only check non-whitespace words for sync
                if (/\s+/.test(originalWords[originalIndex + i])) continue;

                if (originalWords[originalIndex + i] === tWord) {
                    // Words in between were skipped
                    for (let j = 0; j < i; j++) {
                        if (originalWords[originalIndex + j] && !/\s+/.test(originalWords[originalIndex + j])) {
                           diff.push({ word: originalWords[originalIndex + j], status: 'skipped' });
                        } else if (originalWords[originalIndex + j]) {
                           diff.push({ word: originalWords[originalIndex + j], status: 'whitespace' });
                        }
                    }
                    originalIndex += i;
                    foundSync = true;
                    break;
                }
            }

            if (foundSync) {
                 // The current tWord is correct now, so we push it and advance
                 diff.push({ word: tWord, status: 'correct' });
                 originalIndex++;
                 typedIndex++;
            } else {
                // No sync found, it's an incorrect word
                diff.push({ word: oWord, status: 'incorrect' });
                // We show the incorrect word the user typed in its place for context, often this is more useful.
                // But for simplicity, we are marking the original as 'incorrect' and moving both pointers.
                originalIndex++;
                typedIndex++;
            }
        }
    }
    return diff;
}
