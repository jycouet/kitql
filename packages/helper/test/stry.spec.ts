import { describe, expect, it } from 'vitest';
import { stry } from '../src/stry';

describe('kitql - helper - stry', () => {
	it('space 2', async () => {
		let obj = { hello: 'world' };
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot(`
			"{
			  \\"hello\\": \\"world\\"
			}"
		`);
	});

	it('space 0', async () => {
		let obj = { hello: 'world' };
		let result = stry(obj, 0);
		expect(result).toMatchInlineSnapshot('"{\\"hello\\":\\"world\\"}"');
	});

	it('order a b c', async () => {
		let obj = { a: 1, c: 3, b: 2 };
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot(`
			"{
			  \\"a\\": 1,
			  \\"b\\": 2,
			  \\"c\\": 3
			}"
		`);
	});

	it('order A a', async () => {
		let obj = { A: 'ONE', a: 1 };
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot(`
			"{
			  \\"A\\": \\"ONE\\",
			  \\"a\\": 1
			}"
		`);
	});

	it('order a A', async () => {
		let obj = { a: 1, A: 'ONE' };
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot(`
			"{
			  \\"a\\": 1,
			  \\"A\\": \\"ONE\\"
			}"
		`);
	});

	it('order a b c with nested', async () => {
		let obj = { a: { bb: 22, aa: 11 }, c: 3, b: { aa: 11, bb: 22 } };
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot(`
			"{
			  \\"a\\": {
			    \\"aa\\": 11,
			    \\"bb\\": 22
			  },
			  \\"b\\": {
			    \\"aa\\": 11,
			    \\"bb\\": 22
			  },
			  \\"c\\": 3
			}"
		`);
	});

	it('obj null', async () => {
		let obj = null;
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot('null');
	});

	it('obj undefined', async () => {
		let obj = undefined;
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot('undefined');
	});

	it('obj will null', async () => {
		let obj = { a: null };
		let result = stry(obj);
		expect(result).toMatchInlineSnapshot(`
			"{
			  \\"a\\": null
			}"
		`);
	});
});
