export type TUpdate = {
	found: boolean;
	obj: Object;
};

// '_$id(2)' or '[]$add(2)' or '[]$add'
function extractKeyValue(str: string) {
	if (str.includes('[]$add')) {
		const [key, value] = str.split('[]$add');
		return {
			key,
			value: value ? extractKeyValue('_$PROPS' + value).value : -1
		};
	} else if (str.includes('[]$remove(')) {
		const [key, value] = str.split('[]$remove(');
		return { key, value: value.substring(0, value.length - 1) };
	} else if (str.includes('[]$filter(')) {
		const [key, value] = str.split('[]$filter(');
		return { key, value: value.substring(0, value.length - 1) };
	} else if (str.startsWith('_$')) {
		const [key, value] = str.substring(2).split('(');
		return {
			key,
			value: value.substring(0, value.length - 1)
		};
	}
	return null;
}

export function objUpdate(
	found: boolean,
	obj: Object,
	newData: Object,
	xPath: string | null
): TUpdate {
	// replace directly obj with newData
	if (xPath === null) {
		return { found: true, obj: newData };
	}
	let segments = xPath.split('.');

	let toReturn = { found, obj };

	// Already found!
	if (toReturn.found) {
		return toReturn;
	}

	segments.forEach((segment) => {
		if (toReturn.found) {
			return;
		}

		if (segments.length === 1) {
			if (segment.includes('[]$add')) {
				const kvp = extractKeyValue(segment);
				let pos = kvp.value === -1 ? obj[kvp.key].length : kvp.value;
				let newArray = obj[kvp.key];
				newArray.splice(pos, 0, newData);
				toReturn = { found: true, obj: { ...obj, [kvp.key]: newArray } };
			} else if (segment.includes('[]$remove')) {
				const kvp = extractKeyValue(segment);
				const kvpElement = extractKeyValue(kvp.value);
				let newArray = obj[kvp.key];
				newArray = newArray.filter((c) => {
					return c[kvpElement.key].toString() !== kvpElement.value;
				});
				const ToRmvFound = newArray.length !== obj[kvp.key].length;
				toReturn = { found: ToRmvFound, obj: { ...obj, [kvp.key]: newArray } };
			} else if (segment.includes('_$')) {
				const kvp = extractKeyValue(segment);
				if (kvp) {
					if (obj[kvp.key] !== undefined && obj[kvp.key].toString() === kvp.value) {
						toReturn = { found: true, obj: newData };
						return;
					}
				} else {
					throw new Error('objUpdate - Invalid segment: ' + segment);
				}
			} else {
				if (obj && obj[segment] !== undefined) {
					// replace in the existing obj the new data
					toReturn = { found: true, obj: { ...obj, [segment]: newData } };
					return;
				}
			}
		} else if (segment.includes('[]')) {
			let [propertyName] = segment.split('[]');
			if (obj && obj[propertyName] !== undefined) {
				const kvp = segment.includes('[]$filter(') ? extractKeyValue(segment) : null;
				const kvpElement = kvp ? extractKeyValue(kvp.value) : null;
				let xPathNext = segments.slice(1).join('.');
				obj[propertyName].forEach((arrayItem, i) => {
					if (kvpElement) {
						if (obj[propertyName][i][kvpElement.key].toString() === kvpElement.value) {
							const result = objUpdate(toReturn.found, obj[propertyName][i], newData, xPathNext);
							obj[propertyName][i] = result.obj;
							toReturn.found = result.found;
							if (toReturn.found) {
								return;
							}
						}
					} else {
						const result = objUpdate(toReturn.found, obj[propertyName][i], newData, xPathNext);
						obj[propertyName][i] = result.obj;
						toReturn.found = result.found;
						if (toReturn.found) {
							return;
						}
					}
				});
			}
		} else {
			if (obj && obj[segment] !== undefined) {
				let xPathNext = segments.slice(1).join('.');
				const result = objUpdate(toReturn.found, obj[segment], newData, xPathNext);
				obj[segment] = result.obj;
				toReturn.found = result.found;
				if (toReturn.found) {
					return;
				}
			}
		}
	});

	return toReturn;
}
