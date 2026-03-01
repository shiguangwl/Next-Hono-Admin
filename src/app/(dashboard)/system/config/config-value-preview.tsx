"use client";

import { Code, ScrollArea, Text } from "@mantine/core";
import { type CSSProperties, type ReactNode } from "react";

export type ConfigType = "string" | "boolean" | "number" | "json" | "array";

export function ConfigValuePreview({
  value,
  type,
}: {
  value: string;
  type: ConfigType;
}) {
  const isJsonLike = type === "json" || type === "array";

  if (!value) {
    return (
      <div>
        <Text size="xs" fw={500} c="dimmed" mb={4}>
          预览
        </Text>
        <Code block style={{ fontFamily: "monospace" }}>
          (空)
        </Code>
      </div>
    );
  }

  if (!isJsonLike) {
    return (
      <div>
        <Text size="xs" fw={500} c="dimmed" mb={4}>
          预览
        </Text>
        <ScrollArea.Autosize mah={240}>
          <Code block style={{ fontFamily: "monospace" }}>
            {value}
          </Code>
        </ScrollArea.Autosize>
      </div>
    );
  }

  return <JsonPreview value={value} />;
}

function JsonPreview({ value }: { value: string }) {
  let formatted = value;
  let parseError: string | null = null;

  try {
    const parsed = JSON.parse(value);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    parseError = "JSON 解析失败，以下为原始内容";
  }

  const content = syntaxHighlightJson(formatted);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <Text size="xs" fw={500} c="dimmed">
          预览（JSON 语法高亮）
        </Text>
        {parseError && (
          <Text size="xs" c="red">
            {parseError}
          </Text>
        )}
      </div>
      <ScrollArea.Autosize mah={240}>
        <pre
          style={{
            backgroundColor: "#1e1e1e",
            padding: "8px 12px",
            borderRadius: "var(--mantine-radius-sm)",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          {content}
        </pre>
      </ScrollArea.Autosize>
    </div>
  );
}

// WHY: 手动语法高亮避免引入 highlight.js 等重依赖
function syntaxHighlightJson(json: string): ReactNode[] {
  const regex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
  const elements: ReactNode[] = [];
  let lastIndex = 0;

  json.replace(regex, (match, _g, _u, _c, _b, offset: number) => {
    if (lastIndex < offset) elements.push(json.slice(lastIndex, offset));

    let style: CSSProperties = {};
    if (/^"/.test(match)) {
      style = /:$/.test(match) ? { color: "#9cdcfe" } : { color: "#ce9178" };
    } else if (/true|false/.test(match)) {
      style = { color: "#569cd6" };
    } else if (/null/.test(match)) {
      style = { color: "#569cd6", fontStyle: "italic" };
    } else {
      style = { color: "#b5cea8" };
    }

    elements.push(
      <span style={style} key={elements.length}>
        {match}
      </span>,
    );
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < json.length) elements.push(json.slice(lastIndex));
  return elements;
}

