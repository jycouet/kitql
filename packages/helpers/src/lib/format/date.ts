export function dateISOCompact(date?: string): string {
  const utc = date ? new Date(date) : new Date()
  const year = utc.getFullYear().toString().slice(-2).padStart(2, '0')
  const month = (utc.getMonth() + 1).toString().padStart(2, '0')
  const day = utc.getDate().toString().padStart(2, '0')
  const hours = utc.getHours().toString().padStart(2, '0')
  const minutes = utc.getMinutes().toString().padStart(2, '0')
  const seconds = utc.getSeconds().toString().padStart(2, '0')

  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}
