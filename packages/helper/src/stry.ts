function sortObject(object: Object) {
	var sortedObj = {};
	var keys = Object.keys(object);

	keys.sort(function(key1, key2) {
		(key1 = key1.toLowerCase()), (key2 = key2.toLowerCase());
		if (key1 < key2) return -1;
		if (key1 > key2) return 1;
		return 0;
	});

	for (var index in keys) {
		var key = keys[index];
		if (typeof object[key] == 'object' && !(object[key] instanceof Array) && object[key]) {
			sortedObj[key] = sortObject(object[key]);
		} else {
			sortedObj[key] = object[key];
		}
	}

	return sortedObj;
}

export function stry(obj: Object | null | undefined, space: number = 2): string | null | undefined {
	if (obj === null) {
		return null;
	} else if (obj === undefined) {
		return undefined;
	}
	const ordered = sortObject(obj);
	return JSON.stringify(ordered, null, space);
}
