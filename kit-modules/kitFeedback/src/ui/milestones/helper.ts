export const computeMilestoneTitle = (
	title: string,
	removeFilterFromName = false,
	filter = ''
) => {
	if (removeFilterFromName) {
		return title.replace(filter, '').trim();
	}
	return title;
};
