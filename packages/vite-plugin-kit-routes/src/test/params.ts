// Kit 3 layout fixture: one `defineParams` entry instead of a file per matcher
export const params = {
	ab: (param: string) => (['a', 'b'].includes(param) ? param : undefined),
}
