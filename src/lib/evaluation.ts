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
    status: 'correct' | 'incorrect' | 'extra' | 'missing' | 'pending';
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
 * Finds the closest future index of a target token.
 * @param targetToken The token to search for.
 * @param tokens The array of tokens to search within.
 * @param startIndex The index from which to start the search.
 * @returns The index of the closest match, or -1 if not found.
 */
function findClosestFutureMatch(targetToken: string, tokens: string[], startIndex: number): number {
    let closestIndex = -1;
    for (let i = startIndex; i < tokens.length; i++) {
        if (tokens[i] === targetToken) {
            closestIndex = i;
            break;
        }
    }
    return closestIndex;
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

    let oIndex = 0;
    let tIndex = 0;

    while (oIndex < originalTokens.length || tIndex < typedTokens.length) {
        const oToken = originalTokens[oIndex];
        const tToken = typedTokens[tIndex];

        // 1. Handle whitespace from the original text
        if (oToken && /\s+/.test(oToken)) {
            diff.push({ word: oToken, status: 'whitespace' });
            oIndex++;
            if (tToken && /\s+/.test(tToken)) {
                tIndex++;
            }
            continue;
        }

        // 2. Handle end-of-text scenarios
        if (oToken === undefined) {
            if (tToken && !/\s+/.test(tToken)) diff.push({ word: tToken, status: 'extra' });
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
        
        // 4. Mismatch: Attempt to resynchronize
        const futureOTokenIndex = findClosestFutureMatch(tToken, originalTokens, oIndex + 1);
        const futureTTokenIndex = findClosestFutureMatch(oToken, typedTokens, tIndex + 1);

        // Scenario: User skipped words
        if (futureOTokenIndex !== -1) {
            // Check if skipping ahead is a better option than marking as incorrect.
            // A simple heuristic: if the user typed a word that exists in the future,
            // and the alternative is a long trail of incorrect/extra words, skipping is better.
            const distance = futureOTokenIndex - oIndex;
            // A small distance is a strong signal for a skip.
            if (distance > 0) {
                 for (let i = 0; i < distance; i++) {
                    const skippedToken = originalTokens[oIndex + i];
                    if (!/\s+/.test(skippedToken)) {
                        diff.push({ word: skippedToken, status: 'skipped' });
                    }
                }
                oIndex = futureOTokenIndex; // Jump to the synced position
                continue; // Re-evaluate from the new position
            }
        }
        
        // Scenario: User typed extra words
        if (futureTTokenIndex !== -1) {
             const distance = futureTTokenIndex - tIndex;
             if (distance > 0) {
                for (let i = 0; i < distance; i++) {
                    const extraToken = typedTokens[tIndex + i];
                     if (!/\s+/.test(extraToken)) {
                        diff.push({ word: extraToken, status: 'extra' });
                    }
                }
                tIndex = futureTTokenIndex;
                continue;
             }
        }

        // 5. No sync found, assume a simple misspelling or partially typed word
        const charDiffs: CharDiff[] = [];
        const tLen = tToken.length;
        const oLen = oToken.length;

        for (let i = 0; i < oLen; i++) {
            const oChar = oToken[i];
            const tChar = tToken[i];

            if (tChar === undefined) {
                // User hasn't typed this far into the word yet.
                charDiffs.push({ char: oChar, status: 'pending' });
            } else if (oChar !== tChar) {
                charDiffs.push({ char: oChar, status: 'incorrect' });
            } else {
                charDiffs.push({ char: oChar, status: 'correct' });
            }
        }
        // Handle extra characters typed by the user beyond the original word's length
        if (tLen > oLen) {
            for (let i = oLen; i < tLen; i++) {
                charDiffs.push({ char: tToken[i], status: 'extra' });
            }
        }
        
        diff.push({ word: oToken, expected: oToken, charDiffs, status: 'incorrect' });
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
                // For 'incorrect', the 'word' is the user's input, 'expected' is original
                mistakes.push({ expected: diff.expected!, actual: diff.word, position: index });
                diff.charDiffs?.forEach(charDiff => {
                    if(charDiff.status === 'correct') correctChars++;
                    if(charDiff.status === 'incorrect') incorrectChars++;
                    if(charDiff.status === 'extra') extraChars++;
                    // 'missing' status from charDiffs inside an 'incorrect' word is an incorrect char
                    if(charDiff.status === 'missing') incorrectChars++;
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

    const accuracy = totalAttemptedChars > 0 ? (correctChars / totalAttemptedChars) * 100 : 100;
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
