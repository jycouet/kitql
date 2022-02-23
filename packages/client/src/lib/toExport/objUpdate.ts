export type TUpdate = {
	found: boolean;
	obj: Object;
};

export function objUpdate(
	found: boolean,
	obj: Object,
	newData: Object,
	xPath: string | null,
	id: string | number | null
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
			if (segment.includes('=$id')) {
				const [key] = segment.split('=$id');
				if (obj[key] !== undefined && obj[key] === id) {
					toReturn = { found: true, obj: newData };
					return;
				}
			} else {
				if (obj && obj[segment] !== undefined) {
					// replace in the existing obj the new data
					toReturn = { found: true, obj: { ...obj, [segment]: newData } };
					return;
				}
			}
		} else if (segment.endsWith('[]')) {
			let propertyName = segment.substring(0, segment.length - 2);
			if (obj[propertyName] !== undefined) {
				let xPathNext = segments.slice(1).join('.');
				obj[propertyName].forEach((arrayItem, i) => {
					const result = objUpdate(toReturn.found, obj[propertyName][i], newData, xPathNext, id);
					obj[propertyName][i] = result.obj;
					toReturn.found = result.found;
					if (toReturn.found) {
						return;
					}
				});
			}
		} else {
			if (obj && obj[segment] !== undefined) {
				let xPathNext = segments.slice(1).join('.');
				const result = objUpdate(toReturn.found, obj[segment], newData, xPathNext, id);
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
