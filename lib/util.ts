// ————————————
// General
// ————————————

/**
 * @returns Whether the given value is both defined and non-null.
 */
export function exists<T>(val: T): val is NonNullable<T> {
    return val !== undefined && val !== null
}

// ————————————
// Array
// ————————————

/**
 * @returns The list's length.
 */
export function length<T extends any[]>(list: T): number {
    return list.length
}

/**
 * @returns The first index of the highest value in the given array.
 */
export function argmax(list: number[]): number {
    return list.indexOf(Math.max(...list))
}

/**
 * @returns The first index of the smallest value in the given array.
 */
export function argmin(list: number[]): number {
    return list.indexOf(Math.min(...list))
}

/**
 * @returns A boolean map whose keys are the elements in the array.
 */
export function toBooleanMap(list: number[]): { [x: string]: boolean } {
    let boolMap = {}
    list.forEach((num) => {
        boolMap[num] = true
    })
    return boolMap
}
