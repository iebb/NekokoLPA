export function getUTF8Length(s: string) {
  return new TextEncoder().encode(s).length;
}
