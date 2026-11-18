/** Accept relative account paths only; browsers normalize backslashes to slashes. */
export function safeAccountPath(value?: string): string {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return "/drafts";
  return value;
}
