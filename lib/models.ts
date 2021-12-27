export type FilepathType = string | string[]

/**
 * Struct representing an input and output file.
 */
export type IO<T extends FilepathType, U extends FilepathType> = {
    inputPath: T
    outputPath: U
}

export type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array

export type NumberArray = Array<number> | TypedArray
