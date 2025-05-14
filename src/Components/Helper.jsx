// Helper.js

// Check if a line is heading (for backward compatibility if still used somewhere)
export function checkHeading(str) {
  return /^(\*\*|##|###)/.test(str.trim());
}

export function replaceHeadingStars(str) {
  return str.replace(/^(\*\*|##|###)\s?/, "").replace(/\*\*$/, "").trim();
}

// Markdown Parser Starts Here
export function parseMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];

  let isCodeBlock = false;
  let codeLang = "";
  let codeLines = [];

  lines.forEach((line, index) => {
    line = line.trim();

    // Code block toggle
    if (line.startsWith("```")) {
      if (!isCodeBlock) {
        isCodeBlock = true;
        codeLang = line.replace("```", "").trim();
        codeLines = [];
      } else {
        isCodeBlock = false;
        elements.push(
          <pre key={index} className="bg-black text-green-400 p-3 rounded my-3 overflow-auto">
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
      }
      return;
    }

    if (isCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Headings
    if (line.startsWith("###")) {
      elements.push(
        <h3 key={index} className="text-xl font-bold mt-4 mb-2">
          {line.replace(/^###\s*/, "")}
        </h3>
      );
    } else if (line.startsWith("##")) {
      elements.push(
        <h2 key={index} className="text-2xl font-semibold mt-5 mb-2">
          {line.replace(/^##\s*/, "")}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <h2 key={index} className="text-xl font-bold mt-3">
          {line.replace(/\*\*/g, "")}
        </h2>
      );
    }
    // Unordered list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={index} className="ml-6 list-disc">{formatInlineMarkdown(line.substring(2))}</li>
      );
    }
    // Ordered list
    else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={index} className="ml-6 list-decimal">{formatInlineMarkdown(line.replace(/^\d+\.\s/, ""))}</li>
      );
    }
    // Paragraph
    else if (line) {
      elements.push(
        <p key={index} className="mb-2">{formatInlineMarkdown(line)}</p>
      );
    }
  });

  return elements;
}

// Inline formatting (bold, italic, inline code)
function formatInlineMarkdown(text) {
  const boldItalicRegex = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
  const parts = [];
  let lastIndex = 0;

  text.replace(boldItalicRegex, (match, bold, italic, code, offset) => {
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }

    if (bold) {
      parts.push(<strong key={offset} className="font-semibold">{bold.slice(2, -2)}</strong>);
    } else if (italic) {
      parts.push(<em key={offset} className="italic">{italic.slice(1, -1)}</em>);
    } else if (code) {
      parts.push(<code key={offset} className="bg-gray-800 text-green-300 px-1 rounded">{code.slice(1, -1)}</code>);
    }

    lastIndex = offset + match.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : text;
}
