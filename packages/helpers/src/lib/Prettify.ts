// Matt Pocock tips //https://www.youtube.com/watch?v=2lCCKiWGlC0
export type Prettify<T> = {
	[K in keyof T]: T[K]
} & Record<string, any>
