/**
 * A custom Filter Query type for query params
 * @type {FilterQuery}
 * @example
 * {
 * key1: value1,
 * key2: value2,
 * key3: value3,
 * }
 */
export type FilterQuery = { [key: string]: string | number | boolean };
