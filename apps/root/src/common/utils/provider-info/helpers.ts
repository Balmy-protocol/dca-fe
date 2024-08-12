export function filterMatches<T>(array: T[], condition: (x: T) => boolean, fallback: T | undefined): T | undefined {
  let result = fallback;
  const matches = array.filter(condition);

  if (!!matches && matches.length) {
    [result] = matches;
  }

  return result;
}
