function sortObject(object: Object) {
  const sortedObj = {};
  const keys = Object.keys(object);

  keys.sort((key1, key2) => {
    (key1 = key1.toLowerCase()), (key2 = key2.toLowerCase());
    if (key1 < key2) return -1;
    if (key1 > key2) return 1;
    return 0;
  });

  for (const index in keys) {
    const key = keys[index];
    if (typeof object[key] == 'object' && !Array.isArray(object[key]) && object[key]) {
      sortedObj[key] = sortObject(object[key]);
    } else {
      sortedObj[key] = object[key];
    }
  }

  return sortedObj;
}

export function stry(obj: Object | null | undefined, space = 2): string | null | undefined {
  if (obj === null) {
    return null;
  }
  if (obj === undefined) {
    return undefined;
  }
  const ordered = sortObject(obj);
  return JSON.stringify(ordered, null, space);
}
