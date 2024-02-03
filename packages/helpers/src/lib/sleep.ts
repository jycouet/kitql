export async function sleep(ms: number) {
  if (ms <= 0) {
    return
  }
  return new Promise((resolve) => setTimeout(resolve, ms))
}
