const textSplitter = (text, charsPerLine) => {
    const words = text.trim().split(" ");
    const lines = [];
    let currentLine = [];
    let currentLength = 0;

    while (words.length > 0) {
        const word = words[0];
        const wordLength = currentLine.length > 0 ? word.length + 1 : word.length;

        if (currentLength + wordLength <= charsPerLine) {
            currentLine.push(words.shift());
            currentLength += wordLength;
        } else {
            if (currentLine.length === 0) {
                const firstPart = word.slice(0, charsPerLine);
                const remainingPart = word.slice(charsPerLine);
                currentLine.push(firstPart);
                words[0] = remainingPart;
            }

            const lineText = currentLine.join(" ").trimEnd();
            const padding = " ".repeat(charsPerLine - lineText.length);
            lines.push(lineText + padding);
            currentLine = [];
            currentLength = 0;
        }
    }

    if (currentLine.length > 0) {
        const lastLine = currentLine.join(" ").trimEnd();
        lines.push(lastLine);
    }

    return lines.map(line => line.trimEnd());
};

/**
 * Custom hook for handling animated text logic
 * @param {string} text - The text to animate
 * @param {number|number[]} parse - Number of characters per line or array of character limits
 * @returns {Object} Object containing parse values and split text
 */
export const useAnimatedTextLogic = (text, parse) => {
    const parseValues = Array.isArray(parse) ? parse : [parse || 52];
    const textSplits = parseValues.map(chars => textSplitter(text, chars));

    return {
        parseValues,
        textSplits
    };
};

// Export the textSplitter function as well in case it's needed separately
export { textSplitter };