// Helper, not a legacy matcher: no `match` export
export const toAb = (param: string) => (['a', 'b'].includes(param) ? param : undefined)
