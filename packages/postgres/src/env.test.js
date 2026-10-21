import { describe, expect, it } from 'vitest'

import { setEnvDatabase, setEnvOrigin } from './env.js'

describe('setEnvOrigin', () => {
	it('moves a local ORIGIN to the port, keeps the rest', () => {
		const res = setEnvOrigin("A=1\nORIGIN='http://127.0.0.1:7777'\nB=2\n", 7779)
		expect(res.content).toBe("A=1\nORIGIN='http://127.0.0.1:7779'\nB=2\n")
		expect(res).toMatchObject({ from: 'http://127.0.0.1:7777', to: 'http://127.0.0.1:7779' })
		expect(setEnvOrigin('ORIGIN=http://localhost\n', 5174).content).toBe(
			'ORIGIN=http://localhost:5174\n',
		)
	})

	it('never touches a remote ORIGIN, no change when already there', () => {
		for (const env of [
			'ORIGIN=https://kimbia.app',
			'ORIGIN=http://localhost:7779',
			'X_ORIGIN=http://localhost:1',
		]) {
			expect(setEnvOrigin(env, 7779)).toEqual({ content: env })
		}
	})
})

describe('setEnvDatabase', () => {
	it('switches the db of a url of this server, keeps the rest', () => {
		const env =
			"A=1\nDATABASE_URL='postgres://postgres:example@127.0.0.1:5435/kimbia_app?sslmode=disable'\nB=2\n"
		const res = setEnvDatabase(env, 5435, 'kimbia_app_wt_05')
		expect(res.content).toBe(
			"A=1\nDATABASE_URL='postgres://postgres:example@127.0.0.1:5435/kimbia_app_wt_05?sslmode=disable'\nB=2\n",
		)
		expect(res).toMatchObject({ from: 'kimbia_app', to: 'kimbia_app_wt_05' })
	})

	it('unquoted, localhost, default port', () => {
		const res = setEnvDatabase('DATABASE_URL=postgresql://u@localhost/app\n', 5432, 'app_x')
		expect(res.content).toBe('DATABASE_URL=postgresql://u@localhost/app_x\n')
	})

	it('never touches another server', () => {
		for (const env of [
			"DATABASE_URL='postgres://u:p@db.example.com:5435/app'",
			"DATABASE_URL='postgres://u:p@localhost:5436/app'",
			'OTHER_URL=postgres://u@localhost:5435/app',
			'# DATABASE_URL=postgres://u@localhost:5435/app',
		]) {
			expect(setEnvDatabase(env, 5435, 'x')).toEqual({ content: env })
		}
	})

	it('no change when already there', () => {
		const env = 'DATABASE_URL=postgres://u@localhost:5435/app'
		expect(setEnvDatabase(env, 5435, 'app')).toEqual({ content: env })
	})
})
