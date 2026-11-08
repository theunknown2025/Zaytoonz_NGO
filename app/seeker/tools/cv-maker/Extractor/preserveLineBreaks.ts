/** Keep source line breaks and turn inline bullets into their own lines. */
export function textWithLineBreaks(value: unknown): string {
  const raw = Array.isArray(value)
    ? value
        .map((item) => String(item ?? '').trim())
        .filter((item) => item.length > 0)
        .join('\n')
    : String(value ?? '');

  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/[ \t]*([•●▪◦])[ \t]*/g, '\n$1 ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
