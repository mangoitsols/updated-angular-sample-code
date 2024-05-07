/**
 * The function removes null and undefined properties from an object recursively.
 * @param {any} object - The `object` parameter is the input object from which you want to remove null
 * and undefined properties.
 * @returns an object with null and undefined properties removed.
 */
export function removeNullAndUndefinedProperties(object: any): any {
  if (object === null || object === undefined) {
    return null;
  }

  if (typeof object !== 'object') {
    return object;
  }

  const result: any = {};

  for (const key of Object.keys(object)) {
    const value = removeNullAndUndefinedProperties(object[key]);

    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
