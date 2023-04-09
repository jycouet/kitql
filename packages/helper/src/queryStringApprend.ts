/**
 * Add things to the queryString.
 *
 * Normal usage:
 * ```
 * goto(`?${queryStringApprend($page.url.searchParams, { focus: "Hello" })}`);
 * ```
 * @param searchParams usually: $page.url.searchParams
 * @param queryString an object with key value pairs, something like { focus: "Hello" }
 * @returns a sorted query string
 */
export function queryStringApprend(
  searchParams: URLSearchParams,
  queryString: Record<string, string>,
) {
  const query: Record<string, string> = {}

  // 1 Destructure searchParams
  searchParams.forEach((v, k) => {
    query[k] = v
  })

  // 2 Upset with our queryString
  for (const key in queryString) {
    query[key] = queryString[key]
  }

  // 3 Transform in a table
  const qs = []
  for (const key in query) {
    qs.push(`${key}=${query[key]}`)
  }

  // 4 send back the Query String
  return qs.sort().join('&')
}
