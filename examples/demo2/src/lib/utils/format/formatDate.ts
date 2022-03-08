import { parse } from 'date-fns';

//Wed Sep 8 21:15:29 2021 +0200
export function gitStringDatetoDate(dt: string) {
	return parse(dt.substring(4), 'MMM d HH:mm:ss yyyy xx', 0);
}
