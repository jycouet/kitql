import { checkConf } from '../src';
import { assert, describe, expect, it } from 'vitest';

describe('vite-plugin-watch-and-run', () => {
	it('Should throw an error as no config is sent', async () => {
		const t = () => {
			checkConf(null);
		};
		expect(t).toThrowErrorMatchingInlineSnapshot(
			'"plugin watchAndRun, `params` needs to be an array."'
		);
	});

	it('Should have a valid conf, with default delay:500', async () => {
		const conf = checkConf([{ watch: '**/*.(gql|graphql)', run: 'yarn gen' }]);
		expect(conf).toMatchInlineSnapshot(`
			{
			  "**/*.(gql|graphql)": {
			    "delay": 500,
			    "isRunnig": false,
			    "run": "yarn gen",
			  },
			}
		`);
	});

	it('Should have a valid conf, with delay 0', async () => {
		const conf = checkConf([{ watch: '**/*.(gql|graphql)', run: 'yarn gen', delay: 0 }]);
		expect(conf).toMatchInlineSnapshot(`
			{
			  "**/*.(gql|graphql)": {
			    "delay": 0,
			    "isRunnig": false,
			    "run": "yarn gen",
			  },
			}
		`);
	});
});
