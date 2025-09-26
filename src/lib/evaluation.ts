/**
 * =================================================================
 * Advanced Typing Test Evaluation Module
 *
 * This file contains a complete, robust solution for evaluating
 * typing tests. It features:
 * - A single-pass diffing algorithm to ensure consistency.
 * - Advanced tokenization to correctly handle punctuation and special characters.
 * - Smarter resynchronization to gracefully manage extra or skipped words.
 * - Accurate WPM and Accuracy calculations derived from the detailed diff.
 * =================================================================
 */

// --- TYPE DEFINITIONS ---

export interface Mistake {
    expected: string;
    actual: string;
    position: number; // Represents the token index of the mistake
}

export interface EvaluationResult {
    wpm: number;
    accuracy: number;
    mistakes: Mistake[];
    timeElapsed: number;
    userInput: string;
    charStats: {
        correct: number;
        incorrect: number;
        extra: number;
        missed: number;
    };
}

export type CharDiff = {
    char: string;
    status: 'correct' | 'incorrect' | 'extra' | 'missing';
};

export type WordDiff = {
    word: string; // The token from the original text or what the user typed
    expected?: string; // The original token, if it differs from the typed one
    charDiffs?: CharDiff[];
    status: 'correct' | 'incorrect' | 'skipped' | 'extra' | 'whitespace' | 'pending';
};

// --- CORE LOGIC ---

/**
 * A robust tokenizer that separates words, punctuation, and whitespace into distinct tokens.
 * This is crucial for correctly handling special characters like apostrophes and periods.
 * @param text The string to tokenize.
 * @returns An array of string tokens.
 */
function tokenize(text: string): string[] {
    if (!text) return [];
    // This regex matches:
    // 1. [\w']+       : Sequences of word characters and apostrophes (e.g., "don't", "hello")
    // 2. [^\s\w']+   : Any character that is NOT a space or word character (e.g., ".", ",", "!")
    // 3. \s+          : Sequences of one or more whitespace characters.
    return text.match(/[\w']+|[^\s\w']+|\s+/g) || [];
}

/**
 * Generates a detailed, token-by-token diff using an advanced resynchronization algorithm.
 * This is the single source of truth for all analysis.
 * @param originalText The correct text.
 * @param userInput The text typed by the user.
 * @returns An array of WordDiff objects representing the detailed comparison.
 */
export function generateAdvancedDiff(originalText: string, userInput: string): WordDiff[] {
    const originalTokens = tokenize(originalText);
    const typedTokens = tokenize(userInput);
    const diff: WordDiff[] = [];
    const SYNC_LOOKAHEAD = 5; // How many tokens to look ahead to find a match and resync.

    let oIndex = 0;
    let tIndex = 0;

    while (oIndex < originalTokens.length || tIndex < typedTokens.length) {
        const oToken = originalTokens[oIndex];
        const tToken = typedTokens[tIndex];

        // 1. Handle whitespace from the original text
        if (oToken && /\s+/.test(oToken)) {
            diff.push({ word: oToken, status: 'whitespace' });
            oIndex++;
            // Consume corresponding typed whitespace if it exists to stay in sync
            if (tToken && /\s+/.test(tToken)) {
                tIndex++;
            }
            continue;
        }

        // 2. Handle end-of-text scenarios
        if (oToken === undefined) {
            if (tToken) {
                 if (!/\s+/.test(tToken)) diff.push({ word: tToken, status: 'extra' });
            }
            tIndex++;
            continue;
        }
        if (tToken === undefined) {
             if (!/\s+/.test(oToken)) diff.push({ word: oToken, status: 'pending' });
            oIndex++;
            continue;
        }
        
        // Ignore extra whitespace typed by the user
        if (/\s+/.test(tToken)) {
            tIndex++;
            continue;
        }

        // 3. Perfect match
        if (oToken === tToken) {
            diff.push({ word: oToken, status: 'correct' });
            oIndex++;
            tIndex++;
            continue;
        }

        // 4. Mismatch: Attempt to resynchronize within the lookahead window
        let foundSync = false;

        // Look ahead for skipped tokens in the original text
        for (let i = 1; i <= SYNC_LOOKAHEAD && oIndex + i < originalTokens.length; i++) {
            if (originalTokens[oIndex + i] === tToken) {
                for (let j = 0; j < i; j++) {
                    const skippedToken = originalTokens[oIndex + j];
                    if (!/\s+/.test(skippedToken)) {
                        diff.push({ word: skippedToken, status: 'skipped' });
                    }
                }
                oIndex += i;
                foundSync = true;
                break;
            }
        }
        if (foundSync) continue;

        // Look ahead for extra tokens in the typed input
        for (let i = 1; i <= SYNC_LOOKAHEAD && tIndex + i < typedTokens.length; i++) {
            if (oToken === typedTokens[tIndex + i]) {
                for (let j = 0; j < i; j++) {
                    const extraToken = typedTokens[tIndex + j];
                    if (!/\s+/.test(extraToken)) {
                        diff.push({ word: extraToken, status: 'extra' });
                    }
                }
                tIndex += i;
                foundSync = true;
                break;
            }
        }
        if (foundSync) continue;

        // 5. No sync found, assume a simple misspelling
        const charDiffs: CharDiff[] = [];
        const maxLen = Math.max(oToken.length, tToken.length);
        for (let i = 0; i < maxLen; i++) {
            const oChar = oToken[i];
            const tChar = tToken[i];
            if (tChar === undefined) {
                charDiffs.push({ char: oChar, status: 'missing' });
            } else if (oChar === undefined) {
                charDiffs.push({ char: tChar, status: 'extra' });
            } else if (oChar !== tChar) {
                // IMPORTANT: Show the character the user TYPED, not the original one.
                charDiffs.push({ char: tChar, status: 'incorrect' });
            } else {
                charDiffs.push({ char: tChar, status: 'correct' });
            }
        }
        diff.push({ word: tToken, expected: oToken, charDiffs, status: 'incorrect' });
        oIndex++;
        tIndex++;
    }

    return diff;
}

