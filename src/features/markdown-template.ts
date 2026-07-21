import type { HomeAssistant } from "../core/types";
import { formatDate } from "./due-dates";

export function renderMarkdownTemplate(
  template: string | undefined,
  hass: HomeAssistant | undefined
): string {
  if (!template) return "";
  const expanded = expandJinjaExpressions(template, hass);
  return renderMarkdown(expanded);
}

export function expandJinjaExpressions(
  value: string,
  hass: HomeAssistant | undefined
): string {
  return value.replace(/\{\{(.+?)\}\}/g, (_match, expression: string) => {
    try {
      return evaluateExpression(expression.trim(), hass);
    } catch {
      return `[${expression.trim()}]`;
    }
  });
}

export function evaluateExpression(
  expression: string,
  hass: HomeAssistant | undefined,
  now = new Date()
): string {
  const dateMatch = expression.match(/now\(\)\.strftime\(['"](.+?)['"]\)/);
  if (dateMatch) return formatDate(now, pythonDateFormatToPgrMask(dateMatch[1]));

  if (expression === "user") return hass?.user?.name || "unknown";

  const statesMatch = expression.match(/states\(['"](.+?)['"]\)/);
  if (statesMatch) return hass?.states?.[statesMatch[1]]?.state || "unavailable";

  const stateAttrMatch = expression.match(/state_attr\(['"](.+?)['"],\s*['"](.+?)['"]\)/);
  if (stateAttrMatch) {
    const value = hass?.states?.[stateAttrMatch[1]]?.attributes?.[stateAttrMatch[2]];
    return value == null ? "" : String(value);
  }

  throw new Error(`Unsupported expression: ${expression}`);
}

export function pythonDateFormatToPgrMask(format: string): string {
  return format
    .replace(/%d/g, "dd")
    .replace(/%m/g, "mm")
    .replace(/%Y/g, "yyyy")
    .replace(/%H/g, "HH")
    .replace(/%M/g, "MM")
    .replace(/%S/g, "ss")
    .replace(/%B/g, "mmmm")
    .replace(/%b/g, "mmm")
    .replace(/%A/g, "dddd")
    .replace(/%a/g, "ddd")
    .replace(/%I/g, "hh")
    .replace(/%p/g, "TT");
}

export function renderMarkdown(markdown: string): string {
  const blocks = markdown.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return blocks.map(renderBlock).filter(Boolean).join("\n");
}

function renderBlock(block: string): string {
  const lines = block.split("\n");
  const trimmed = block.trim();
  if (!trimmed) return "";

  const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
  if (heading) {
    const level = heading[1].length;
    return `<h${level}>${renderInline(heading[2].trim())}</h${level}>`;
  }

  if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
    const items = lines
      .map((line) => line.replace(/^\s*[-*]\s+/, ""))
      .map((line) => `<li>${renderInline(line)}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  }

  if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
    const items = lines
      .map((line) => line.replace(/^\s*\d+\.\s+/, ""))
      .map((line) => `<li>${renderInline(line)}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  }

  return `<p>${lines.map((line) => renderInline(line)).join("<br>")}</p>`;
}

function renderInline(value: string): string {
  let rendered = escapeHtml(value);
  rendered = rendered.replace(/`([^`]+)`/g, "<code>$1</code>");
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  rendered = rendered.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  );
  return rendered;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
