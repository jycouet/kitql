/**
 * In the format YYMMDD_HHMMSS
 * In the local timezone (UTC if server is in UTC!)
 */
export function dateCompact(date?: Date): string {
	const dtToUse = date ? date : new Date()
	dtToUse.setMinutes(dtToUse.getMinutes() - dtToUse.getTimezoneOffset())
	const isoStr = dtToUse.toISOString()

	const year = isoStr.slice(2, 4)
	const month = isoStr.slice(5, 7)
	const day = isoStr.slice(8, 10)
	const hours = isoStr.slice(11, 13)
	const minutes = isoStr.slice(14, 16)
	const seconds = isoStr.slice(17, 19)

	return `${year}${month}${day}_${hours}${minutes}${seconds}`
}
