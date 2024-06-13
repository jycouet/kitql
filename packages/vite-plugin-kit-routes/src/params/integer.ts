export const match = (param: number) => {
  return /^\d+$/.test(String(param))
}
