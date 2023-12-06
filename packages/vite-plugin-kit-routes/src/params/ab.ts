// this will be infered in 'vite-plugin-kit-routes'
export const match = (param: 'a' | 'b') => {
  return ['a', 'b'].includes(param)
}
