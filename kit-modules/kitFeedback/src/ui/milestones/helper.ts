export const computeMilestoneTitle = (
	title: string,
	removeFilterFromName: boolean = false,
	filter: string = ''
) => {
	if (removeFilterFromName) {
		return title.replace(filter, '').trim();
	}
	return title;
};