/**
 * Calculates final typing metrics based on the detailed diff analysis.
 * This function is now a simple consumer of `generateAdvancedDiff`.
 * @param originalText The correct text.
 * @param userInput The text typed by the user.
 * @param timeElapsed The time in seconds.
 * @returns An object with the calculated metrics.
 */
export function evaluateTyping(originalText: string, userInput: string, timeElapsed: number): EvaluationResult {
    if (!userInput) {
        return {
            wpm: 0,
            accuracy: 100,
            mistakes: [],
            timeElapsed,
            userInput: '',
            charStats: { correct: 0, incorrect: 0, extra: 0, missed: 0 },
        };
    }

    const diffs = generateAdvancedDiff(originalText, userInput);
    const mistakes: Mistake[] = [];

    let totalAttemptedChars = 0;
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    diffs.forEach((diff, index) => {
        // We only care about non-pending and non-whitespace tokens for accuracy
        if (diff.status === 'pending' || diff.status === 'whitespace') {
            return;
        }

        const expectedLen = diff.expected?.length ?? diff.word.length;
        totalAttemptedChars += expectedLen;

        switch (diff.status) {
            case 'correct':
                correctChars += diff.word.length;
                break;
            case 'incorrect':
                mistakes.push({ expected: diff.expected!, actual: diff.word, position: index });
                diff.charDiffs?.forEach(charDiff => {
                    if (charDiff.status === 'correct') correctChars++;
                    if (charDiff.status === 'incorrect') incorrectChars++;
                    if (charDiff.status === 'extra') extraChars++;
                    if (charDiff.status === 'missing') missedChars++;
                });
                break;
            case 'skipped':
                mistakes.push({ expected: diff.word, actual: '', position: index });
                missedChars += diff.word.length;
                break;
            case 'extra':
                mistakes.push({ expected: '', actual: diff.word, position: index });
                extraChars += diff.word.length;
                break;
        }
    });

    // Accuracy is the ratio of correct characters to all characters the user was supposed to type.
    const accuracy = totalAttemptedChars > 0 ? (correctChars / totalAttemptedChars) * 100 : 100;

    // Standard WPM calculation is based on (total characters typed / 5) / time in minutes.
    // This is often called "Gross WPM".
    const grossWpm = timeElapsed > 0 ? (userInput.length / 5) / (timeElapsed / 60) : 0;

    return {
        wpm: Math.round(grossWpm),
        accuracy: parseFloat(accuracy.toFixed(2)),
        mistakes,
        timeElapsed,
        userInput,
        charStats: {
            correct: correctChars,
            incorrect: incorrectChars,
            extra: extraChars,
            missed: missedChars,
        },
    };
}
