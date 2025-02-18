export default function SplitText({ text, parse = 30, className }) {
    const splitText = (text, parse) => {
        const words = text.trim().split(" ");
        const lines = [];
        let currentLine = [];
        let currentLength = 0;

        // Process all lines except potentially the last one
        while (words.length > 0) {
            const word = words[0];
            const wordLength = currentLine.length > 0 ? word.length + 1 : word.length;

            if (currentLength + wordLength <= parse) {
                currentLine.push(words.shift());
                currentLength += wordLength;
            } else {
                // If current line is empty but word is longer than parse,
                // force split the word
                if (currentLine.length === 0) {
                    const firstPart = word.slice(0, parse);
                    const remainingPart = word.slice(parse);
                    currentLine.push(firstPart);
                    words[0] = remainingPart;
                }

                // Pad the line with spaces to make it exactly parse characters
                const lineText = currentLine.join(" ");
                const padding = " ".repeat(parse - lineText.length);
                lines.push(lineText + padding);
                currentLine = [];
                currentLength = 0;
            }
        }

        // Add the last line without padding if there's remaining text
        if (currentLine.length > 0) {
            lines.push(currentLine.join(" "));
        }

        return lines;
    };

    const lines = splitText(text, parse);

    return (
        <>
            {lines.map((line, index) => (
                <span
                    key={`${line}-${index}`}
                    className={className || null}
                    style={{ animationDelay: (index * 0.1) + 's', whiteSpace: 'pre' }}
                >
                    {line}
                </span>
            ))}
        </>
    );
}