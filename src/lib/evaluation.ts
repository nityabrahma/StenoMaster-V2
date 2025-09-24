
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

        if (tWord === oWord) {
            // Correct word
            correctChars += (oWord.length + 1); // +1 for the space
            originalIndex++;
            typedIndex++;
        } else if (oWord === undefined) {
             // User typed extra words at the end
             mistakes.push({ expected: '', actual: tWord, position: -1 }); // Position is tricky for extra words
             typedIndex++;
        } else if (tWord === undefined) {
            // User missed words at the end
            mistakes.push({ expected: oWord, actual: '', position: -1 });
            originalIndex++;
        } else {
            // Mismatch, try to resync by looking ahead in the original text
            let foundSync = false;
            for (let i = 1; i <= lookahead && (originalIndex + i) < originalWords.length; i++) {
                if (originalWords[originalIndex + i] === tWord) {
                    // Found a sync point. The words in between were skipped.
                    for (let j = 0; j < i; j++) {
                        mistakes.push({
                            expected: originalWords[originalIndex + j],
                            actual: '',
                            position: -1
                        });
                    }
                    originalIndex += i; // Move originalIndex past the skipped words
                    foundSync = true;
                    break;
                }
            }

            if (!foundSync) {
                 // No sync found. Let's try looking ahead in the typed text (for extra words).
                 for (let i = 1; i <= lookahead && (typedIndex + i) < typedWords.length; i++) {
                    if(originalWords[originalIndex] === typedWords[typedIndex + i]) {
                        // Found a sync point. The words in between were extra.
                        for (let j = 0; j < i; j++) {
                            mistakes.push({
                                expected: '',
                                actual: typedWords[typedIndex + j],
                                position: -1,
                            });
                        }
                        typedIndex += i;
                        foundSync = true;
                        break;
                    }
                 }
            }

            if (!foundSync) {
                 // Still no sync. Assume it's a misspelling.
                 mistakes.push({
                    expected: oWord,
                    actual: tWord,
                    position: -1
                 });
                 originalIndex++;
                 typedIndex++;
            }
        }
    }
    
    const totalPossibleChars = originalText.length;
    let incorrectChars = 0;
    mistakes.forEach(mistake => {
        // A skipped word counts as all its characters being wrong.
        if (mistake.actual === '') {
            incorrectChars += mistake.expected.length + 1; // +1 for space
        } 
        // An extra word counts as all its characters being wrong.
        else if (mistake.expected === '') {
            incorrectChars += mistake.actual.length + 1;
        } 
        // A misspelled word is more complex. For simplicity, we penalize the length of the expected word.
        else {
            incorrectChars += mistake.expected.length + 1;
        }
    });

    const calculatedCorrectChars = totalPossibleChars - incorrectChars;
    const accuracy = totalPossibleChars > 0 ? Math.max(0, (calculatedCorrectChars / totalPossibleChars) * 100) : 0;
    
    // WPM based on standard of 5 chars per word
    const grossWpm = (userInput.length / 5) / (timeElapsed / 60);
    // Net WPM penalizes errors
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
 * This function now uses a more robust algorithm to handle skipped/extra words.
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

        // Correct word match
        if (oWord === tWord) {
            const status = /\s+/.test(oWord) ? 'whitespace' : 'correct';
            diff.push({ word: oWord, status });
            originalIndex++;
            typedIndex++;
            continue;
        }

        // Lookahead for resynchronization
        let foundSyncInOriginal = -1;
        let foundSyncInTyped = -1;

        // Look ahead in original text to find the current typed word (handles skipped words)
        for (let i = 1; i <= lookahead && originalIndex + i < originalWords.length; i++) {
            if (originalWords[originalIndex + i] === tWord) {
                foundSyncInOriginal = i;
                break;
            }
        }

        // Look ahead in typed text to find the current original word (handles extra words)
        for (let i = 1; i <= lookahead && typedIndex + i < typedWords.length; i++) {
            if (oWord === typedWords[typedIndex + i]) {
                foundSyncInTyped = i;
                break;
            }
        }

        if (foundSyncInOriginal !== -1) {
            // User skipped words. Mark them as 'skipped'.
            for (let i = 0; i < foundSyncInOriginal; i++) {
                const skippedWord = originalWords[originalIndex + i];
                 const status = /\s+/.test(skippedWord) ? 'whitespace' : 'skipped';
                diff.push({ word: skippedWord, status });
            }
            originalIndex += foundSyncInOriginal;
        } else if (foundSyncInTyped !== -1) {
            // User typed extra words. Mark them as 'extra'.
            for (let i = 0; i < foundSyncInTyped; i++) {
                const extraWord = typedWords[typedIndex + i];
                const status = /\s+/.test(extraWord) ? 'whitespace' : 'extra';
                diff.push({ word: extraWord, status });
            }
            typedIndex += foundSyncInTyped;
        } else {
            // No sync found, it's an incorrect word (or extra/skipped at the end)
            if (oWord !== undefined) {
                 diff.push({ word: oWord, status: 'incorrect' });
                 originalIndex++;
            }
             if (tWord !== undefined) {
                // To avoid duplicating the word if it's a simple misspelling,
                // we might not want to push the typed word as 'extra' immediately.
                // For now, let's advance the typed pointer to avoid an infinite loop.
                if (oWord !== undefined) {
                   typedIndex++;
                } else {
                   // Original text is done, rest of typed text is extra.
                   diff.push({ word: tWord, status: 'extra' });
                   typedIndex++;
                }
            }
        }
    }
    return diff;
}
