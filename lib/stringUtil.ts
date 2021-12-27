import curry from 'ramda/src/curry'

/**
 * @returns The input string, trimmed.
 */
export function trim(s: string): string {
    return s.trim()
}

/**
 * @returns A list of items from splitting the given string on the delimiter.
 */
function split(delimiter: string | RegExp, s: string): string[] {
    return s.split(delimiter)
}
const splitCurried = curry(split)
export { splitCurried as split }

/**
 * @returns Whether or not the input string has a non-zero length.
 */
export function isNotEmpty(s: string): boolean {
    return s.length !== 0
}
