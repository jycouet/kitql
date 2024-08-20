export type OptionsByPath<T> = Array<[string | RegExp, T]>

export function getMatchingOptionForURL<T>(url: URL, options: OptionsByPath<T>): T | undefined {
  return options.find(([path]) =>
    typeof path === 'string' ? url.pathname.startsWith(path) : path.test(url.pathname),
  )?.[1]
}
